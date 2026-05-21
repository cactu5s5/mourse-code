import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import GlitchText from './GlitchText';
import MagneticButton from './MagneticButton';
import useStore from '../store/useStore';
import { fadeUp, staggerContainer, EASE, DURATION } from '../config/animations';

const MORSE_FLOAT = ['·', '−', '· ·', '− −', '·−', '−·', '···', 'SOS'];

function MorseOrbit() {
  return (
    <div className="morse-orbit-ring" aria-hidden>
      {MORSE_FLOAT.map((sym, i) => (
        <motion.span
          key={i}
          className="morse-orbit-char font-mono text-ice/40"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `rotate(${(360 / MORSE_FLOAT.length) * i}deg) translateY(-140px) rotate(-${(360 / MORSE_FLOAT.length) * i}deg)`,
          }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {sym}
        </motion.span>
      ))}
    </div>
  );
}

function SignalScanner() {
  return (
    <div className="signal-scanner" aria-hidden>
      <div className="scanner-sweep" />
      <div className="scanner-grid" />
    </div>
  );
}

export default function HeroSection() {
  const setHeroEntered = useStore((s) => s.setHeroEntered);
  const rotateQuote = useStore((s) => s.rotateQuote);
  const currentQuote = useStore((s) => s.currentQuote);
  const heroRef = useRef(null);

  useEffect(() => {
    rotateQuote();
    const ctx = gsap.context(() => {
      gsap.from('.hero-light-ray', {
        opacity: 0,
        scaleX: 0,
        duration: 2.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.5,
      });
    }, heroRef);
    return () => ctx.revert();
  }, [rotateQuote]);

  const enterDeck = () => {
    setHeroEntered(true);
    document.getElementById('signal-console')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="hero-cinematic relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="hero-light-ray hero-ray-1" />
      <div className="hero-light-ray hero-ray-2" />
      <SignalScanner />
      <MorseOrbit />

      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={fadeUp} custom={0} className="hero-title font-display font-bold tracking-tight mb-4">
          <GlitchText text="Translate Signals" className="block text-4xl sm:text-6xl lg:text-7xl text-white" delay={0.2} />
          <span className="block text-4xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-ice via-glow to-rim bg-clip-text text-transparent hero-breathe">
            Across Space
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={1}
          className="hero-subtitle font-mono text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-3 tracking-widest uppercase"
        >
          Arabic · English · Morse — bidirectional interstellar transceiver
        </motion.p>

        <motion.blockquote
          variants={fadeUp}
          custom={2}
          className="text-slate-500 italic text-sm max-w-md mx-auto mb-10 border-l border-ice/20 pl-4"
        >
          "{currentQuote}"
        </motion.blockquote>

        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <MagneticButton variant="primary" onClick={enterDeck} className="hero-cta px-10 py-4 text-base">
            ⚡ Enter Signal Deck
          </MagneticButton>
          <MagneticButton variant="hud" onClick={() => document.getElementById('reference-deck')?.scrollIntoView({ behavior: 'smooth' })}>
            Signal Database
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={4}
          className="mt-16 flex justify-center gap-8 text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]"
        >
          <span className="flex items-center gap-2">
            <span className="signal-dot" /> Live
          </span>
          <span>Latency 12ms</span>
          <span>SAT-12 Linked</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: EASE.outExpo }}
      >
        <span className="font-mono text-[10px] text-slate-600 tracking-widest">SCROLL TO DESCEND</span>
      </motion.div>
    </section>
  );
}
