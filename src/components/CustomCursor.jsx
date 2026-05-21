import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import useStore from '../store/useStore';
import audioEngine from './AudioEngine';
import { getDeviceProfile } from '../utils/deviceProfile';

export default function CustomCursor() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      !window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });
  const trailRef = useRef([]);
  const setMouse = useStore((s) => s.setMouse);
  const springConfig = { damping: 28, stiffness: 280, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const ringX = useSpring(0, { ...springConfig, damping: 20, stiffness: 120 });
  const ringY = useSpring(0, { ...springConfig, damping: 20, stiffness: 120 });

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add('custom-cursor-active');

    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      setMouse((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);

      trailRef.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (trailRef.current.length > 12) trailRef.current.shift();
    };

    const down = () => document.body.classList.add('cursor-click');
    const up = () => document.body.classList.remove('cursor-click');

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      document.body.classList.remove('custom-cursor-active', 'cursor-click');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [enabled, cursorX, cursorY, ringX, ringY, setMouse]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="cosmic-cursor-dot"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="cosmic-cursor-ring"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      />
      <div className="cosmic-cursor-ripple" id="cursor-ripple" />
    </>
  );
}

/** Attach to interactive elements */
export function useCursorHover() {
  return {
    onMouseEnter: () => {
      document.body.classList.add('cursor-hover');
      audioEngine.playHoverTick();
    },
    onMouseLeave: () => document.body.classList.remove('cursor-hover'),
  };
}
