import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { Task, Priority, EnergyLevel, TaskCategory } from '../types';
import { Button } from './Button';

interface SubTaskCandidate {
  title: string;
  durationMinutes: number;
  priority: Priority;
  category: TaskCategory;
  energyRequired: EnergyLevel;
}

interface TaskBreakdownModalProps {
  parentTaskTitle: string;
  subTasks: SubTaskCandidate[];
  onAddSubTasks: (tasks: SubTaskCandidate[]) => void;
  onClose: () => void;
}

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({ 
  parentTaskTitle, 
  subTasks, 
  onAddSubTasks, 
  onClose 
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(subTasks.map((_, i) => i)) // Default all selected
  );

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleConfirm = () => {
    const tasksToAdd = subTasks.filter((_, i) => selectedIndices.has(i));
    onAddSubTasks(tasksToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-zinc-900">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-light text-white">Deconstruct Quest</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Breaking down: <span className="text-zinc-300 font-medium">"{parentTaskTitle}"</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Select sub-tasks to add
          </p>
          
          {subTasks.map((task, index) => {
            const isSelected = selectedIndices.has(index);
            return (
              <div 
                key={index}
                onClick={() => toggleSelection(index)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-4 group ${
                  isSelected 
                    ? 'bg-zinc-900/50 border-zinc-700' 
                    : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-white border-white' 
                    : 'bg-transparent border-zinc-700 group-hover:border-zinc-500'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-black" />}
                </div>

                <div className="flex-1">
                  <h4 className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {task.title}
                  </h4>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                      {task.durationMinutes} min
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                      {task.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800">
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedIndices.size === 0}>
              Add {selectedIndices.size} Tasks
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
      </div>
    </div>
  );
};