export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en-US';

  // 1. Detect Pure Hindi via Devanagari Script Regex
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(text)) {
    return 'hi-IN';
  }

  // 2. Detect Hinglish via Keywords in Latin script
  const hinglishKeywords = [
    'kya', 'kaise', 'kyun', 'kaun', 'hai', 'hain', 
    'kar', 'karo', 'bataye', 'batao', 'samjhao',
    'kaha', 'kahan', 'kab', 'nahi', 'haan', 'acha',
    'thik', 'matlab'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const hasHinglish = words.some(word => hinglishKeywords.includes(word));

  if (hasHinglish) {
    return 'en-IN'; // Used for Hinglish in our system
  }

  // 3. Default to English
  return 'en-US';
};
