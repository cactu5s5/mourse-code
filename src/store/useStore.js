import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const COSMIC_QUOTES = [
  'Love is the one thing that transcends time and space.',
  'Mankind was born on Earth. It was never meant to die here.',
  'Do not go gentle into that good night.',
  'We used to look up at the sky and wonder at our place in the stars.',
  'Time is relative. It can stretch and squeeze.',
  'The universe is not cruel — it is indifferent.',
];

const useStore = create(
  persist(
    (set, get) => ({
      // Boot
      isBooted: false,
      bootProgress: 0,
      bootPhase: 'INITIALIZING',
      setBootProgress: (p) => set({ bootProgress: p }),
      setBootPhase: (phase) => set({ bootPhase: phase }),
      completeBoot: () => set({ isBooted: true }),

      // Scroll / scene reactivity
      scrollProgress: 0,
      setScrollProgress: (v) => set({ scrollProgress: v }),
      mouse: { x: 0, y: 0 },
      setMouse: (x, y) => set({ mouse: { x, y } }),

      // Transceiver
      mode: 'encode',
      toggleMode: () => set((s) => ({ mode: s.mode === 'encode' ? 'decode' : 'encode' })),
      textInput: '',
      morseInput: '',
      setTextInput: (v) => set({ textInput: v }),
      setMorseInput: (v) => set({ morseInput: v }),
      decodeLang: 'english',
      toggleDecodeLang: () =>
        set((s) => ({ decodeLang: s.decodeLang === 'english' ? 'arabic' : 'english' })),

      // Live signal state
      activeSignal: null,
      setActiveSignal: (v) => set({ activeSignal: v }),
      isTransmitting: false,
      setTransmitting: (v) => set({ isTransmitting: v }),

      // Audio
      isSoundtrackOn: false,
      wpm: 20,
      pitch: 700,
      volume: 0.3,
      setSoundtrackOn: (v) => set({ isSoundtrackOn: v }),
      setWpm: (v) => set({ wpm: v }),
      setPitch: (v) => set({ pitch: v }),
      setVolume: (v) => set({ volume: v }),

      // UI panels
      showSettings: false,
      showHistory: false,
      showGuide: true,
      flashlightOn: false,
      immersiveMode: false,
      toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
      toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),
      toggleGuide: () => set((s) => ({ showGuide: !s.showGuide })),
      toggleFlashlight: () => set((s) => ({ flashlightOn: !s.flashlightOn })),
      toggleImmersive: () => {
        const next = !get().immersiveMode;
        if (next) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        set({ immersiveMode: next });
      },

      // Theme / cosmic mode
      cosmicMode: 'deep', // deep | dawn | void
      themeAccent: 'ice',
      setCosmicMode: (m) => set({ cosmicMode: m }),
      setThemeAccent: (t) => set({ themeAccent: t }),

      // History & favorites
      history: [],
      favorites: [],
      addHistory: (entry) =>
        set((s) => ({
          history: [{ ...entry, id: Date.now(), ts: new Date().toISOString() }, ...s.history].slice(0, 50),
        })),
      toggleFavorite: (entry) =>
        set((s) => {
          const exists = s.favorites.find((f) => f.id === entry.id);
          if (exists) return { favorites: s.favorites.filter((f) => f.id !== entry.id) };
          return { favorites: [entry, ...s.favorites].slice(0, 20) };
        }),
      clearHistory: () => set({ history: [] }),

      // Quote
      currentQuote: COSMIC_QUOTES[0],
      rotateQuote: () => {
        const q = COSMIC_QUOTES[Math.floor(Math.random() * COSMIC_QUOTES.length)];
        set({ currentQuote: q });
      },

      // Easter egg
      easterEggCount: 0,
      easterEggUnlocked: false,
      triggerEasterEgg: () => {
        const c = get().easterEggCount + 1;
        set({ easterEggCount: c, easterEggUnlocked: c >= 5 });
      },

      // Hero entered main deck
      heroEntered: false,
      setHeroEntered: (v) => set({ heroEntered: v }),
    }),
    {
      name: 'endurance-morse-store',
      version: 1,
      skipHydration: false,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        history: s.history,
        favorites: s.favorites,
        wpm: s.wpm,
        pitch: s.pitch,
        volume: s.volume,
        cosmicMode: s.cosmicMode,
        themeAccent: s.themeAccent,
      }),
    }
  )
);

export { COSMIC_QUOTES };
export default useStore;
