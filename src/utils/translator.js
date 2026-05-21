import { textToMorseMap, morseToArabicMap, morseToEnglishMap } from './morseDictionary.js';

const textToMorseCache = new Map();
const morseToTextCache = new Map();

export function detectLanguage(text) {
  if (!text) return 'unknown';

  const arabicPattern = /[\u0600-\u06FF]/;
  const englishPattern = /[a-zA-Z]/;

  const hasArabic = arabicPattern.test(text);
  const hasEnglish = englishPattern.test(text);

  if (hasArabic && hasEnglish) {
    return 'mixed';
  } else if (hasArabic) {
    return 'arabic';
  } else if (hasEnglish) {
    return 'english';
  }

  return 'unknown';
}

export function translateTextToMorse(text) {
  if (!text) return '';
  
  if (textToMorseCache.has(text)) {
    return textToMorseCache.get(text);
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/);
  
  const morseWords = words.map(word => {
    const morseLetters = [];
    for (let char of word) {
      const upperChar = char.toUpperCase();
      if (textToMorseMap[upperChar] !== undefined) {
        morseLetters.push(textToMorseMap[upperChar]);
      }
    }
    return morseLetters.join(' ');
  }).filter(word => word.length > 0);

  const result = morseWords.join(' / ');
  textToMorseCache.set(text, result);
  return result;
}

export function translateMorseToText(morse, targetLang = 'english') {
  if (!morse) return '';
  
  const cacheKey = `${morse}_${targetLang}`;
  if (morseToTextCache.has(cacheKey)) {
    return morseToTextCache.get(cacheKey);
  }

  const map = targetLang === 'arabic' ? morseToArabicMap : morseToEnglishMap;
  const morseWords = morse.trim().split(/\s*\/\s*/);
  
  const decodedWords = morseWords.map(word => {
    const letters = word.trim().split(/\s+/);
    const decodedLetters = letters.map(letter => {
      if (map[letter] !== undefined) {
        return map[letter];
      }
      return '';
    });
    return decodedLetters.join('');
  });

  const result = decodedWords.join(' ');
  morseToTextCache.set(cacheKey, result);
  return result;
}
