import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Wand2, BatteryLow, BatteryMedium, Zap, Signal, SignalMedium, SignalHigh, Save, X, Layers, Disc } from 'lucide-react';
import { Task, Priority, EnergyLevel, TaskCategory } from '../types';
import { Button } from './Button';
import { breakDownComplexTask } from '../services/geminiService';
import { TaskBreakdownModal } from './TaskBreakdownModal';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

interface TaskTemplate {
  id: string;
  title: string;
  durationMinutes: number;
  priority: Priority;
  category: TaskCategory;
  energyRequired: EnergyLevel;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Work);
  const [energy, setEnergy] = useState<EnergyLevel>(EnergyLevel.Medium);

  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [generatedSubTasks, setGeneratedSubTasks] = useState<any[]>([]);

  // Macros / Templates State
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const saved = localStorage.getItem('lockin_macros');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lockin_macros', JSON.stringify(templates));
  }, [templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      durationMinutes: duration,
      priority,
      category,
      energyRequired: energy,
    });

    setTitle('');
    setDuration(30);
  };

  const handleBreakDown = async () => {
    if (!title.trim()) return;
    
    setIsBreakingDown(true);
    try {
      const subTasks = await breakDownComplexTask(title);
      setGeneratedSubTasks(subTasks);
      setShowBreakdownModal(true);
    } catch (error) {
      console.error("Failed to break down task", error);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleAddSubTasks = (subTasks: any[]) => {
    subTasks.forEach(task => {
        onAddTask({
            title: task.title,
            durationMinutes: task.durationMinutes,
            priority: task.priority as Priority,
            category: task.category as TaskCategory,
            energyRequired: task.energyRequired as EnergyLevel
        });
    });
    setTitle('');
  };

  const handleSaveMacro = () => {
    if (!title.trim()) return;
    
    const newTemplate: TaskTemplate = {
      id: Date.now().toString(),
      title,
      durationMinutes: duration,
      priority,
      category,
      energyRequired: energy
    };

    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleLoadMacro = (template: TaskTemplate) => {
    setTitle(template.title);
    setDuration(template.durationMinutes);
    setPriority(template.priority);
    setCategory(template.category);
    setEnergy(template.energyRequired);
  };

  const handleDeleteMacro = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="bg-surface/40 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-border space-y-6 transition-all hover:border-border/80 relative overflow-hidden">
        
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-widest font-mono flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task Protocol
          </h3>
          
          {/* Quick Save Macro Button */}
          {title.trim().length > 0 && (
             <button 
               onClick={handleSaveMacro}
               className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
               title="Save configuration as Macro"
             >
               <Save className="w-3 h-3" /> Save Macro
             </button>
          )}
        </div>

        {/* Macros Bar */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-widest font-mono pl-1">
              <Layers className="w-3 h-3" /> Saved Macros
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {templates.map(temp => (
                <div 
                  key={temp.id}
                  onClick={() => handleLoadMacro(temp)}
                  className="flex-shrink-0 group relative flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all hover:bg-surface-highlight"
                >
                  <Disc className="w-3 h-3 text-muted group-hover:text-primary" />
                  <span className="text-xs font-mono text-muted group-hover:text-foreground truncate max-w-[100px]">{temp.title}</span>
                  <button 
                    onClick={(e) => handleDeleteMacro(e, temp.id)}
                    className="ml-1 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 relative">
            <div className="flex gap-2">
              <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-transparent border-b border-border py-3 text-lg text-foreground placeholder-muted focus:border-primary focus:outline-none transition-colors font-mono"
              />
              {title.trim().length > 3 && (
                  <button 
                      type="button"
                      onClick={handleBreakDown}
                      disabled={isBreakingDown}
                      className="absolute right-0 top-2 p-2 text-muted hover:text-primary transition-colors disabled:opacity-50"
                      title="AI Break Down"
                  >
                      {isBreakingDown ? (
                          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                          <Wand2 className="w-5 h-5" />
                      )}
                  </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted uppercase tracking-wider font-mono">Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-surface-highlight border-none rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary outline-none text-sm font-mono"
                />
                <span className="text-sm text-muted font-mono whitespace-nowrap">min</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted uppercase tracking-wider font-mono">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-surface-highlight border-none rounded-lg px-3 py-2 text-foreground focus:ring-1 focus:ring-primary outline-none text-sm appearance-none cursor-pointer font-mono"
              >
                {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted uppercase tracking-wider font-mono">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                 {(Object.values(Priority) as Priority[]).map((p) => {
                   let icon = <Signal className="w-4 h-4" />;
                   let color = "text-muted";
                   if (p === Priority.Low) { icon = <Signal className="w-4 h-4" />; color="text-emerald-400"; }
                   if (p === Priority.Medium) { icon = <SignalMedium className="w-4 h-4" />; color="text-blue-400"; }
                   if (p === Priority.High) { icon = <SignalHigh className="w-4 h-4" />; color="text-red-400"; }
                   
                   return (
                     <button
                       key={p}
                       type="button"
                       onClick={() => setPriority(p)}
                       className={`
                          flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                          ${priority === p 
                            ? `bg-surface-highlight border-${color.split('-')[1]}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]` 
                            : 'bg-surface/20 border-transparent hover:bg-surface-highlight/50 opacity-60 hover:opacity-100'
                          }
                       `}
                     >
                       <div className={`${priority === p ? color : 'text-muted'} mb-1`}>{icon}</div>
                       <span className={`text-[10px] font-bold uppercase ${priority === p ? 'text-foreground' : 'text-muted'}`}>
                         {p}
                       </span>
                     </button>
                   );
                 })}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted uppercase tracking-wider font-mono">Energy Output</label>
              <div className="grid grid-cols-3 gap-2">
                 {(Object.values(EnergyLevel) as EnergyLevel[]).map((level) => {
                   let icon = null;
                   let colorClass = '';
                   let label = '';
                   let desc = '';
                   let activeClass = '';

                   if (level === EnergyLevel.Low) {
                      icon = <BatteryLow className="w-5 h-5" />;
                      colorClass = 'text-emerald-400';
                      activeClass = 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                      label = 'Low';
                      desc = 'Chill';
                   } else if (level === EnergyLevel.Medium) {
                      icon = <BatteryMedium className="w-5 h-5" />;
                      colorClass = 'text-amber-400';
                      activeClass = 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
                      label = 'Med';
                      desc = 'Flow';
                   } else {
                      icon = <Zap className="w-5 h-5" />;
                      colorClass = 'text-rose-400';
                      activeClass = 'bg-rose-500/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
                      label = 'High';
                      desc = 'Grind';
                   }

                   const isSelected = energy === level;

                   return (
                     <button
                       key={level}
                       type="button"
                       onClick={() => setEnergy(level)}
                       className={`
                          group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative overflow-hidden
                          ${isSelected 
                            ? activeClass 
                            : 'bg-surface/30 border-transparent hover:bg-surface-highlight hover:border-border/50 opacity-70 hover:opacity-100'
                          }
                       `}
                     >
                       <div className={`${isSelected ? colorClass : 'text-muted group-hover:text-foreground'} transition-colors mb-1.5`}>
                           {icon}
                       </div>
                       <div className="text-center z-10">
                           <div className={`text-[10px] font-bold uppercase font-mono leading-none mb-1 ${isSelected ? 'text-foreground' : 'text-muted'}`}>
                               {label}
                           </div>
                           <div className="text-[8px] text-muted/60 font-mono tracking-wider uppercase">
                               {desc}
                           </div>
                       </div>
                       
                       {/* Background highlight for selected */}
                       {isSelected && (
                           <div className={`absolute inset-0 opacity-20 ${colorClass.replace('text-', 'bg-')}`}></div>
                       )}
                     </button>
                   );
                 })}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full group">
            <span>Add to Queue</span>
            <ArrowRight className="w-4 h-4 text-primary-fg/70 group-hover:text-primary-fg group-hover:translate-x-1 transition-all" />
          </Button>
        </form>
      </div>

      {showBreakdownModal && (
        <TaskBreakdownModal 
          parentTaskTitle={title}
          subTasks={generatedSubTasks}
          onAddSubTasks={handleAddSubTasks}
          onClose={() => setShowBreakdownModal(false)}
        />
      )}
    </>
  );
};