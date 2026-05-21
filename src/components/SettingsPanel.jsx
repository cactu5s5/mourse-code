import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import MagneticButton from './MagneticButton';

const MODES = [
  { id: 'deep', label: 'Deep Space', colors: '#020406' },
  { id: 'dawn', label: 'Cosmic Dawn', colors: '#0c1222' },
  { id: 'void', label: 'Absolute Void', colors: '#000000' },
];

const ACCENTS = [
  { id: 'ice', label: 'Ice', color: '#38bdf8' },
  { id: 'copper', label: 'Copper', color: '#f59e0b' },
  { id: 'signal', label: 'Signal', color: '#00ff88' },
];

export default function SettingsPanel() {
  const {
    showSettings,
    toggleSettings,
    cosmicMode,
    setCosmicMode,
    themeAccent,
    setThemeAccent,
    toggleImmersive,
    toggleFlashlight,
    wpm,
    setWpm,
  } = useStore();

  return (
    <AnimatePresence>
      {showSettings && (
        <>
          <motion.div
            className="fixed inset-0 z-[8000] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
          />
          <motion.aside
            className="settings-panel glass-panel-strong fixed top-0 right-0 z-[8001] h-full w-full max-w-md p-8 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-mono text-ice text-sm tracking-widest">SYSTEM CONFIG</h2>
              <MagneticButton variant="ghost" onClick={toggleSettings}>
                ✕
              </MagneticButton>
            </div>

            <section className="mb-8">
              <h3 className="font-mono text-[10px] text-slate-500 mb-4 tracking-widest">COSMIC MODE</h3>
              <div className="flex flex-col gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`settings-option ${cosmicMode === m.id ? 'active' : ''}`}
                    onClick={() => {
                      setCosmicMode(m.id);
                      document.documentElement.dataset.cosmic = m.id;
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="font-mono text-[10px] text-slate-500 mb-4 tracking-widest">ACCENT THEME</h3>
              <div className="flex gap-3">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`accent-swatch ${themeAccent === a.id ? 'active' : ''}`}
                    style={{ '--swatch': a.color }}
                    onClick={() => {
                      setThemeAccent(a.id);
                      document.documentElement.dataset.accent = a.id;
                    }}
                    title={a.label}
                  />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="font-mono text-[10px] text-slate-500 mb-2 tracking-widest">DEFAULT WPM</h3>
              <input type="range" min="5" max="60" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} />
            </section>

            <div className="flex flex-col gap-3">
              <MagneticButton onClick={toggleImmersive}>⛶ Immersive Mode</MagneticButton>
              <MagneticButton onClick={toggleFlashlight}>🔦 Flashlight Signal</MagneticButton>
            </div>

            <p className="mt-8 font-mono text-[9px] text-slate-600 leading-relaxed">
              Shortcuts: Ctrl+K settings · Ctrl+H history · Ctrl+M mode · Ctrl+L clear · Ctrl+Enter transmit ·
              Ctrl+Shift+E easter egg
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
