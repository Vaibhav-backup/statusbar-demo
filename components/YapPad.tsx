
import React, { useState } from 'react';
import { BrainCircuit, MessageSquarePlus, Sparkles, ArrowRight } from 'lucide-react';
import { summarizeYap } from '../services/geminiService';
import { Button } from './Button';

interface YapPadProps {
  value: string;
  onChange: (val: string) => void;
  onAddTasks: (tasks: any[]) => void;
}

export const YapPad: React.FC<YapPadProps> = ({ value, onChange, onAddTasks }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!value.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await summarizeYap(value);
      setSummary(result.summary);
      if (result.tasks && result.tasks.length > 0) {
        onAddTasks(result.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-surface/40 rounded-xl border border-border backdrop-blur-sm p-1 space-y-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
        <MessageSquarePlus className="w-12 h-12 text-primary" />
      </div>
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-primary flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> The Yap Pad
            </h3>
            <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !value.trim()}
                className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
                {isAnalyzing ? <span className="animate-spin">⏳</span> : <Sparkles className="w-3 h-3" />}
                TL;DR
            </button>
        </div>
        <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="// Spill the tea... (AI will extract tasks)"
            className="w-full h-24 bg-black/30 rounded-lg border border-border p-3 text-sm text-muted placeholder-zinc-700 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono custom-scrollbar"
        />
      </div>
      
      {summary && (
        <div className="mx-4 mb-4 mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
            <p className="text-xs font-mono text-primary-fg"><span className="font-bold">AI Vibe Check:</span> {summary}</p>
        </div>
      )}
    </div>
  );
};
