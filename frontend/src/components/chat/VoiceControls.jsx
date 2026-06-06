import React from 'react';
import { Volume2, Square } from 'lucide-react';

export const VoiceControls = ({ isSpeaking, onStopSpeaking }) => {
  if (!isSpeaking) return null;

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex justify-center z-20">
      <button
        onClick={onStopSpeaking}
        className="bg-bg-card text-text-main hover:bg-bg-hover border border-border rounded-full px-4 py-1.5 flex items-center gap-3 text-sm shadow-xl transition-all"
        title="Stop AI Speaking (Ctrl+Shift+S)"
      >
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-primary-500 animate-pulse" />
          <span className="font-medium text-xs">AI is Speaking...</span>
        </div>
        <div className="w-px h-4 bg-border"></div>
        <div className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500">
          <Square size={12} className="fill-current" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Stop</span>
        </div>
      </button>
    </div>
  );
};
