import React, { useState } from 'react';
import { ScheduleItem, TaskCategory } from '../types';
import { Clock, Coffee, Briefcase, BookOpen, Heart, User, Pencil, Trash2, Check, GripVertical, Zap } from 'lucide-react';

interface TimelineProps {
  schedule: ScheduleItem[];
  isLoading: boolean;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  completedTaskIds?: Set<string>;
}

const getIcon = (category: TaskCategory | string, isBreak: boolean) => {
  if (isBreak) return <Coffee className="w-4 h-4 text-amber-400" />;
  switch (category) {
    case TaskCategory.Work: return <Briefcase className="w-4 h-4 text-cyan-400" />;
    case TaskCategory.Study: return <BookOpen className="w-4 h-4 text-fuchsia-400" />;
    case TaskCategory.Health: return <Heart className="w-4 h-4 text-rose-400" />;
    case TaskCategory.Personal: return <User className="w-4 h-4 text-emerald-400" />;
    default: return <Clock className="w-4 h-4 text-zinc-400" />;
  }
};

export const Timeline: React.FC<TimelineProps> = ({ schedule, isLoading, onEdit, onDelete, onReorder, completedTaskIds = new Set() }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6 px-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-24 bg-zinc-900/50 rounded-xl border border-zinc-800/50 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
        ))}
        <div className="flex items-center gap-2 text-violet-400">
            <Zap className="w-4 h-4 animate-bounce" />
            <p className="text-xs font-mono tracking-widest uppercase">Synthesizing Timeline...</p>
        </div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 group hover:border-violet-500/50 transition-colors">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-8 h-8 text-zinc-600 group-hover:text-violet-400 transition-colors" />
        </div>
        <p className="font-bold text-lg text-zinc-400 group-hover:text-white">NO QUESTS ACTIVE</p>
        <p className="text-xs mt-2 font-mono text-zinc-600">Initialize protocols to begin.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-4">
       {/* Neon Line */}
      <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-cyan-500 opacity-30 -z-10"></div>
      
      {schedule.map((item, index) => {
        const isCompleted = !item.isBreak && completedTaskIds.has(item.taskId);
        const isDragging = draggedIndex === index;

        return (
          <div 
            key={item.id} 
            draggable={onReorder !== undefined}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`
                relative flex items-start gap-6 group transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards
                ${isDragging ? 'opacity-40 scale-95 grayscale' : 'opacity-100'}
            `}
          >
            {/* Drag Handle */}
            {onReorder && (
               <div className="absolute -left-6 top-8 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-violet-400 transition-all p-2 hover:scale-125">
                 <GripVertical className="w-4 h-4" />
               </div>
            )}

            {/* Time & Node */}
            <div className="flex flex-col items-center min-w-[3rem] pt-1">
              <div className={`
                w-7 h-7 rounded-lg border-2 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-all duration-300
                ${item.isBreak 
                  ? 'bg-zinc-900 border-amber-500/30' 
                  : isCompleted 
                    ? 'bg-emerald-500 border-emerald-400 scale-110 rotate-3' 
                    : 'bg-zinc-950 border-zinc-700 group-hover:border-violet-500 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                }
              `}>
                {isCompleted ? <Check className="w-4 h-4 text-black font-bold" /> : getIcon(item.category, item.isBreak)}
              </div>
              <div className="mt-2 text-[10px] font-mono text-zinc-500 font-bold group-hover:text-violet-400 transition-colors">
                  {item.timeSlot.split('-')[0]}
              </div>
            </div>

            {/* Card */}
            <div className={`
                flex-1 rounded-xl p-5 border-l-4 transition-all duration-300 relative overflow-hidden backdrop-blur-md
                ${item.isBreak 
                    ? 'bg-amber-950/10 border-l-amber-500/50 border-t border-r border-b border-zinc-800/50' 
                    : isCompleted
                      ? 'bg-emerald-950/20 border-l-emerald-500 border-t border-r border-b border-emerald-500/20 opacity-70 grayscale-[0.5]'
                      : 'bg-zinc-900/60 border-l-violet-500 border-t border-r border-b border-zinc-800 hover:bg-zinc-800/80 hover:border-l-cyan-400 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1'
                }
            `}>
              
              <div className="flex justify-between items-start mb-2 pr-12">
                <h4 className={`text-base font-bold tracking-tight transition-all duration-300 ${
                  isCompleted ? 'text-emerald-400 line-through decoration-2' : 'text-white'
                }`}>
                  {item.title}
                </h4>
                {!item.isBreak && (
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-black/40 ${
                    isCompleted ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-cyan-400'
                  }`}>
                      {item.category}
                  </span>
                )}
              </div>
              
              <p className={`text-sm leading-relaxed transition-colors duration-300 font-medium ${isCompleted ? 'text-emerald-600/70' : 'text-zinc-400'}`}>
                {item.description}
              </p>
              
              {/* Actions */}
              {!item.isBreak && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(item.taskId)}
                      className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(item.taskId)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};