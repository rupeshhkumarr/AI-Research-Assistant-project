import React from 'react';

export const VoiceIndicator = ({ isSpeaking }) => {
  if (!isSpeaking) return null;

  return (
    <div className="flex items-center gap-1 h-4 w-4 mr-2">
      <div className="w-1 bg-primary-500 rounded-full animate-[bounce_1s_infinite_100ms] h-full"></div>
      <div className="w-1 bg-primary-500 rounded-full animate-[bounce_1s_infinite_300ms] h-3/4"></div>
      <div className="w-1 bg-primary-500 rounded-full animate-[bounce_1s_infinite_500ms] h-full"></div>
    </div>
  );
};
