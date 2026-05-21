import React, { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BootLoader from './components/BootLoader';
import CosmicUniverse from './components/three/CosmicUniverse';
import CustomCursor from './components/CustomCursor';
import HeroSection from './components/HeroSection';
import SignalConsole from './components/SignalConsole';
import NavHUD from './components/NavHUD';
import AudioHUD from './components/AudioHUD';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import FlashlightMode from './components/FlashlightMode';
import Footer from './components/Footer';
import useStore from './store/useStore';
import useLenis from './hooks/useLenis';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { translateTextToMorse } from './utils/translator';
import { MorseSoundEngine } from './components/soundEngine.js';
import audioEngine from './components/AudioEngine';

const soundEngine = new MorseSoundEngine();
const LearningPanelLazy = lazy(() => import('./components/LearningPanel'));

export default function App() {
  const isBooted = useStore((s) => s.isBooted);
  const { wpm, pitch, volume, setWpm, setPitch, setVolume, themeAccent, cosmicMode } = useStore();

  useLenis(isBooted);

  useEffect(() => {
    document.documentElement.dataset.accent = themeAccent;
    document.documentElement.dataset.cosmic = cosmicMode;
  }, [themeAccent, cosmicMode]);

  useEffect(() => {
    soundEngine.setWpm(wpm);
    audioEngine.setWpm(wpm);
  }, [wpm]);

  useEffect(() => {
    soundEngine.setFrequency(pitch);
    audioEngine.setFrequency(pitch);
  }, [pitch]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  const handleTransmit = () => {
    const { mode, textInput, morseInput } = useStore.getState();
    const morse = mode === 'encode' ? translateTextToMorse(textInput) : morseInput;
    if (!morse?.trim()) return;
    useStore.getState().setTransmitting(true);
    soundEngine.playMorse(morse, () => {}, () => useStore.getState().setTransmitting(false));
  };

  const handleStop = () => {
    soundEngine.stop();
    audioEngine.stopMorse();
    useStore.getState().setTransmitting(false);
  };

  useKeyboardShortcuts(handleTransmit, handleStop);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isBooted && <BootLoader key="boot" />}
      </AnimatePresence>

      {isBooted && (
        <motion.div
          className="app-shell relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <CosmicUniverse />
          <CustomCursor />
          <NavHUD />
          <AudioHUD />
          <SettingsPanel />
          <HistoryPanel />
          <FlashlightMode />

          <main className="relative z-10">
            <HeroSection />

            <div className="transceiver-station-wrapper max-w-7xl mx-auto px-4 sm:px-6 pb-24">
              <SignalConsole soundEngine={soundEngine} />

              <motion.section
                id="reference-deck"
                className="deck-panel glass-panel p-6 mt-8"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <Suspense fallback={<div className="skeleton-loader h-64 rounded-lg" />}>
                  <LearningPanelLazy soundEngine={soundEngine} onTriggerPulse={() => {}} />
                </Suspense>
              </motion.section>
            </div>

            <Footer />
          </main>
        </motion.div>
      )}
    </>
  );
}
