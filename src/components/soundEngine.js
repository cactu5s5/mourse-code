export class MorseSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.gainNode = null;
    this.oscillator = null;
    this.wpm = 20;
    this.frequency = 700;
    this.isPlaying = false;
    this.timeouts = [];
    this.volume = 0.3;
  }

  init() {
    if (this.audioCtx) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);
    
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.frequency, this.audioCtx.currentTime);
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
  }

  setWpm(value) {
    this.wpm = Math.max(5, Math.min(60, Number(value)));
  }

  setFrequency(value) {
    this.frequency = Math.max(300, Math.min(1200, Number(value)));
    if (this.oscillator && this.audioCtx) {
      this.oscillator.frequency.setValueAtTime(this.frequency, this.audioCtx.currentTime);
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number(value)));
  }

  getUnitDuration() {
    return 1.2 / this.wpm;
  }

  playImmediateTone(durationSec) {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const now = this.audioCtx.currentTime;
    
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.005);
    this.gainNode.gain.setValueAtTime(this.volume, now + durationSec - 0.005);
    this.gainNode.gain.linearRampToValueAtTime(0, now + durationSec);
  }

  stop() {
    this.isPlaying = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
    
    if (this.audioCtx && this.gainNode) {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
    }
  }

  playMorse(morseString, onSignalActive, onFinished) {
    this.stop();
    this.init();
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    this.isPlaying = true;
    const unit = this.getUnitDuration();
    const now = this.audioCtx.currentTime;
    
    let currentOffset = 0.05;
    const timeEvents = [];

    for (let i = 0; i < morseString.length; i++) {
      const char = morseString[i];
      
      if (char === '.') {
        const duration = unit;
        timeEvents.push({
          type: 'dot',
          timeOffset: currentOffset,
          duration: duration
        });
        currentOffset += duration + unit;
      } else if (char === '-') {
        const duration = unit * 3;
        timeEvents.push({
          type: 'dash',
          timeOffset: currentOffset,
          duration: duration
        });
        currentOffset += duration + unit;
      } else if (char === ' ') {
        const nextChar = morseString[i + 1];
        if (nextChar !== '/') {
          currentOffset += unit * 2;
        }
      } else if (char === '/') {
        currentOffset += unit * 6;
      }
    }

    timeEvents.forEach(event => {
      const start = now + event.timeOffset;
      const end = start + event.duration;
      
      this.gainNode.gain.setValueAtTime(0, start);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, start + 0.005);
      this.gainNode.gain.setValueAtTime(this.volume, end - 0.005);
      this.gainNode.gain.linearRampToValueAtTime(0, end);

      const timeoutId = setTimeout(() => {
        if (this.isPlaying && onSignalActive) {
          onSignalActive(event.type, event.duration * 1000);
        }
      }, event.timeOffset * 1000);
      
      this.timeouts.push(timeoutId);
    });

    const totalDurationMs = currentOffset * 1000;
    const finishTimeoutId = setTimeout(() => {
      this.isPlaying = false;
      if (onFinished) {
        onFinished();
      }
    }, totalDurationMs);
    
    this.timeouts.push(finishTimeoutId);
  }
}
export default MorseSoundEngine;
