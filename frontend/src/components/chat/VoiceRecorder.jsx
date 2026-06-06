import React from 'react';
import { Mic } from 'lucide-react';
import { cn } from '../../utils/cn';

export const VoiceRecorder = ({ isListening, onStart, onStop, disabled, error }) => {
  return (
    <div className="relative flex items-center justify-center">
      {isListening && !error && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={isListening ? onStop : onStart}
        className={cn(
          "p-2.5 rounded-full transition-all duration-300 relative z-10 border",
          error 
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : isListening 
              ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20" 
              : "bg-bg-hover text-text-muted border-border hover:text-text-main hover:border-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        title={isListening ? "Stop Listening (Esc)" : "Start Voice Input (Ctrl+M)"}
      >
        {isListening ? (
          <div className="relative">
            <Mic size={18} className="animate-pulse" />
          </div>
        ) : (
          <Mic size={18} />
        )}
      </button>
    </div>
  );
};
