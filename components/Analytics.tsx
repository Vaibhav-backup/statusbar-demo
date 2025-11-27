import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, TaskCategory, ScheduleItem } from '../types';

interface AnalyticsProps {
  tasks: Task[];
  schedule: ScheduleItem[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'];

export const Analytics: React.FC<AnalyticsProps> = ({ tasks, schedule }) => {
  
  // Prepare data for distribution by Category
  const categoryData = Object.values(TaskCategory).map(cat => {
    return {
      name: cat,
      value: tasks.filter(t => t.category === cat).length
    };
  }).filter(d => d.value > 0);

  // Focus time calculation (simple estimation from schedule)
  // Assuming non-break items are roughly 30-60 mins for simplicity in this visual
  const totalSlots = schedule.length;
  const breakSlots = schedule.filter(s => s.isBreak).length;
  const workSlots = totalSlots - breakSlots;

  const productivityScore = totalSlots > 0 ? Math.round((workSlots / totalSlots) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h4 className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Locked In %</h4>
          <div className="text-3xl font-bold text-emerald-400">{productivityScore}%</div>
          <p className="text-xs text-slate-500 mt-1">Grind vs Touch Grass ratio</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <h4 className="text-slate-400 text-sm mb-1 uppercase tracking-wider">Quest Count</h4>
          <div className="text-3xl font-bold text-blue-400">{tasks.length}</div>
          <p className="text-xs text-slate-500 mt-1">{tasks.filter(t => t.completed).length} completed</p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-80">
        <h4 className="text-slate-200 font-semibold mb-4">Vibe Check (Distribution)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
            {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length]}}></div>
                    {entry.name}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};