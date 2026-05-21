import React from 'react';
import { motion } from 'framer-motion';
import audioEngine from './AudioEngine';

const keys = [
  { label: '·', symbol: '.', action: 'insert', desc: 'Dot', cls: 'col-span-1' },
  { label: '—', symbol: '-', action: 'insert', desc: 'Dash', cls: 'col-span-1' },
  { label: 'SPACE', symbol: ' ', action: 'insert', desc: 'Letter gap', cls: 'col-span-1' },
  { label: '/', symbol: ' / ', action: 'insert', desc: 'Word gap', cls: 'col-span-1' },
  { label: '⌫', symbol: '', action: 'backspace', desc: 'Delete', cls: 'col-span-1' },
  { label: '✕', symbol: '', action: 'clear', desc: 'Clear', cls: 'col-span-1' },
];

export default function Keyboard({ inputValue, setInputValue }) {
  const handleAction = (action, symbol) => {
    audioEngine.playClickSound();
    
    if (action === 'insert') {
      if (symbol === '.') audioEngine.playImmediateTone(audioEngine.getUnitDuration());
      else if (symbol === '-') audioEngine.playImmediateTone(audioEngine.getUnitDuration() * 3);
      setInputValue(prev => prev + symbol);
    } else if (action === 'backspace') {
      setInputValue(prev => prev.endsWith(' / ') ? prev.slice(0, -3) : prev.slice(0, -1));
    } else if (action === 'clear') {
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-slate-500 tracking-[2px] uppercase">
        Virtual Keyboard
      </p>
      <div className="grid grid-cols-6 gap-2">
        {keys.map((key, i) => (
          <motion.button
            key={i}
            className={`${key.cls} flex flex-col items-center justify-center py-3 px-2 rounded-lg border border-white/5 font-mono cursor-pointer transition-colors duration-200 hover:border-ice/40 hover:bg-ice/5 active:scale-95`}
            style={{ background: 'rgba(15, 23, 42, 0.5)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleAction(key.action, key.symbol);
            }}
            onMouseEnter={() => audioEngine.playHoverTick()}
          >
            <span className="text-base text-slate-200">{key.label}</span>
            <span className="text-[9px] text-slate-500 mt-0.5">{key.desc}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
