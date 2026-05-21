import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const INSTAGRAM_URL = 'https://www.instagram.com/203.9.7';

function RadarAnimation() {
  return (
    <div className="space-radar" aria-hidden>
      <div className="radar-sweep" />
      <div className="radar-ring radar-ring-1" />
      <div className="radar-ring radar-ring-2" />
      <div className="radar-blip" />
    </div>
  );
}

export default function Footer() {
  const easterEggUnlocked = useStore((s) => s.easterEggUnlocked);

  return (
    <footer className="site-footer relative py-16 px-6 border-t border-ice/10 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <RadarAnimation />
        <div className="text-center md:text-left">
          <p className="font-mono text-[10px] text-slate-500 tracking-[0.25em] uppercase">
            Endurance Quantum SIG-DEC · Est. 2026
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Bi-directional Arabic & English Morse transceiver
          </p>
          <p className="mt-4 font-display text-sm tracking-wide text-slate-400">
            <span className="text-slate-500">BY </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ice hover:text-glow transition-colors font-semibold"
              aria-label="Cactus on Instagram @203.9.7"
            >
              CACTUS
            </a>
          </p>
          {easterEggUnlocked && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] text-ice/60 mt-2"
            >
              Hidden channel unlocked: ·−·−·− ·−−− ··−·
            </motion.p>
          )}
        </div>
        <div className="flex gap-6 font-mono text-[10px] text-slate-500 tracking-widest">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ice transition-colors"
          >
            INSTAGRAM
          </a>
          <a href="https://github.com" className="hover:text-ice transition-colors" target="_blank" rel="noreferrer">
            GITHUB
          </a>
        </div>
      </div>
    </footer>
  );
}
