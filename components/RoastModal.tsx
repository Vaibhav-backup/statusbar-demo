
import React from 'react';
import { Flame, X, Skull } from 'lucide-react';
import { Button } from './Button';

interface RoastModalProps {
  roast: string;
  onClose: () => void;
}

export const RoastModal: React.FC<RoastModalProps> = ({ roast, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-red-950/20 w-full max-w-md rounded-3xl border-2 border-red-500/50 shadow-[0_0_100px_rgba(220,38,38,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        <div className="p-8 text-center space-y-6 relative z-10">
            <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-bounce">
                <Skull className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold font-mono text-red-500 uppercase tracking-tighter glitch-text">
                Emotional Damage
            </h2>
            
            <p className="text-xl font-mono text-white leading-relaxed border-t border-b border-red-500/30 py-6">
                "{roast}"
            </p>
            
            <Button variant="danger" onClick={onClose} className="w-full">
                I accept my fate
            </Button>
        </div>
      </div>
    </div>
  );
};
