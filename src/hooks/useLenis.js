import { useEffect } from 'react';
import Lenis from 'lenis';
import useStore from '../store/useStore';

export default function useLenis(enabled = true) {
  const setScrollProgress = useStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    let raf;
    const onScroll = ({ scroll, limit }) => {
      const p = limit > 0 ? scroll / limit : 0;
      setScrollProgress(p);
    };

    lenis.on('scroll', onScroll);

    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [enabled, setScrollProgress]);
}
