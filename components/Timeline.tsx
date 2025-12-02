
import React, { useState } from 'react';
import { ScheduleItem, TaskCategory } from '../types';
import { Clock, Coffee, Briefcase, BookOpen, Heart, User, Pencil, Trash2, Check, GripVertical, Zap, Play, ArrowDown } from 'lucide-react';

interface TimelineProps {
  schedule: ScheduleItem[];
  isLoading: boolean;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onFocus?: (scheduleItem: ScheduleItem) => void;
  onToggleComplete?: (taskId: string) => void;
  completedTaskIds?: Set<string>;
}

const getIcon = (category: TaskCategory | string, isBreak: boolean) => {
  if (isBreak) return <Coffee className="w-4 h-4 text-secondary" />;
  switch (category) {
    case TaskCategory.Work: return <Briefcase className="w-4 h-4 text-primary" />;
    case TaskCategory.Study: return <BookOpen className="w-4 h-4 text-fuchsia-400" />;
    case TaskCategory.Health: return <Heart className="w-4 h-4 text-rose-400" />;
    case TaskCategory.Personal: return <User className="w-4 h-4 text-emerald-400" />;
    default: return <Clock className="w-4 h-4 text-muted" />;
  }
};

const Placeholder = () => (
  <div className="w-full h-24 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 backdrop-blur-sm animate-pulse flex items-center justify-center my-2 transition-all duration-300">
      <div className="flex flex-col items-center gap-1 text-primary/70">
          <ArrowDown className="w-5 h-5 animate-bounce" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest">Target Slot</span>
      </div>
  </div>
);

