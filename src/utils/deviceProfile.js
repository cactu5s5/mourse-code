/** Balance visuals vs stability — GitHub Pages still gets motion */
export function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return defaultProfile(true);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  const lowMemory = navigator.deviceMemory != null && navigator.deviceMemory < 3;

  const lite = reducedMotion || lowMemory || (coarsePointer && narrow);

  return defaultProfile(lite, {
    reducedMotion,
    coarsePointer,
    narrow,
    wide: window.innerWidth >= 1024,
  });
}

function defaultProfile(lite, ctx = {}) {
  const { reducedMotion = false, narrow = false, wide = true } = ctx;

  return {
    lite,
    enable3D: !reducedMotion,
    enableLenis: !reducedMotion && !ctx.coarsePointer,
    enablePostFX: !lite && !narrow,
    enableShip: !reducedMotion,
    enablePlanets: !lite && !reducedMotion,
    starCount: lite ? 1800 : narrow ? 2800 : 3500,
    dustCount: lite ? 300 : narrow ? 500 : 700,
    bloomIntensity: lite ? 0.22 : 0.38,
  };
}
