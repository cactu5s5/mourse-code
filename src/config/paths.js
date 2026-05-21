/** Public asset URLs — respect Vite base path for GitHub Pages */
export const BASE = import.meta.env.BASE_URL;

export const ASSETS = {
  soundtrack: `${BASE}ost.weba`,
  enduranceModel: `${BASE}interstellar__endurance_high_fidelity.glb`,
};
