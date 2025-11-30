
import React, { useState } from 'react';
import { Zap, Coffee, Brain, Skull, BatteryCharging, Smile } from 'lucide-react';

interface DailyVibeCheckProps {
  onVibeSelect: (vibe: string, context: string) => void;
  currentContext: string;
}

const VIBES = [
  {
    id: 'grind',
    label: 'Full Send',
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'group-hover:border-amber-500/50',
    bgHover: 'group-hover:bg-amber-500/10',
    context: 'High energy grind mode. Prioritize difficult tasks, deep work, and speed. No mercy.',
    desc: 'Peak Performance'
  },
  {
    id: 'focus',
    label: 'Locked In',
    icon: Brain,
    color: 'text-violet-400',
    borderColor: 'group-hover:border-violet-500/50',
    bgHover: 'group-hover:bg-violet-500/10',
    context: 'Deep focus mode. Minimal distractions, long work blocks, complex problem solving.',
    desc: 'Flow State'
  },
  {
    id: 'chill',
    label: 'Zen Mode',
    icon: Coffee,
    color: 'text-emerald-400',
    borderColor: 'group-hover:border-emerald-500/50',
    bgHover: 'group-hover:bg-emerald-500/10',
    context: 'Chill productivity. Focus on maintenance tasks, learning, and steady progress. Avoid burnout.',
    desc: 'Steady Pace'
  },
  {
    id: 'low',
    label: 'Cooked',
    icon: Skull,
    color: 'text-zinc-500',
    borderColor: 'group-hover:border-zinc-500/50',
    bgHover: 'group-hover:bg-zinc-500/10',
    context: 'Low energy recovery mode. Prioritize easy wins, admin tasks, and frequent breaks. Survival mode.',
    desc: 'Low Battery'
  }
];

export const DailyVibeCheck: React.FC<DailyVibeCheckProps> = ({ onVibeSelect, currentContext }) => {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  const handleSelect = (vibe: typeof VIBES[0]) => {
    setSelectedVibe(vibe.id);
    onVibeSelect(vibe.label, vibe.context);
  };

  return (
    <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border p-5 space-y-4 relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <BatteryCharging className="w-4 h-4 text-primary animate-pulse" />
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-mono">Energy Calibration</h3>
           </div>
           <p className="text-xs text-zinc-500 font-mono">Select your current status to optimize the algo.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {VIBES.map((vibe) => {
           const isSelected = selectedVibe === vibe.id;
           return (
             <button
               key={vibe.id}
               onClick={() => handleSelect(vibe)}
               className={`
                 group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300
                 ${isSelected 
                    ? `bg-surface-highlight border-${vibe.color.split('-')[1]}-500 shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-[1.02]` 
                    : `bg-black/20 border-transparent ${vibe.borderColor} ${vibe.bgHover} hover:scale-105`
                 }
               `}
             >
               <vibe.icon className={`w-6 h-6 mb-2 transition-colors ${isSelected ? vibe.color : 'text-muted group-hover:text-foreground'}`} />
               <span className={`text-xs font-bold uppercase font-mono transition-colors ${isSelected ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>
                 {vibe.label}
               </span>
               <span className="text-[9px] text-muted/50 font-mono uppercase tracking-wider mt-1 scale-90 opacity-0 group-hover:opacity-100 transition-all">
                  {vibe.desc}
               </span>
               
               {isSelected && (
                 <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
               )}
             </button>
           );
        })}
      </div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none opacity-50"></div>
    </div>
  );
};
