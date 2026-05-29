import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs keep the production build working from GitHub Pages,
  // local static servers, and direct dist previews.
  base: '/mourse-code/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
  },
});
