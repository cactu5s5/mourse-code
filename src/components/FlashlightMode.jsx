import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

/** Full-screen flashlight Morse simulation */
export default function FlashlightMode() {
  const { flashlightOn, toggleFlashlight } = useStore();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!flashlightOn) return;
    const onKey = (e) => {
      if (e.key === 'Escape') toggleFlashlight();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flashlightOn, toggleFlashlight]);

  if (!flashlightOn) return null;

  return (
    <div
      ref={overlayRef}
      className="flashlight-overlay fixed inset-0 z-[9000] cursor-pointer"
      onClick={(e) => {
        const el = overlayRef.current;
        if (!el) return;
        el.classList.toggle('flash-on');
        setTimeout(() => el.classList.remove('flash-on'), 120);
      }}
      role="button"
      tabIndex={0}
      aria-label="Tap to flash Morse signal. Press Escape to exit."
    >
      <div className="flashlight-hud font-mono text-center">
        <p className="text-ice/80 text-sm tracking-widest">FLASHLIGHT MODE</p>
        <p className="text-slate-500 text-xs mt-2">Tap screen to pulse · ESC to exit</p>
      </div>
    </div>
  );
}
