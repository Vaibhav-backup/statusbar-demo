
import React, { useState } from 'react';
import { Task, TaskCategory, Priority, EnergyLevel } from '../types';
import { Calendar, Filter, ArrowUpDown, Search, Archive, Eye, Zap, Signal } from 'lucide-react';
import { MissionReportModal } from './MissionReportModal';

interface TaskHistoryProps {
  tasks: Task[];
}

type SortField = 'date' | 'category' | 'duration';
type SortOrder = 'asc' | 'desc';

export const TaskHistory: React.FC<TaskHistoryProps> = ({ tasks }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterEnergy, setFilterEnergy] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const completedTasks = tasks.filter(t => t.completed && t.completedAt);

  const filteredTasks = completedTasks.filter(task => {
    const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchesEnergy = filterEnergy === 'All' || task.energyRequired === filterEnergy;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPriority && matchesEnergy && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'date':
        return (new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()) * order;
      case 'category':
        return a.category.localeCompare(b.category) * order;
      case 'duration':
        return (a.durationMinutes - b.durationMinutes) * order;
      default:
        return 0;
    }
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (completedTasks.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted space-y-4 opacity-50">
              <Archive className="w-16 h-16" />
              <div className="text-center">
                  <h3 className="text-lg font-bold font-mono uppercase">Archives Empty</h3>
                  <p className="text-sm">Complete missions to populate history logs.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/40 p-4 rounded-xl border border-border backdrop-blur-sm">
        
        <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
             <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
             />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono min-w-[120px]"
            >
                <option value="All">All Categories</option>
                {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono min-w-[100px]"
            >
                <option value="All">All Priorities</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select 
                value={filterEnergy}
                onChange={(e) => setFilterEnergy(e.target.value)}
                className="bg-black/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono min-w-[100px]"
            >
                <option value="All">All Energy</option>
                {Object.values(EnergyLevel).map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <button 
                onClick={() => toggleSort('date')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono transition-colors whitespace-nowrap ${sortField === 'date' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-border text-muted hover:text-foreground'}`}
            >
                <Calendar className="w-3.5 h-3.5" />
                Date
                {sortField === 'date' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </button>

            <button 
                onClick={() => toggleSort('duration')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono transition-colors whitespace-nowrap ${sortField === 'duration' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-border text-muted hover:text-foreground'}`}
            >
                Time
                {sortField === 'duration' && <ArrowUpDown className="w-3 h-3 ml-1" />}
            </button>
        </div>
      </div>

      <div className="space-y-3">
          {sortedTasks.map((task) => (
              <div 
                key={task.id} 
                className="group bg-surface/20 border border-border rounded-xl p-4 hover:bg-surface/60 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                  <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                          <Archive className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-bold text-foreground font-mono truncate group-hover:text-primary transition-colors">{task.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted font-mono flex-wrap">
                              <span>{new Date(task.completedAt!).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span className="text-foreground">{task.category}</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span className="flex items-center gap-1">
                                <Signal className="w-3 h-3" /> {task.priority}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" /> {task.energyRequired}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span>{task.durationMinutes}m</span>
                          </div>
                      </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-primary transition-all hover:bg-black/40 rounded-lg">
                      <Eye className="w-5 h-5" />
                  </button>
              </div>
          ))}
          {sortedTasks.length === 0 && (
             <div className="text-center py-12 text-muted font-mono">
                No missions match current filters.
             </div>
          )}
      </div>

      {selectedTask && (
        <MissionReportModal 
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
