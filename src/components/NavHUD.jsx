import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import MagneticButton from './MagneticButton';

export default function NavHUD() {
  const { toggleSettings, toggleHistory, toggleImmersive, isSoundtrackOn } = useStore();

  return (
    <motion.header
      className="nav-hud glass-panel fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 flex items-center gap-2 sm:gap-4 max-w-[95vw]"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="signal-dot hidden sm:inline-block" />
      <span className="font-mono text-[10px] text-ice tracking-widest hidden md:inline">SIG-DEC</span>
      <div className="w-px h-4 bg-ice/20 hidden sm:block" />
      <MagneticButton variant="ghost" onClick={toggleHistory} className="text-[10px] py-1 px-2">
        History
      </MagneticButton>
      <MagneticButton variant="ghost" onClick={toggleSettings} className="text-[10px] py-1 px-2">
        Config
      </MagneticButton>
      <MagneticButton variant="ghost" onClick={toggleImmersive} className="text-[10px] py-1 px-2">
        ⛶
      </MagneticButton>
      <span className={`font-mono text-[9px] ml-auto ${isSoundtrackOn ? 'text-ice' : 'text-slate-600'}`}>
        {isSoundtrackOn ? '◉ LIVE' : '○ STBY'}
      </span>
    </motion.header>
  );
}
