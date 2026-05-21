import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    let t = 0;

    const draw = () => {
      t += 0.05;
      ctx.clearRect(0, 0, w, h);
      const bars = 24;
      const bw = w / bars - 2;
      for (let i = 0; i < bars; i++) {
        const amp = active
          ? 0.3 + Math.abs(Math.sin(t + i * 0.4)) * 0.5 + Math.random() * 0.15
          : 0.08 + Math.sin(t * 0.5 + i) * 0.05;
        const bh = amp * h;
        const grad = ctx.createLinearGradient(0, h - bh, 0, h);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(i * (bw + 2), h - bh, bw, bh);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <canvas ref={canvasRef} width={200} height={40} className="w-full h-10 rounded opacity-90" aria-hidden />
  );
}
