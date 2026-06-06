import { useState, useRef, useCallback } from 'react';
import { getFallbackResponse } from '../utils/fallbackResponses';

const MAX_RETRY_COUNT = 3;

export const useVoiceRecovery = (speak) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const retryCount = useRef(0);

  const resetRecovery = useCallback(() => {
    retryCount.current = 0;
    setIsRecovering(false);
  }, []);

  const handleRecovery = useCallback((errorCode, language, startListening) => {
    // Map error codes to fallback dictionary types
    let errorType = 'unclear';
    if (errorCode === 'no-speech' || errorCode === 'low-confidence') {
      errorType = 'unclear';
    } else if (errorCode === 'empty-transcript' || errorCode === 'timeout') {
      errorType = 'empty';
    } else if (errorCode === 'audio-capture') {
      errorType = 'audioCapture';
    } else if (errorCode === 'not-allowed' || errorCode === 'permission-denied') {
      errorType = 'notAllowed';
    } else if (errorCode === 'network') {
      errorType = 'network';
    }

    if (retryCount.current >= MAX_RETRY_COUNT) {
      // Max retries reached, stop looping
      const msg = getFallbackResponse('maxRetries', language);
      setIsRecovering(false);
      speak(msg, language, () => {
        resetRecovery();
      });
      return;
    }

    // Trigger recovery speech
    retryCount.current += 1;
    setIsRecovering(true);
    
    const msg = getFallbackResponse(errorType, language);
    
    // Wait slightly before restarting microphone to prevent echo/feedback
    speak(msg, language, () => {
      setTimeout(() => {
        if (retryCount.current <= MAX_RETRY_COUNT && startListening) {
          startListening();
        }
      }, 1500);
    });
  }, [speak, resetRecovery]);

  return {
    isRecovering,
    handleRecovery,
    resetRecovery,
    retryCount: retryCount.current
  };
};
