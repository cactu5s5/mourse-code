import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '../config/animations';

export default function GlitchText({ text, className = '', as: Tag = 'span', delay = 0 }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay('');
    setDone(false);
    let i = 0;
    const chars = '·− /\\|';
    const timer = setInterval(() => {
      if (i < text.length) {
        const glitch = Math.random() > 0.85 ? chars[Math.floor(Math.random() * chars.length)] : text[i];
        setDisplay((prev) => prev + glitch);
        i++;
        if (text[i - 1] === glitch || Math.random() > 0.3) {
          setDisplay(text.slice(0, i));
        }
      } else {
        setDisplay(text);
        setDone(true);
        clearInterval(timer);
      }
    }, 45);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <Tag className={`glitch-text ${done ? 'glitch-settled' : ''} ${className}`}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: DURATION.base, ease: EASE.outExpo }}
      >
        {display}
        {!done && <span className="glitch-cursor">▌</span>}
      </motion.span>
    </Tag>
  );
}
