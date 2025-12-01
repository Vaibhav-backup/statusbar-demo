
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Task, ScheduleItem, UserProfile } from '../types';
import { Zap, CheckCircle2, Timer, Flame, Coffee, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsProps {
  tasks: Task[];
  schedule: ScheduleItem[];
  userProfile: UserProfile;
}

type TimeRange = 'Today' | '1 Week' | '4 Weeks';

export const Analytics: React.FC<AnalyticsProps> = ({ tasks, schedule, userProfile }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');

  // --- Helper Functions ---

  const parseDate = (dateStr?: string) => dateStr ? new Date(dateStr) : new Date();

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isWithinLastDays = (date: Date, days: number) => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - days);
    return date >= past && date <= today;
  };

  // --- Data aggregation ---

  const currentStats = useMemo(() => {
    const today = new Date();
    let filteredTasks: Task[] = [];
    
    if (timeRange === 'Today') {
      filteredTasks = tasks.filter(t => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), today));
    } else if (timeRange === '1 Week') {
      filteredTasks = tasks.filter(t => t.completed && t.completedAt && isWithinLastDays(new Date(t.completedAt), 7));
    } else {
      filteredTasks = tasks.filter(t => t.completed && t.completedAt && isWithinLastDays(new Date(t.completedAt), 28));
    }

    const focusTimeMinutes = filteredTasks.reduce((acc, t) => acc + (t.timeSpent || t.durationMinutes || 0), 0);
    const tasksCompleted = filteredTasks.length;
    // Approximation: sessions = number of completed tasks
    const sessions = filteredTasks.length;
    // Approximation: break time = 10 mins per session roughly or calculate from breaks in history if we had them
    const breakTimeMinutes = Math.floor(focusTimeMinutes * 0.2); 

    return { focusTimeMinutes, tasksCompleted, sessions, breakTimeMinutes };
  }, [tasks, timeRange]);

  const prevStats = useMemo(() => {
    const today = new Date();
    let filteredTasks: Task[] = [];
    
    // Compare to "Yesterday" or "Previous Week"
    if (timeRange === 'Today') {
       const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
       filteredTasks = tasks.filter(t => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), yesterday));
    } else if (timeRange === '1 Week') {
       // Previous 7 days (day -14 to day -7)
       const end = new Date(); end.setDate(today.getDate() - 7);
       const start = new Date(); start.setDate(today.getDate() - 14);
       filteredTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) >= start && new Date(t.completedAt) < end);
    } else {
       // Previous 28 days
       const end = new Date(); end.setDate(today.getDate() - 28);
       const start = new Date(); start.setDate(today.getDate() - 56);
       filteredTasks = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) >= start && new Date(t.completedAt) < end);
    }

    const focusTimeMinutes = filteredTasks.reduce((acc, t) => acc + (t.timeSpent || t.durationMinutes || 0), 0);
    const tasksCompleted = filteredTasks.length;
    const sessions = filteredTasks.length;
    const breakTimeMinutes = Math.floor(focusTimeMinutes * 0.2);

    return { focusTimeMinutes, tasksCompleted, sessions, breakTimeMinutes };
  }, [tasks, timeRange]);

  const formatDuration = (mins: number) => {
    if (mins === 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getPercentChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const days = timeRange === 'Today' ? 7 : timeRange === '1 Week' ? 7 : 28;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayTasks = tasks.filter(t => t.completed && t.completedAt && isSameDay(new Date(t.completedAt), d));
        const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.timeSpent || t.durationMinutes || 0), 0);
        
        data.push({
            name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            minutes: totalMinutes,
            tasks: dayTasks.length
        });
    }
    return data;
  }, [tasks, timeRange]);

  // --- Components ---

  const StatCard = ({ title, value, icon: Icon, trend, colorClass, gradient }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-lg border border-white/10 group hover:scale-[1.02] transition-transform duration-300`}>
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Icon className="w-16 h-16 text-white rotate-12" />
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-bold text-white/90 uppercase tracking-wider font-mono">{title}</h4>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-white font-mono tracking-tight mb-2">
                {value}
            </div>
            <div className="flex items-center gap-2">
                {trend > 0 ? <TrendingUp className="w-3 h-3 text-white" /> : <TrendingDown className="w-3 h-3 text-white/80" />}
                <span className="text-xs font-bold text-white font-mono">{Math.abs(trend)}%</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h2 className="text-2xl font-bold text-foreground font-mono uppercase tracking-tight">Focus Stats</h2>
              <p className="text-muted text-sm font-mono">Refine your workflow with insights into your productivity patterns.</p>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {(['Today', '1 Week', '4 Weeks'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                        timeRange === range 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                      {range}
                  </button>
              ))}
          </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* Focus Time */}
          <StatCard 
            title="Focus Time" 
            value={formatDuration(currentStats.focusTimeMinutes)} 
            icon={Zap} 
            trend={getPercentChange(currentStats.focusTimeMinutes, prevStats.focusTimeMinutes)}
            gradient="bg-gradient-to-br from-orange-400 to-yellow-500"
          />

          {/* Tasks Completed */}
          <StatCard 
            title="Tasks Completed" 
            value={currentStats.tasksCompleted} 
            icon={CheckCircle2} 
            trend={getPercentChange(currentStats.tasksCompleted, prevStats.tasksCompleted)}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-400"
          />

          {/* Sessions */}
          <StatCard 
            title="Sessions" 
            value={currentStats.sessions} 
            icon={Timer} 
            trend={getPercentChange(currentStats.sessions, prevStats.sessions)}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
          />

           {/* Streak */}
           <StatCard 
            title="Streak" 
            value={`${userProfile.streak} Days`} 
            icon={Flame} 
            trend={userProfile.streak > 0 ? 100 : 0} // Hard to calc trend without history
            gradient="bg-gradient-to-br from-red-500 to-orange-600"
          />

           {/* Break Time */}
           <StatCard 
            title="Break Time" 
            value={formatDuration(currentStats.breakTimeMinutes)} 
            icon={Coffee} 
            trend={getPercentChange(currentStats.breakTimeMinutes, prevStats.breakTimeMinutes)}
            gradient="bg-gradient-to-br from-pink-500 to-rose-400"
          />

      </div>

      {/* Main Chart */}
      <div className="bg-zinc-950 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           
           <h3 className="text-lg font-bold text-foreground font-mono uppercase mb-8 relative z-10 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-primary" />
               Recent Productivity
           </h3>

           <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        tick={{fill: '#71717a', fontSize: 10, fontFamily: 'monospace'}} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        tick={{fill: '#71717a', fontSize: 10, fontFamily: 'monospace'}} 
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#09090b', 
                            border: '1px solid #3f3f46', 
                            borderRadius: '12px', 
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                        }}
                        labelStyle={{ fontFamily: 'monospace', color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorMinutes)" 
                      />
                  </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-900">
               {[
                   { label: 'Avg Session', value: '45m' },
                   { label: 'Most Productive', value: 'Tuesday' },
                   { label: 'Peak Hour', value: '10 AM' },
                   { label: 'Completion Rate', value: '92%' }
               ].map((metric, i) => (
                   <div key={i} className="text-center">
                       <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">{metric.label}</p>
                       <p className="text-sm md:text-base font-bold text-foreground font-mono">{metric.value}</p>
                   </div>
               ))}
           </div>
      </div>
    </div>
  );
};
