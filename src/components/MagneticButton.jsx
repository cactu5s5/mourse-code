import React from 'react';
import { motion } from 'framer-motion';
import useMagnetic from '../hooks/useMagnetic';
import { useCursorHover } from './CustomCursor';
import audioEngine from './AudioEngine';

export default function MagneticButton({
  children,
  onClick,
  variant = 'hud',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const { ref, onMouseMove, onMouseLeave, onMouseEnter } = useMagnetic(0.28);
  const cursor = useCursorHover();

  const base =
    variant === 'primary'
      ? 'btn-primary relative z-10'
      : variant === 'ghost'
        ? 'btn-hud opacity-80'
        : 'btn-hud';

  return (
    <motion.button
      ref={ref}
      type={type}
      className={`${base} ${className}`}
      disabled={disabled}
      onClick={(e) => {
        audioEngine.playClickSound();
        onClick?.(e);
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={(e) => {
        onMouseEnter(e);
        cursor.onMouseEnter();
      }}
      onMouseLeave={(e) => {
        onMouseLeave(e);
        cursor.onMouseLeave();
      }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && <span className="btn-energy-trail" aria-hidden />}
    </motion.button>
  );
}
