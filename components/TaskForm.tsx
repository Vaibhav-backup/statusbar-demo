import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Priority, EnergyLevel, TaskCategory } from '../types';
import { Button } from './Button';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Work);
  const [energy, setEnergy] = useState<EnergyLevel>(EnergyLevel.Medium);

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

  const getPriorityLabel = (p: Priority) => {
    switch(p) {
      case Priority.High: return "High Key (ASAP)";
      case Priority.Medium: return "Mid";
      case Priority.Low: return "Low Key";
      default: return p;
    }
  };

  const getEnergyLabel = (e: EnergyLevel) => {
    switch(e) {
      case EnergyLevel.High: return "Full Send";
      case EnergyLevel.Medium: return "Standard";
      case EnergyLevel.Low: return "Chill";
      default: return e;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-2">Drop a Task</h3>
      
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">What's the move?</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish the project before I get cooked"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Vibe / Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
          >
            {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Urgency</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
          >
            {Object.values(Priority).map(p => <option key={p} value={p}>{getPriorityLabel(p)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Energy Check</label>
          <select
            value={energy}
            onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 outline-none"
          >
            {Object.values(EnergyLevel).map(l => <option key={l} value={l}>{getEnergyLabel(l)}</option>)}
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4" />
        Send It
      </Button>
    </form>
  );
};