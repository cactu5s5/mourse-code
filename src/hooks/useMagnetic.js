import { useRef, useCallback } from 'react';

/** Magnetic hover — cursor attraction for premium buttons */
export default function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    requestAnimationFrame(() => {
      if (el) el.style.transition = '';
    });
  }, []);

  const onMouseEnter = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transition = 'transform 0.15s ease-out';
  }, []);

  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}
