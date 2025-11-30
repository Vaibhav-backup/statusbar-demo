
import React, { useState } from 'react';
import { SmilePlus, Frown, Meh, Smile, Zap, HeartPulse } from 'lucide-react';

interface MoodTrackerProps {
  onMoodSelect: (mood: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSelect }) => {
  const [mood, setMood] = useState<number | null>(null);

  const moods = [
    { level: 1, icon: Frown, label: 'Down Bad', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/50' },
    { level: 2, icon: Meh, label: 'Mid', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/50' },
    { level: 3, icon: Smile, label: 'Vibing', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
    { level: 4, icon: SmilePlus, label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
    { level: 5, icon: Zap, label: 'God Mode', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' },
  ];

  const handleSelect = (idx: number, label: string) => {
    setMood(idx);
    onMoodSelect(label);
  };

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border p-4 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-pink-500 animate-pulse" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-mono">Mood Logger</h3>
          </div>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${mood !== null ? `${moods[mood].bg} ${moods[mood].color} ${moods[mood].border}` : 'border-transparent text-zinc-600'}`}>
            {mood !== null ? moods[mood].label : 'Waiting for Input'}
          </span>
      </div>
      
      <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5 relative z-10">
        {moods.map((m, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx, m.label)}
            className={`
              relative group p-2 rounded-lg transition-all duration-300 flex items-center justify-center flex-1
              ${mood === idx ? `${m.bg} scale-110 shadow-[0_0_15px_rgba(0,0,0,0.3)] z-10` : 'hover:bg-white/5 hover:scale-105'}
            `}
            title={m.label}
          >
            <m.icon 
                className={`w-5 h-5 transition-colors duration-300 ${mood === idx ? m.color : 'text-muted group-hover:text-zinc-300'}`} 
            />
            {mood === idx && (
                <div className={`absolute inset-0 rounded-lg border ${m.border} opacity-50`}></div>
            )}
            
            {/* Tooltip for unselected */}
            {mood !== idx && (
                <span className="absolute -bottom-6 text-[9px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black px-1 rounded z-20">
                    {m.label}
                </span>
            )}
          </button>
        ))}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none"></div>
    </div>
  );
};
