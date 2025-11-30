import React from 'react';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';
import { Task, TaskCategory, ScheduleItem } from '../types';

interface AnalyticsProps {
  tasks: Task[];
  schedule: ScheduleItem[];
}

const COLORS = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b'];

export const Analytics: React.FC<AnalyticsProps> = ({ tasks, schedule }) => {
  
  const categoryData = Object.values(TaskCategory).map(cat => {
    return {
      name: cat,
      value: tasks.filter(t => t.category === cat).length
    };
  }).filter(d => d.value > 0);

  const totalSlots = schedule.length;
  const breakSlots = schedule.filter(s => s.isBreak).length;
  const workSlots = totalSlots - breakSlots;

  const productivityScore = totalSlots > 0 ? Math.round((workSlots / totalSlots) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_0_20px_rgba(139,92,246,0.1)] group hover:border-violet-500/50 transition-colors">
          <h4 className="text-violet-400 text-xs font-bold mb-2 uppercase tracking-widest font-mono">Synch Rate</h4>
          <div className="text-5xl font-bold text-white font-mono">{productivityScore}%</div>
          <p className="text-xs text-zinc-500 mt-2 font-mono">Work/Rest Balance</p>
        </div>
        <div className="bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-[0_0_20px_rgba(217,70,239,0.1)] group hover:border-fuchsia-500/50 transition-colors">
          <h4 className="text-fuchsia-400 text-xs font-bold mb-2 uppercase tracking-widest font-mono">Quest Count</h4>
          <div className="text-5xl font-bold text-white font-mono">{tasks.length}</div>
          <p className="text-xs text-zinc-500 mt-2 font-mono">{tasks.filter(t => t.completed).length} completed</p>
        </div>
      </div>

      <div className="bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 shadow-lg min-h-[400px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <div className="w-32 h-32 rounded-full border-4 border-zinc-700 border-dashed animate-spin-slow"></div>
        </div>
        
        <h4 className="text-white font-bold mb-6 font-mono uppercase tracking-wider z-10">Category Distribution</h4>
        <div className="flex-1 z-10">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                itemStyle={{ color: '#fff' }}
                />
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-4 z-10">
            {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-zinc-300 font-mono bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                    {entry.name}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};