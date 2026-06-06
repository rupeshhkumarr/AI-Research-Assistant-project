import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  
  // We use a ref to hold the current utterance to ensure it is not garbage collected early
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      // Handle dynamically loaded voices (like on Chrome)
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text, langCode = 'en-US', onComplete = null) => {
    if (!window.speechSynthesis) {
       if (onComplete) onComplete();
       return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    if (!text) {
      setIsSpeaking(false);
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Load settings from localStorage
    const rate = parseFloat(localStorage.getItem('voice_rate') || '1');
    const pitch = parseFloat(localStorage.getItem('voice_pitch') || '1');
    const volume = parseFloat(localStorage.getItem('voice_volume') || '100') / 100;
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Pick appropriate voice based on langCode
    if (voices.length > 0) {
      // Direct exact match
      let voice = voices.find(v => v.lang === langCode || v.lang.replace('_', '-') === langCode);
      
      // Partial match
      if (!voice) {
        voice = voices.find(v => v.lang.includes(langCode) || v.lang.replace('_', '-').includes(langCode));
      }
      
      // Fallback logic for Hindi
      if (!voice && langCode === 'hi-IN') {
        voice = voices.find(v => v.lang.toLowerCase().includes('hi'));
      }
      
      // Fallback logic for Indian English
      if (!voice && langCode === 'en-IN') {
        voice = voices.find(v => v.lang.toLowerCase().includes('en'));
      }

      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };
    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isSpeaking, speak, stopSpeaking };
};
