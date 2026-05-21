import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import audioEngine from './AudioEngine';

const bootLines = [
  { text: '> ENDURANCE OS v4.2.8 // QUANTUM KERNEL LOADED', delay: 200 },
  { text: '> INITIALIZING CRYPTOGRAPHIC HANDSHAKE...', delay: 400 },
  { text: '> SATELLITE ARRAY SAT-12 LINKED [SECURE]', delay: 600 },
  { text: '> VERIFYING MORSE TRANSLATION ENGINE...', delay: 800 },
  { text: '> ARABIC SIGNAL MAP ✓  [28 CHARS LOADED]', delay: 1000 },
  { text: '> ENGLISH SIGNAL MAP ✓ [26 CHARS LOADED]', delay: 1200 },
  { text: '> NUMERIC MATRIX ✓  [10 DIGITS LOADED]', delay: 1400 },
  { text: '> WEB AUDIO PIPELINE CONNECTED', delay: 1600 },
  { text: '> 3D TELEMETRY CANVAS RENDERING...', delay: 1800 },
  { text: '> OSCILLOSCOPE CALIBRATED AT 700 Hz', delay: 2000 },
  { text: '> ALL SUBSYSTEMS NOMINAL', delay: 2200 },
  { text: '> AWAITING OPERATOR AUTHENTICATION...', delay: 2600 },
];

export default function BootLoader() {
  const { completeBoot, setBootPhase } = useStore();
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    // Progress bar
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1.2;
      });
    }, 30);

    // Terminal lines
    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line.text]);
        setBootPhase(line.text);
        // Auto-scroll terminal
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, line.delay);
    });

    // Show button after last line
    setTimeout(() => setShowButton(true), 3000);

    return () => clearInterval(progressTimer);
  }, []);

  const handleInitiate = () => {
    audioEngine.init();
    audioEngine.resume();
    audioEngine.playBootChime();
    audioEngine.startSoundtrack();
    useStore.getState().setSoundtrackOn(true);

    setIsExiting(true);
    setTimeout(() => completeBoot(), 1200);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ background: '#020406' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.15) 50%)',
            backgroundSize: '100% 4px',
            opacity: 0.2,
          }} />

          <motion.div
            className="w-[90%] max-w-[580px] rounded-2xl border border-ice/20 p-8 relative overflow-hidden"
            style={{ background: 'rgba(10, 15, 25, 0.95)', boxShadow: '0 0 60px rgba(56, 189, 248, 0.08)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{
              background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)'
            }} />

            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-ice animate-pulse shadow-[0_0_8px_#38bdf8]" />
              <h2 className="font-mono text-ice text-sm tracking-[3px] uppercase">
                Endurance Telemetry Terminal
              </h2>
            </div>

            {/* Terminal Output */}
            <div
              ref={terminalRef}
              className="h-[200px] overflow-y-auto mb-6 pr-2 custom-scrollbar"
            >
              {visibleLines.map((line, i) => (
                <motion.p
                  key={i}
                  className="font-mono text-xs leading-6"
                  style={{ color: line.includes('✓') ? '#00ff88' : 'rgba(148, 163, 184, 0.8)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {line}
                </motion.p>
              ))}
              {/* Blinking cursor */}
              <span className="inline-block w-2 h-4 bg-ice/60 animate-pulse ml-1" />
            </div>

            {/* Progress Bar */}
            <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #38bdf8, #22d3ee)',
                  boxShadow: '0 0 12px #38bdf8',
                  width: `${Math.min(progress, 100)}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <p className="font-mono text-[11px] text-slate-500 mb-6 text-center">
              {progress < 100
                ? `LOADING SUBSYSTEMS... ${Math.min(Math.round(progress), 100)}%`
                : 'ALL SYSTEMS NOMINAL. READY FOR DEPLOYMENT.'}
            </p>

            {/* Initiate Button */}
            <AnimatePresence>
              {showButton && progress >= 100 && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={handleInitiate}
                    className="boot-initiate-btn font-mono text-sm tracking-[2px] uppercase px-8 py-3 rounded-lg border border-ice/40 text-ice relative overflow-hidden group transition-all duration-300 hover:border-ice hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]"
                    style={{ background: 'rgba(56, 189, 248, 0.06)' }}
                  >
                    <span className="relative z-10">🌌 Initialize Decoding Station</span>
                    <div className="absolute inset-0 bg-ice/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="fixed inset-0 z-[10000]"
          style={{ background: '#020406' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  );
}
