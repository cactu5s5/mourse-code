import { ASSETS } from '../config/paths.js';

// AAA Procedural Audio Engine
// Synthesizes UI hover clicks, key taps, cosmic sweeps, and Morse signals

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oscNode = null;
    this.oscGain = null;
    this.soundtrack = null;
    this.isReady = false;
    this.wpm = 20;
    this.frequency = 700;
    this.volume = 0.3;
    this.timeouts = [];
    this.isPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Persistent oscillator for Morse signals
    this.oscGain = this.ctx.createGain();
    this.oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.oscGain.connect(this.masterGain);

    this.oscNode = this.ctx.createOscillator();
    this.oscNode.type = 'sine';
    this.oscNode.frequency.setValueAtTime(this.frequency, this.ctx.currentTime);
    this.oscNode.connect(this.oscGain);
    this.oscNode.start();

    this.isReady = true;
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  setWpm(v) { this.wpm = Math.max(5, Math.min(60, v)); }
  setFrequency(v) {
    this.frequency = Math.max(300, Math.min(1200, v));
    if (this.oscNode) this.oscNode.frequency.setValueAtTime(this.frequency, this.ctx.currentTime);
  }
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
  getUnitDuration() { return 1.2 / this.wpm; }

  // ── UI Sound Effects ──────────────────────────────────
  
  playHoverTick() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.015);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playClickSound() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.03);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playCosmicPing() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const fb = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.5, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    delay.delayTime.setValueAtTime(0.35, now);
    fb.gain.setValueAtTime(0.4, now);
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  playBootChime() {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.15);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.15 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.0);
    });
  }

  // ── Morse Transmission ────────────────────────────────

  playImmediateTone(durationSec) {
    if (!this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    this.oscGain.gain.cancelScheduledValues(now);
    this.oscGain.gain.setValueAtTime(0, now);
    this.oscGain.gain.linearRampToValueAtTime(this.volume, now + 0.005);
    this.oscGain.gain.setValueAtTime(this.volume, now + durationSec - 0.005);
    this.oscGain.gain.linearRampToValueAtTime(0, now + durationSec);
  }

  stopMorse() {
    this.isPlaying = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
    if (this.ctx && this.oscGain) {
      const now = this.ctx.currentTime;
      this.oscGain.gain.cancelScheduledValues(now);
      this.oscGain.gain.setValueAtTime(0, now);
    }
  }

  playMorse(morseString, onSignal, onFinished) {
    this.stopMorse();
    this.init();
    this.resume();
    this.isPlaying = true;
    const unit = this.getUnitDuration();
    const now = this.ctx.currentTime;
    let offset = 0.05;
    const events = [];

    for (let i = 0; i < morseString.length; i++) {
      const c = morseString[i];
      if (c === '.') {
        events.push({ type: 'dot', offset, dur: unit });
        offset += unit + unit;
      } else if (c === '-') {
        const dur = unit * 3;
        events.push({ type: 'dash', offset, dur });
        offset += dur + unit;
      } else if (c === ' ') {
        if (morseString[i + 1] !== '/') offset += unit * 2;
      } else if (c === '/') {
        offset += unit * 6;
      }
    }

    events.forEach(e => {
      const s = now + e.offset;
      const end = s + e.dur;
      this.oscGain.gain.setValueAtTime(0, s);
      this.oscGain.gain.linearRampToValueAtTime(this.volume, s + 0.005);
      this.oscGain.gain.setValueAtTime(this.volume, end - 0.005);
      this.oscGain.gain.linearRampToValueAtTime(0, end);

      this.timeouts.push(setTimeout(() => {
        if (this.isPlaying && onSignal) onSignal(e.type, e.dur * 1000);
      }, e.offset * 1000));
    });

    this.timeouts.push(setTimeout(() => {
      this.isPlaying = false;
      if (onFinished) onFinished();
    }, offset * 1000));
  }

  // ── Soundtrack ────────────────────────────────────────
  
  initSoundtrack() {
    if (this.soundtrack) return;
    this.soundtrack = new Audio(ASSETS.soundtrack);
    this.soundtrack.loop = true;
    this.soundtrack.volume = 0;
  }

  startSoundtrack() {
    this.initSoundtrack();
    this.soundtrack.play().then(() => {
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(0.18, vol + 0.005);
        this.soundtrack.volume = vol;
        if (vol >= 0.18) clearInterval(fade);
      }, 40);
    }).catch(() => {});
  }

  stopSoundtrack() {
    if (!this.soundtrack) return;
    let vol = this.soundtrack.volume;
    const fade = setInterval(() => {
      vol = Math.max(0, vol - 0.005);
      this.soundtrack.volume = vol;
      if (vol <= 0) {
        clearInterval(fade);
        this.soundtrack.pause();
      }
    }, 40);
  }
}

// Singleton
export const audioEngine = new AudioEngine();
export default audioEngine;