export const Timeline: React.FC<TimelineProps> = ({ schedule, isLoading, onEdit, onDelete, onReorder, onFocus, onToggleComplete, completedTaskIds = new Set() }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [confirmTaskId, setConfirmTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); 
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleConfirmComplete = () => {
    if (confirmTaskId && onToggleComplete) {
      onToggleComplete(confirmTaskId);
    }
    setConfirmTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-6 px-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-24 bg-surface/50 rounded-xl border border-border animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
        ))}
        <div className="flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 animate-bounce" />
            <p className="text-xs font-mono tracking-widest uppercase">Synthesizing Timeline...</p>
        </div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-surface/20 group hover:border-primary/50 transition-colors m-4">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-8 h-8 text-muted group-hover:text-primary transition-colors" />
        </div>
        <p className="font-bold text-lg text-muted group-hover:text-foreground">NO QUESTS ACTIVE</p>
        <p className="text-xs mt-2 font-mono text-muted">Initialize protocols to begin.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-2 md:pl-4 space-y-3 md:space-y-4">
       {/* Neon Line */}
      <div className="absolute left-[20px] md:left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-secondary to-transparent opacity-30 -z-10"></div>
      
      {schedule.map((item, index) => {
        const isCompleted = !item.isBreak && completedTaskIds.has(item.taskId);
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
        const isMoveDown = draggedIndex !== null && index > draggedIndex;
        const showPlaceholderBefore = isOver && !isMoveDown;
        const showPlaceholderAfter = isOver && isMoveDown;

        return (
          <React.Fragment key={item.id}>
             {showPlaceholderBefore && <Placeholder />}
             
             <div 
                draggable={onReorder !== undefined}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`
                    relative flex items-start gap-3 md:gap-6 group transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards
                    ${isDragging ? 'opacity-40 scale-95 grayscale' : 'opacity-100'}
                    ${isOver ? 'scale-105 z-10' : ''}
                `}
              >
                {/* Drag Handle */}
                {onReorder && (
                   <div className="absolute -left-6 top-8 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted hover:text-primary transition-all p-2 hover:scale-125 hidden md:block">
                     <GripVertical className="w-4 h-4" />
                   </div>
                )}

                {/* Time & Node */}
                <div className="flex flex-col items-center min-w-[2.5rem] md:min-w-[3rem] pt-1">
                  <div className={`
                    w-6 h-6 md:w-7 md:h-7 rounded-lg border-2 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-all duration-300
                    ${item.isBreak 
                      ? 'bg-surface border-secondary/30' 
                      : isCompleted 
                        ? 'bg-emerald-500 border-emerald-400 scale-110 rotate-3' 
                        : isOver 
                            ? 'bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]' 
                            : 'bg-background border-border group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                    }
                  `}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 text-black font-bold" /> : getIcon(item.category, item.isBreak)}
                  </div>
                  <div className="mt-2 text-[9px] md:text-[10px] font-mono text-muted font-bold group-hover:text-primary transition-colors whitespace-nowrap">
                      {item.timeSlot.split('-')[0]}
                  </div>
                </div>

                {/* Card */}
                <div className={`
                    flex-1 rounded-xl p-4 md:p-5 border-l-4 transition-all duration-300 relative overflow-hidden backdrop-blur-md
                    ${item.isBreak 
                        ? 'bg-secondary/5 border-l-secondary/50 border-t border-r border-b border-border' 
                        : isCompleted
                          ? 'bg-emerald-950/20 border-l-emerald-500 border-t border-r border-b border-emerald-500/20 opacity-70 grayscale-[0.5]'
                          : isOver
                             ? 'bg-surface-highlight border-l-primary border-t border-r border-b border-border shadow-2xl'
                             : 'bg-surface/60 border-l-primary border-t border-r border-b border-border hover:bg-surface/80 hover:border-l-secondary hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-1'
                    }
                `}>
                  
                  <div className="flex justify-between items-start mb-2 pr-0 md:pr-16 gap-2">
                    <h4 className={`text-sm md:text-base font-bold tracking-tight transition-all duration-300 line-clamp-2 ${
                      isCompleted ? 'text-emerald-400 line-through decoration-2' : 'text-foreground'
                    }`}>
                      {item.title}
                    </h4>
                    {!item.isBreak && (
                      <span className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-black/40 whitespace-nowrap ${
                        isCompleted ? 'text-emerald-500' : 'text-muted group-hover:text-primary'
                      }`}>
                          {item.category}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-xs md:text-sm leading-relaxed transition-colors duration-300 font-medium ${isCompleted ? 'text-emerald-600/70' : 'text-muted'}`}>
                    {item.description}
                  </p>
                  
                  {/* Actions - Always visible on mobile if container touched, otherwise hover on desktop */}
                  {!item.isBreak && (
                    <div className="flex gap-1 mt-3 md:mt-0 md:absolute md:top-3 md:right-3 md:opacity-0 group-hover:opacity-100 transition-all md:transform md:translate-x-4 md:group-hover:translate-x-0 md:bg-black/50 md:p-1 md:rounded-lg md:border md:border-white/5 md:backdrop-blur-md">
                      {onFocus && !isCompleted && (
                        <button 
                          onClick={() => onFocus(item)}
                          className="p-1.5 text-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors bg-surface border border-border md:bg-transparent md:border-none"
                          title="Focus Mode"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                      
                      {onToggleComplete && !isCompleted && (
                        <button 
                          onClick={() => setConfirmTaskId(item.taskId)}
                          className="p-1.5 text-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors bg-surface border border-border md:bg-transparent md:border-none"
                          title="Complete Task"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item.taskId)}
                          className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors bg-surface border border-border md:bg-transparent md:border-none"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item.taskId)}
                          className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors bg-surface border border-border md:bg-transparent md:border-none"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {showPlaceholderAfter && <Placeholder />}
          </React.Fragment>
        );
      })}

      {/* Confirmation Modal */}
      {confirmTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
               <h3 className="text-lg font-bold text-foreground mb-2 font-mono uppercase tracking-tight">Confirm Completion</h3>
               <p className="text-zinc-400 mb-6 font-mono text-sm">Are you sure you want to complete this task?</p>
               <div className="flex gap-3 justify-end">
                   <button 
                      onClick={() => setConfirmTaskId(null)}
                      className="px-4 py-2 rounded-lg text-xs font-bold font-mono text-zinc-400 hover:text-foreground hover:bg-zinc-800 transition-colors"
                   >
                       CANCEL
                   </button>
                   <button 
                      onClick={handleConfirmComplete}
                      className="px-4 py-2 rounded-lg text-xs font-bold font-mono bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                   >
                       CONFIRM
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
