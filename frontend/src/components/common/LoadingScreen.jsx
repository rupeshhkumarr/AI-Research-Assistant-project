import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const LoadingScreen = ({ 
  message = "Initializing Intelligence...", 
  subtext = "Waking up your secure AI research servers. Establishing the connection may take a moment." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-7xl mx-auto px-4 w-full">
      <div className="relative flex items-center justify-center w-40 h-40 mb-10">
        {/* Creative animated background glows */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Rotating orbits */}
        <div className="absolute inset-2 rounded-full border-y-4 border-primary-500 animate-[spin_3s_linear_infinite] opacity-80 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        <div className="absolute inset-4 rounded-full border-x-4 border-purple-500 animate-[spin_2s_linear_infinite_reverse] opacity-70 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        <div className="absolute inset-6 rounded-full border-t-4 border-emerald-400 animate-[spin_4s_linear_infinite] opacity-60 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
        
        {/* Core center */}
        <div className="absolute inset-10 rounded-full bg-bg-card/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-inner">
          <BrainCircuit className="w-10 h-10 text-primary-500 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-400 to-emerald-400 mb-4 animate-pulse text-center tracking-wide">
        {message}
      </h2>
      <p className="text-text-muted text-center max-w-md text-sm leading-relaxed font-medium">
        {subtext}
      </p>
    </div>
  );
};
