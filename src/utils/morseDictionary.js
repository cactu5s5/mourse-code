export const arabicMorse = {
  'ا': '.-',
  'ب': '-...',
  'ت': '-',
  'ث': '-.-.',
  'ج': '.---',
  'ح': '....',
  'خ': '---',
  'د': '..-',
  'ذ': '--..',
  'ر': '.-.',
  'ز': '---.',
  'س': '...',
  'ش': '----',
  'ص': '-..-',
  'ض': '...-',
  'ط': '..-',
  'ظ': '-.--',
  'ع': '.-.-',
  'غ': '---.',
  'ف': '..-.',
  'ق': '--.-',
  'ك': '-.-',
  'ل': '.-..',
  'م': '--',
  'ن': '-.',
  'ه': '..-..',
  'و': '.--',
  'ي': '..'
};

export const englishMorse = {
  'A': '.-',
  'B': '-...',
  'C': '-.-.',
  'D': '-..',
  'E': '.',
  'F': '..-.',
  'G': '--.',
  'H': '....',
  'I': '..',
  'J': '.---',
  'K': '-.-',
  'L': '.-..',
  'M': '--',
  'N': '-.',
  'O': '---',
  'P': '.--.',
  'Q': '--.-',
  'R': '.-.',
  'S': '...',
  'T': '-',
  'U': '..-',
  'V': '...-',
  'W': '.--',
  'X': '-..-',
  'Y': '-.--',
  'Z': '--..'
};

export const numbersMorse = {
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '0': '-----'
};

export const symbolsMorse = {
  '?': '..--..',
  '!': '-.-.--',
  ',': '--..--',
  ';': '-.-.-.',
  ':': '---...',
  '*': '.-.-.',
  '-': '-....-',
  '/': '-..-.',
  '=': '-...-',
  '.': '.-.-.-',
  '(': '-.--.-',
  ')': '-.--.-',
  '@': '.--.-.'
};

export const textToMorseMap = {
  ...arabicMorse,
  ...englishMorse,
  ...numbersMorse,
  ...symbolsMorse
};

function buildReverseMap(primaryMap) {
  const reverse = {};
  for (const [char, morse] of Object.entries(primaryMap)) {
    if (!reverse[morse]) {
      reverse[morse] = char;
    }
  }
  return reverse;
}

export const morseToArabicMap = {
  ...buildReverseMap(arabicMorse),
  ...buildReverseMap(numbersMorse),
  ...buildReverseMap(symbolsMorse)
};

export const morseToEnglishMap = {
  ...buildReverseMap(englishMorse),
  ...buildReverseMap(numbersMorse),
  ...buildReverseMap(symbolsMorse)
};
