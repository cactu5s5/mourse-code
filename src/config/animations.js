/** Shared motion tokens — Apple / Linear style easing */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  spring: [0.34, 1.56, 0.64, 1],
  cinematic: [0.22, 1, 0.36, 1],
};

export const DURATION = {
  fast: 0.2,
  base: 0.45,
  slow: 0.9,
  hero: 1.4,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: DURATION.slow, ease: EASE.outExpo },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

export const glassReveal = {
  hidden: { opacity: 0, scale: 0.96, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: DURATION.slow, ease: EASE.outExpo },
  },
};
