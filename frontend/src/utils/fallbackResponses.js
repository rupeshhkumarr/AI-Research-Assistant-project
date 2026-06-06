// Randomized fallback responses for various recognition error scenarios

export const getFallbackResponse = (type, language) => {
  const responses = {
    // General unclear or no-speech
    unclear: {
      'en-US': [
        "I didn't understand what you said. Could you please say that again?",
        "Sorry, I missed that. Please speak again.",
        "I couldn't understand your voice clearly. Please try again.",
        "Could you repeat that once more?",
        "Sorry, I didn't catch that.",
        "I may have missed part of what you said. Please repeat."
      ],
      'hi-IN': [
        "माफ़ कीजिए, मैं आपकी बात समझ नहीं पाया। कृपया दोबारा बोलिए।",
        "मुझे आपकी बात साफ़ सुनाई नहीं दी। कृपया फिर से बोलिए।",
        "क्षमा कीजिए, क्या आप दोबारा बोल सकते हैं?",
        "मैं समझ नहीं पाया, कृपया फिर से बताइए।",
        "कृपया एक बार फिर बोलिए।"
      ],
      'en-IN': [
        "Sorry, main samajh nahi paya. Please dobara boliye.",
        "Mujhe aapki baat clear nahi sunai di. Ek baar aur boliye.",
        "Please repeat kijiye.",
        "Main samajh nahi paya. Dobara bol sakte hain?",
        "Sorry, voice clear nahi thi. Ek baar phir boliye."
      ]
    },
    // Empty Transcript
    empty: {
      'en-US': ["I couldn't hear anything. Please speak again."],
      'hi-IN': ["मुझे कुछ सुनाई नहीं दिया। कृपया दोबारा बोलिए।"],
      'en-IN': ["Mujhe kuch sunai nahi diya. Please dobara boliye."]
    },
    // Microphone Error
    audioCapture: {
      'en-US': ["Microphone is not available."],
      'hi-IN': ["माइक्रोफोन उपलब्ध नहीं है।"],
      'en-IN': ["Microphone available nahi hai."]
    },
    // Permission Denied
    notAllowed: {
      'en-US': ["Please allow microphone access."],
      'hi-IN': ["कृपया माइक्रोफोन एक्सेस की अनुमति दें।"],
      'en-IN': ["Please microphone access allow karein."]
    },
    // Network Error
    network: {
      'en-US': ["Network issue occurred. Please try again."],
      'hi-IN': ["नेटवर्क की समस्या आ रही है। कृपया फिर से प्रयास करें।"],
      'en-IN': ["Network issue aa raha hai. Please try again."]
    },
    // Max Retries Reached
    maxRetries: {
      'en-US': ["I'm having trouble understanding. Please try again later."],
      'hi-IN': ["मुझे समझने में कठिनाई हो रही है। कृपया बाद में प्रयास करें।"],
      'en-IN': ["Mujhe samajhne me problem ho rahi hai. Please baad me try karein."]
    }
  };

  const pool = responses[type] || responses.unclear;
  const langPool = pool[language] || pool['en-US'];
  
  return langPool[Math.floor(Math.random() * langPool.length)];
};
