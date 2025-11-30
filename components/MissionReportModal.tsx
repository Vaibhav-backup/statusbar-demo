
import React from 'react';
import { X, Calendar, Clock, Zap, CheckCircle2, Flame, Tag, Trophy } from 'lucide-react';
import { Task } from '../types';

interface MissionReportModalProps {
  task: Task;
  onClose: () => void;
}

export const MissionReportModal: React.FC<MissionReportModalProps> = ({ task, onClose }) => {
  const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 w-full max-w-lg rounded-2xl border-2 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200 relative group">
        
        {/* Holographic header effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-start">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest font-mono">Mission Complete</h3>
             </div>
             <p className="text-xs text-zinc-500 font-mono">Archived Record #{task.id.slice(0,6)}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 relative">
           <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-mono leading-tight">{task.title}</h2>
              <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                     <Tag className="w-3 h-3" /> {task.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider flex items-center gap-1 ${
                      task.priority === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                      task.priority === 'Medium' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                      'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                     <Zap className="w-3 h-3" /> {task.priority} Priority
                  </span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-2">
                     <Clock className="w-3 h-3" /> Est. Duration
                  </div>
                  <div className="text-xl font-bold text-white font-mono">{task.durationMinutes}m</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 group-hover:border-primary/30 transition-colors">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-2">
                     <Flame className="w-3 h-3 text-amber-500" /> Time Spent
                  </div>
                  <div className="text-xl font-bold text-amber-400 font-mono">{task.timeSpent || 0}m</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 col-span-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-2">
                     <Calendar className="w-3 h-3" /> Completion Date
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                      {completedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-zinc-500 font-mono">
                      @ {completedDate.toLocaleTimeString()}
                  </div>
              </div>
           </div>

           <div className="flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
               <div className="text-center">
                   <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                   <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Rewards Claimed</div>
                   <div className="text-2xl font-bold text-emerald-300 font-mono">+100 AURA</div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};
