import { useEffect } from 'react';
import Lenis from 'lenis';
import useStore from '../store/useStore';
import { getDeviceProfile } from '../utils/deviceProfile';

export default function useLenis(enabled = true) {
  const setScrollProgress = useStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (!enabled) return;

    const { enableLenis } = getDeviceProfile();
    if (!enableLenis) {
      const onNativeScroll = () => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        const p = limit > 0 ? window.scrollY / limit : 0;
        setScrollProgress(Math.min(1, Math.max(0, p)));
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      onNativeScroll();
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

    let lenis;
    let raf;
    try {
      lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true,
        touchMultiplier: 1.2,
      });

      lenis.on('scroll', ({ scroll, limit }) => {
        const p = limit > 0 ? scroll / limit : 0;
        setScrollProgress(Math.min(1, Math.max(0, p)));
      });

      const loop = (time) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } catch (err) {
      console.warn('[Lenis]', err);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, [enabled, setScrollProgress]);
}
