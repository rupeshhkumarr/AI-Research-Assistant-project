import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

export const VoiceSettings = () => {
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    setRate(parseFloat(localStorage.getItem('voice_rate') || '1'));
    setPitch(parseFloat(localStorage.getItem('voice_pitch') || '1'));
    setVolume(parseFloat(localStorage.getItem('voice_volume') || '100'));
  }, []);

  const handleRateChange = (e) => {
    const val = parseFloat(e.target.value);
    setRate(val);
    localStorage.setItem('voice_rate', val.toString());
  };

  const handlePitchChange = (e) => {
    const val = parseFloat(e.target.value);
    setPitch(val);
    localStorage.setItem('voice_pitch', val.toString());
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    localStorage.setItem('voice_volume', val.toString());
  };

  return (
    <div className="pt-6 border-t border-border mt-2 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
          <Volume2 size={18} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-text-main uppercase tracking-wider">Voice Assistant</h3>
          <p className="text-xs text-text-muted">Customize speech playback settings</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Speed */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-text-main">Voice Speed (Rate)</label>
            <span className="text-sm text-text-muted font-medium">{rate}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
            className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>Slower</span>
            <span>Normal</span>
            <span>Faster</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-text-main">Voice Pitch</label>
            <span className="text-sm text-text-muted font-medium">{pitch}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
            className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>Deeper</span>
            <span>Normal</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-text-main">Voice Volume</label>
            <span className="text-sm text-text-muted font-medium">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-bg-hover rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </div>
    </div>
  );
};
