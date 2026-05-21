import React, { useEffect, useRef } from 'react';

export default function Oscilloscope({ audioEngine }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const sweepRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const r = canvas.parentNode.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr;
      canvas.height = (r.height || 150) * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      // Fade trail
      ctx.fillStyle = 'rgba(3, 7, 18, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // Waveform
      const t = Date.now() * 0.003;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;

      if (audioEngine?.isPlaying) {
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const freq = 0.04 + Math.sin(t * 0.5) * 0.01;
          let y = Math.sin(x * freq + t * 2) * (h * 0.35);
          y += Math.sin(x * 0.08 + t * 3) * (h * 0.08);
          y += (Math.random() - 0.5) * 3;
          if (x === 0) ctx.moveTo(x, h / 2 + y);
          else ctx.lineTo(x, h / 2 + y);
        }
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          let y = Math.sin(x * 0.012 + t) * 5;
          y += (Math.random() - 0.5) * 0.8;
          if (x === 0) ctx.moveTo(x, h / 2 + y);
          else ctx.lineTo(x, h / 2 + y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Sweep
      sweepRef.current = (sweepRef.current + 1.5) % w;
      const grad = ctx.createLinearGradient(sweepRef.current - 25, 0, sweepRef.current + 25, 0);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.06)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sweepRef.current - 25, 0, 50, h);

      animRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [audioEngine]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-ice/10" style={{ background: 'rgba(3,7,18,0.85)', height: '140px', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}>
      <div className="absolute top-2 left-3 font-mono text-[10px] text-ice/40 tracking-wider pointer-events-none z-10">
        SIGNAL MONITOR // LIVE
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
