import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

export const useSpeechRecognition = (onResult, onError) => {
  const { addToast } = useAppContext();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);
  
  const retryCount = useRef(0);
  const maxRetries = 3;
  const timeoutRef = useRef(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'en-IN'; 
        
        reco.onstart = () => {
          setIsListening(true);
          setError(null);
          
          // Start 15 second timeout to give user more time to speak
          clearTimer();
          timeoutRef.current = setTimeout(() => {
            reco.stop();
            const errMsg = 'timeout';
            setError(errMsg);
            if (onError) onError(errMsg);
          }, 15000);
        };
        
        reco.onresult = (event) => {
          clearTimer();
          const result = event.results[0][0];
          let transcript = result.transcript;
          const confidence = result.confidence;
          
          console.log("=== Recognition Debug ===");
          console.log("Transcript:", transcript);
          console.log("Confidence:", confidence);
          console.log("=========================");
          
          if (transcript) {
            transcript = transcript.trim().replace(/\s+/g, ' ');
            const words = transcript.split(' ');
            const cleanWords = words.filter((word, pos, arr) => pos === 0 || word.toLowerCase() !== arr[pos - 1].toLowerCase());
            transcript = cleanWords.join(' ');
          }

          if (!transcript || transcript.trim() === '') {
            const errMsg = 'empty-transcript';
            setError(errMsg);
            if (onError) onError(errMsg);
            return;
          }

          // We removed ALL confidence checks to ensure we never drop a transcript.
          // If the browser heard something, we trust it and let the AI backend figure it out!
          
          if (onResult) onResult(transcript);
        };
        
        reco.onerror = (event) => {
          clearTimer();
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          
          const errorType = event.error;
          setError(errorType);
          
          if (errorType === 'not-allowed') {
            addToast('Microphone permission denied.', 'error');
            if (onError) onError(errorType);
          } else if (errorType === 'no-speech' || errorType === 'audio-capture' || errorType === 'network') {
            if (onError) onError(errorType);
          } else if (errorType !== 'aborted') {
            addToast(`Speech recognition error: ${errorType}`, 'error');
            if (onError) onError(errorType);
          }
        };
        
        reco.onend = () => {
          if (!timeoutRef.current) {
            setIsListening(false);
          }
        };
        
        setRecognition(reco);
      } else {
        setError("Speech recognition is not supported in this browser.");
      }
    }
    
    return () => clearTimer();
  }, [onResult, onError, addToast]);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        retryCount.current = 0;
        setError(null);
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      addToast('Speech recognition not supported in your browser.', 'error');
    }
  }, [recognition, addToast]);

  const stopListening = useCallback(() => {
    if (recognition) {
      clearTimer();
      retryCount.current = 0;
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { isListening, startListening, stopListening, error, setError, isSupported: !!recognition };
};
