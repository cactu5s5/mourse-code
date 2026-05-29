import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { translateTextToMorse, translateMorseToText, detectLanguage } from '../utils/translator';
import MagneticButton from './MagneticButton';
import MorsePulseViz from './MorsePulseViz';
import Oscilloscope from './Oscilloscope';
import Keyboard from './Keyboard';
import audioEngine from './AudioEngine';
import { glassReveal, fadeUp } from '../config/animations';

export default function SignalConsole() {
  const {
    mode,
    toggleMode,
    textInput,
    morseInput,
    setTextInput,
    setMorseInput,
    decodeLang,
    toggleDecodeLang,
    wpm,
    pitch,
    setWpm,
    setPitch,
    isTransmitting,
    pulseIndex,
    transmit,
    stopTransmission,
  } = useStore();

  const [detectedLang, setDetectedLang] = useState('unknown');
  const [copied, setCopied] = useState(false);

  const encodedMorse = useMemo(() => translateTextToMorse(textInput), [textInput]);
  const decodedText = useMemo(
    () => translateMorseToText(morseInput, decodeLang),
    [morseInput, decodeLang]
  );
  const displayMorse = mode === 'encode' ? encodedMorse : morseInput;
  const displayText = mode === 'encode' ? textInput : decodedText;

  useEffect(() => {
    if (mode === 'encode') setDetectedLang(detectLanguage(textInput));
  }, [textInput, mode]);

  const handleCopy = async () => {
    const text = mode === 'encode' ? encodedMorse : decodedText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    audioEngine.playCosmicPing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (mode === 'encode') setTextInput('');
    else setMorseInput('');
    audioEngine.playClickSound();
  };

  const handleDownload = () => {
    const content = mode === 'encode' ? encodedMorse : decodedText;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `signal-${Date.now()}.txt`;
    a.click();
    audioEngine.playClickSound();
  };

  const handleShare = async () => {
    const text = mode === 'encode' ? encodedMorse : decodedText;
    if (navigator.share) {
      await navigator.share({ title: 'Endurance Signal', text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    }
  };

  return (
    <motion.section
      id="signal-console"
      className="signal-console glass-panel-strong p-6 sm:p-8 mb-8"
      variants={glassReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="signal-dot-ice" />
          <h2 className="font-mono text-sm tracking-[0.2em] text-ice uppercase">
            Signal Encoder & Decoder
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <MagneticButton variant="hud" onClick={toggleMode} className="text-xs">
            🔁 {mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
          </MagneticButton>
          {mode === 'decode' && (
            <MagneticButton variant="ghost" onClick={toggleDecodeLang} className="text-xs">
              Lang: {decodeLang.toUpperCase()}
            </MagneticButton>
          )}
        </div>
      </div>

      <MorsePulseViz morseString={displayMorse} activeIndex={pulseIndex} />

      <div className="translator-grid mt-6">
        {mode === 'encode' ? (
          <div className="translation-box">
            <div className="input-header flex justify-between items-center mb-2">
              <label className="font-mono text-[10px] text-slate-500 tracking-widest">TEXT INPUT</label>
              <span className={`lang-badge lang-${detectedLang}`}>{detectedLang.toUpperCase()}</span>
            </div>
            <div className="terminal-input-wrap">
              <textarea
                className="terminal-textarea"
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  if (e.target.value.length % 3 === 0) audioEngine.playHoverTick();
                }}
                placeholder="Enter English or Arabic transmission..."
                dir="auto"
                spellCheck={false}
              />
              <div className="scan-line" />
            </div>
            <div className="output-panel mt-4">
              <span className="output-label">MORSE OUTPUT</span>
              <div className="output-text morse-output-glow">{encodedMorse || '· · ·   − − −   · · ·'}</div>
            </div>
          </div>
        ) : (
          <div className="translation-box">
            <div className="input-header flex justify-between items-center mb-2">
              <label className="font-mono text-[10px] text-slate-500 tracking-widest">MORSE INPUT</label>
            </div>
            <div className="terminal-input-wrap">
              <textarea
                className="terminal-textarea morse-input-area"
                value={morseInput}
                onChange={(e) => setMorseInput(e.target.value)}
                placeholder="··· −−− ···  (spaces between letters, / between words)"
                spellCheck={false}
              />
              <div className="scan-line" />
            </div>
            <div className="output-panel mt-4">
              <span className="output-label">DECODED TEXT</span>
              <div className="output-text text-glow-secondary" dir="auto">
                {decodedText || '—'}
              </div>
            </div>
          </div>
        )}

        <div className="signal-settings flex flex-col gap-4">
          <div className="control-group">
            <div className="control-label flex justify-between font-mono text-[10px] text-slate-500">
              <span>TRANSMISSION SPEED</span>
              <span className="text-ice">{wpm} WPM</span>
            </div>
            <input type="range" min="5" max="60" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} />
          </div>
          <div className="control-group">
            <div className="control-label flex justify-between font-mono text-[10px] text-slate-500">
              <span>SIGNAL TONE</span>
              <span className="text-ice">{pitch} Hz</span>
            </div>
            <input type="range" min="300" max="1200" step="50" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
          </div>
          <div className="action-strip flex flex-wrap gap-2 mt-auto">
            <MagneticButton variant="primary" onClick={transmit} disabled={isTransmitting}>
              ⚡ Transmit
            </MagneticButton>
            <MagneticButton onClick={stopTransmission} disabled={!isTransmitting}>
              Stop
            </MagneticButton>
            <MagneticButton onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</MagneticButton>
            <MagneticButton onClick={handleClear}>Clear</MagneticButton>
            <MagneticButton onClick={handleDownload}>↓ TXT</MagneticButton>
            <MagneticButton onClick={handleShare}>Share</MagneticButton>
          </div>
        </div>

        <Oscilloscope audioEngine={audioEngine} />
        <Keyboard
          inputValue={mode === 'encode' ? textInput : morseInput}
          setInputValue={mode === 'encode' ? setTextInput : setMorseInput}
        />
      </div>
    </motion.section>
  );
}
