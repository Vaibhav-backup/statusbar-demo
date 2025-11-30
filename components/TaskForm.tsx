import React, { useState } from 'react';
import { Plus, ArrowRight, Wand2 } from 'lucide-react';
import { Task, Priority, EnergyLevel, TaskCategory } from '../types';
import { Button } from './Button';
import { breakDownComplexTask } from '../services/geminiService';
import { TaskBreakdownModal } from './TaskBreakdownModal';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
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
    // Clear parent title after successfully adding subtasks
    setTitle('');
  };

  const getPriorityLabel = (p: Priority) => {
    switch(p) {
      case Priority.High: return "High Priority";
      case Priority.Medium: return "Medium";
      case Priority.Low: return "Low Priority";
      default: return p;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800/50 space-y-6 transition-all hover:border-zinc-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">New Task</h3>
        </div>
        
        <div className="space-y-1 relative">
          <div className="flex gap-2">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-transparent border-b border-zinc-800 py-3 text-lg text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
            />
            {title.trim().length > 3 && (
                <button 
                    type="button"
                    onClick={handleBreakDown}
                    disabled={isBreakingDown}
                    className="absolute right-0 top-2 p-2 text-zinc-400 hover:text-purple-400 transition-colors disabled:opacity-50"
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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-20 bg-zinc-800/50 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-white/20 outline-none text-sm"
              />
              <span className="text-sm text-zinc-500">min</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full bg-zinc-800/50 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-white/20 outline-none text-sm appearance-none cursor-pointer"
            >
              {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-zinc-800/50 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-white/20 outline-none text-sm appearance-none cursor-pointer"
            >
              {Object.values(Priority).map(p => <option key={p} value={p}>{getPriorityLabel(p)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Energy</label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
              className="w-full bg-zinc-800/50 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-white/20 outline-none text-sm appearance-none cursor-pointer"
            >
              {Object.values(EnergyLevel).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full group">
          <span>Add to Queue</span>
          <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
        </Button>
      </form>

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