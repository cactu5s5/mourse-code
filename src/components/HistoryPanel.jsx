import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import MagneticButton from './MagneticButton';

export default function HistoryPanel() {
  const { showHistory, toggleHistory, history, favorites, toggleFavorite, clearHistory } = useStore();

  return (
    <AnimatePresence>
      {showHistory && (
        <>
          <motion.div
            className="fixed inset-0 z-[8000] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleHistory}
          />
          <motion.aside
            className="history-panel glass-panel-strong fixed top-0 left-0 z-[8001] h-full w-full max-w-md p-8 overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-ice text-sm tracking-widest">SIGNAL LOG</h2>
              <div className="flex gap-2">
                <MagneticButton variant="ghost" onClick={clearHistory} className="text-[10px]">
                  Clear
                </MagneticButton>
                <MagneticButton variant="ghost" onClick={toggleHistory}>
                  ✕
                </MagneticButton>
              </div>
            </div>

            <h3 className="font-mono text-[10px] text-slate-500 mb-3">FAVORITES</h3>
            {favorites.length === 0 ? (
              <p className="text-slate-600 text-sm mb-6">No favorites yet.</p>
            ) : (
              <ul className="space-y-2 mb-8">
                {favorites.map((e) => (
                  <li key={e.id} className="history-item">
                    <span className="text-[10px] text-ice">{e.mode}</span>
                    <p className="font-mono text-xs truncate">{e.output}</p>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="font-mono text-[10px] text-slate-500 mb-3">RECENT</h3>
            <ul className="space-y-2">
              {history.length === 0 ? (
                <p className="text-slate-600 text-sm">No transmissions logged.</p>
              ) : (
                history.map((e) => (
                  <li key={e.id} className="history-item group">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500">{new Date(e.ts).toLocaleTimeString()}</span>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-ice text-xs"
                        onClick={() => toggleFavorite({ ...e, id: e.id })}
                      >
                        ★
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-400 truncate">{e.input}</p>
                    <p className="font-mono text-xs text-ice truncate">{e.output}</p>
                  </li>
                ))
              )}
            </ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
