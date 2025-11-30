import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Task, Priority, EnergyLevel, TaskCategory } from '../types';
import { Button } from './Button';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState<Task>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-zinc-900 bg-zinc-900/30">
          <h3 className="text-sm font-medium text-white">Edit Task</h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration (min)</label>
              <input
                type="number"
                value={editedTask.durationMinutes}
                onChange={(e) => setEditedTask({ ...editedTask, durationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</label>
              <select
                value={editedTask.category}
                onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value as TaskCategory })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Priority })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Energy</label>
              <select
                value={editedTask.energyRequired}
                onChange={(e) => setEditedTask({ ...editedTask, energyRequired: e.target.value as EnergyLevel })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-zinc-600 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {Object.values(EnergyLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
