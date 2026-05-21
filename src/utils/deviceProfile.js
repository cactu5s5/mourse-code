/** Detect lite mode — GitHub Pages, mobile, low power, reduced motion */
export function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return { lite: true, enable3D: false, enableLenis: false };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const smallScreen = window.innerWidth < 900;
  const lowMemory = navigator.deviceMemory != null && navigator.deviceMemory < 4;
  const isGitHubPages = window.location.hostname.includes('github.io');

  const lite = reducedMotion || coarsePointer || smallScreen || lowMemory || isGitHubPages;

  return {
    lite,
    enable3D: !reducedMotion,
    enableLenis: !reducedMotion && !coarsePointer,
    enablePostFX: !lite,
    enableShip: !lite && !smallScreen,
    starCount: lite ? 1200 : 2500,
    dustCount: lite ? 200 : 500,
  };
}
