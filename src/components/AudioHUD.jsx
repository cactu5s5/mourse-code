import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import audioEngine from './AudioEngine';
import MagneticButton from './MagneticButton';
import AudioVisualizer from './AudioVisualizer';

export default function AudioHUD() {
  const { isSoundtrackOn, setSoundtrackOn, volume, setVolume, isTransmitting } = useStore();

  const toggleMusic = () => {
    if (!isSoundtrackOn) {
      audioEngine.startSoundtrack();
      setSoundtrackOn(true);
    } else {
      audioEngine.stopSoundtrack();
      setSoundtrackOn(false);
    }
  };

  return (
    <motion.div
      className="audio-hud glass-panel fixed bottom-6 right-6 z-50 p-4 w-56"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="font-mono text-[9px] text-slate-500 tracking-widest mb-3 uppercase">Audio Matrix</p>
      <AudioVisualizer active={isSoundtrackOn || isTransmitting} />
      <div className="flex gap-2 mt-3">
        <MagneticButton
          variant={isSoundtrackOn ? 'primary' : 'hud'}
          onClick={toggleMusic}
          className="flex-1 text-[10px] py-2"
        >
          {isSoundtrackOn ? '◉ OST' : '○ OST'}
        </MagneticButton>
      </div>
      <div className="mt-3">
        <label className="font-mono text-[9px] text-slate-600 flex justify-between mb-1">
          <span>VOL</span>
          <span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            audioEngine.setVolume(v);
          }}
        />
      </div>
    </motion.div>
  );
}
