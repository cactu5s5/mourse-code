import { useEffect } from 'react';
import useStore from '../store/useStore';
import audioEngine from '../components/AudioEngine';

export default function useKeyboardShortcuts(onTransmit, onStop) {
  const {
    toggleMode,
    toggleSettings,
    toggleHistory,
    toggleFlashlight,
    toggleImmersive,
    setTextInput,
    setMorseInput,
    textInput,
    morseInput,
    mode,
    triggerEasterEgg,
    rotateQuote,
  } = useStore();

  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;

      // Secret: type ...---... (SOS) anywhere
      if (e.key === '.' && !mod) return;

      if (mod && e.key === 'k') {
        e.preventDefault();
        toggleSettings();
      }
      if (mod && e.key === 'h') {
        e.preventDefault();
        toggleHistory();
      }
      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toggleFlashlight();
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onTransmit?.();
      }
      if (e.key === 'Escape') {
        onStop?.();
        useStore.getState().toggleSettings();
        if (useStore.getState().showHistory) useStore.getState().toggleHistory();
      }
      if (mod && e.key === 'l') {
        e.preventDefault();
        const v = mode === 'encode' ? textInput : morseInput;
        useStore.getState().setTextInput('');
        useStore.getState().setMorseInput('');
        audioEngine.playClickSound();
      }
      if (mod && e.key === 'm') {
        e.preventDefault();
        toggleMode();
        audioEngine.playHoverTick();
      }
      if (mod && e.key === 'i') {
        e.preventDefault();
        toggleImmersive();
      }
      // Easter egg: Ctrl+Shift+E
      if (mod && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        triggerEasterEgg();
        rotateQuote();
        audioEngine.playCosmicPing();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    toggleMode,
    toggleSettings,
    toggleHistory,
    toggleFlashlight,
    toggleImmersive,
    onTransmit,
    onStop,
    textInput,
    morseInput,
    mode,
    triggerEasterEgg,
    rotateQuote,
  ]);
}
