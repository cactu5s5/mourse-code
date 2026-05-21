import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function MorsePulseViz({ morseString, activeIndex = -1 }) {
  const isTransmitting = useStore((s) => s.isTransmitting);
  const activeSignal = useStore((s) => s.activeSignal);

  const symbols = useMemo(() => {
    if (!morseString) return [];
    return morseString.split('').filter((c) => c === '.' || c === '-');
  }, [morseString]);

  return (
    <div className="morse-pulse-viz" aria-label="Morse signal visualization">
      <div className="pulse-wave-bg" />
      <div className="flex flex-wrap gap-2 justify-center min-h-[48px] items-center p-4">
        <AnimatePresence mode="popLayout">
          {symbols.length === 0 ? (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="font-mono text-xs text-slate-600 tracking-widest"
            >
              AWAITING SIGNAL...
            </motion.span>
          ) : (
            symbols.slice(0, 80).map((sym, i) => {
              const isActive =
                isTransmitting && (activeIndex === i || activeSignal === sym);
              return (
                <motion.span
                  key={`${i}-${sym}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    opacity: 1,
                    boxShadow: isActive
                      ? '0 0 24px rgba(56,189,248,0.8), 0 0 48px rgba(34,211,238,0.4)'
                      : '0 0 8px rgba(56,189,248,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`morse-pulse-char ${sym === '.' ? 'is-dot' : 'is-dash'} ${isActive ? 'is-active' : ''}`}
                >
                  {sym}
                </motion.span>
              );
            })
          )}
        </AnimatePresence>
      </div>
      {isTransmitting && <div className="transmission-radar-sweep" />}
    </div>
  );
}
