import React, { useState, useEffect } from 'react';
import { Task, ScheduleItem, UserProfile, ToastMessage } from '../types';
import { generateSmartSchedule, getMotivationalNudge, generateScheduleInfographic } from '../services/geminiService';
import { Button } from './Button';
import { TaskForm } from './TaskForm';
import { Timeline } from './Timeline';
import { Analytics } from './Analytics';
import { EditTaskModal } from './EditTaskModal';
import { FocusMode } from './FocusMode';
import { ToastContainer } from './Toast';
import { 
  LayoutDashboard, 
  Settings, 
  RefreshCcw, 
  Zap, 
  CheckCircle2,
  LogOut,
  Calendar,
  CalendarPlus,
  Image as ImageIcon,
  X,
  Download,
  Menu,
  Trash2,
  BrainCircuit,
  Maximize,
  Pencil,
  Gamepad2,
  Trophy,
  Flame
} from 'lucide-react';

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  productiveHours: "morning",
  aura: 0
};

// Simple particle system component for internal use
const ParticleExplosion = ({ x, y }: { x: number, y: number }) => {
    return (
        <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
            {[...Array(12)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 animate-[ping_0.8s_ease-out_forwards]"
                    style={{
                        transform: `rotate(${i * 30}deg) translate(20px)`,
                        opacity: 0
                    }}
                ></div>
            ))}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('statusbar_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('statusbar_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('statusbar_profile');
    return saved ? JSON.parse(saved) : { ...DEFAULT_PROFILE, name: user.name };
  });
  const [brainDump, setBrainDump] = useState(() => localStorage.getItem('statusbar_notes') || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [nudge, setNudge] = useState<string>("SYSTEM ONLINE. READY FOR INPUT.");
  
  // UI States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<ScheduleItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  
  // Infographic
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Particle Effects
  const [explosion, setExplosion] = useState<{x: number, y: number, id: number} | null>(null);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('statusbar_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('statusbar_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('statusbar_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('statusbar_notes', brainDump); }, [brainDump]);

  const addToast = (message: string, type: 'success' | 'error' | 'info', onUndo?: () => void) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, onUndo }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Aura System
  const getLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  const getProgress = (xp: number) => (xp % 1000) / 10; 

  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };
    setTasks(prev => [...prev, task]);
    addToast("NEW QUEST ACQUIRED", "info");
  };

  const handleEditTaskClick = (taskId: string) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
    }
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSchedule(prev => prev.map(item => item.taskId === updatedTask.id ? { ...item, title: updatedTask.title, category: updatedTask.category } : item));
    setEditingTask(null);
    addToast("QUEST DATA UPDATED", "success");
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSchedule(prev => prev.filter(item => item.taskId !== taskId));

    addToast("QUEST ABANDONED", "info", () => {
      setTasks(prev => [...prev, taskToDelete]);
      addToast("QUEST RESTORED", "success");
    });
  };

  const handleClearCompleted = () => {
    const completed = tasks.filter(t => t.completed);
    if (completed.length === 0) return;

    setTasks(prev => prev.filter(t => !t.completed));
    addToast(`ARCHIVED ${completed.length} COMPLETED QUESTS`, "info");
  };

  const handleGenerateSchedule = async () => {
    if (tasks.length === 0) return;
    setIsGenerating(true);
    setSchedule([]); 
    setInfographicUrl(null); 
    try {
      const newSchedule = await generateSmartSchedule(tasks, userProfile);
      setSchedule(newSchedule);
      setNudge(await getMotivationalNudge(tasks.filter(t=>t.completed).length, tasks.length));
    } catch (error) {
      console.error(error);
      addToast("SIMULATION FAILED", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReOptimize = async () => {
    if(schedule.length === 0) return;
    setIsGenerating(true);
    try {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const context = `Current time: ${currentTime}. Re-optimize.`;
      const newSchedule = await generateSmartSchedule(tasks.filter(t => !t.completed), userProfile, context);
      setSchedule(newSchedule);
      setNudge("RE-ROUTING POWER...");
    } catch (e) {
      addToast("OPTIMIZATION ERROR", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReorderSchedule = (fromIndex: number, toIndex: number) => {
    const newSchedule = [...schedule];
    const [movedItem] = newSchedule.splice(fromIndex, 1);
    newSchedule.splice(toIndex, 0, movedItem);
    setSchedule(newSchedule);
  };

  const handleToggleTask = (taskId: string, e?: React.MouseEvent) => {
    // Particle Effect trigger
    if (e) {
        setExplosion({ x: e.clientX, y: e.clientY, id: Date.now() });
        setTimeout(() => setExplosion(null), 1000);
    }

    let earnedXp = 0;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) earnedXp = 100; 
        else earnedXp = -100;
        return { ...t, completed: isNowCompleted };
      }
      return t;
    }));

    setUserProfile(prev => ({ ...prev, aura: Math.max(0, prev.aura + earnedXp) }));
    
    if (earnedXp > 0) {
        const nudges = ["+100 AURA", "COMBO BREAK!", "QUEST COMPLETE", "XP GAINED"];
        addToast(nudges[Math.floor(Math.random() * nudges.length)], "success");
    }
  };

  const handleFocusModeComplete = () => {
      if (focusTask && !focusTask.isBreak) {
          handleToggleTask(focusTask.taskId);
      }
      setFocusTask(null);
  };

  const handleGenerateInfographic = async () => {
    if (schedule.length === 0) return;
    if (infographicUrl) { setShowInfographicModal(true); return; }
    setIsGeneratingInfographic(true);
    try {
        const url = await generateScheduleInfographic(schedule);
        setInfographicUrl(url);
        setShowInfographicModal(true);
    } catch (error) { addToast("VISUALIZATION FAILED", "error"); } 
    finally { setIsGeneratingInfographic(false); }
  };

  const handleExportICS = () => {
     // ... (Existing implementation kept brief for XML size)
     // Use the same logic as previous version, just re-implemented here implicitly or copied.
     // For brevity, I'm assuming the logic is identical to the previous step.
    if (schedule.length === 0) return;
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Statusbar//AI Schedule//EN\n";
    const now = new Date();
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const formatLocal = (date: Date) => `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

    schedule.forEach(item => {
        try {
            const [startStr, endStr] = item.timeSlot.split('-').map(s => s.trim());
            const [startH, startM] = startStr.split(':').map(Number);
            const [endH, endM] = endStr.split(':').map(Number);
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `UID:${item.id}@statusbar.app\n`;
            icsContent += `DTSTAMP:${formatLocal(new Date())}\n`;
            icsContent += `DTSTART:${formatLocal(startDate)}\n`;
            icsContent += `DTEND:${formatLocal(endDate)}\n`;
            icsContent += `SUMMARY:${item.title} (${item.category})\n`;
            icsContent += `DESCRIPTION:${item.description}\n`;
            icsContent += "END:VEVENT\n";
        } catch (e) { console.warn("Invalid time", item.timeSlot); }
    });
    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `statusbar-mission-${now.toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "LATE NIGHT RAID?";
    if (hour < 12) return "MORNING PROTOCOL";
    if (hour < 18) return "MID-DAY GRIND";
    return "NIGHT OPS";
  };

  return (
    <div className="min-h-screen flex text-zinc-100 font-sans selection:bg-violet-500 selection:text-white overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg transform rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:rotate-6 transition-transform">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <div>
                 <span className="text-2xl font-bold tracking-tighter text-white font-mono">STATUSBAR</span>
                 <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-transparent"></div>
            </div>
          </div>

          <div className="mb-8">
             <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Current Lvl</span>
                    <span className="text-violet-400 font-bold font-mono text-xl">{getLevel(userProfile.aura)}</span>
                </div>
                {/* Custom XP Bar */}
                <div className="relative h-4 bg-black rounded-full border border-zinc-800 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                         <span className="text-[9px] font-bold text-white/50">{userProfile.aura} / {getLevel(userProfile.aura) * 1000}</span>
                    </div>
                    <div 
                        className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.8)]" 
                        style={{ width: `${getProgress(userProfile.aura)}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-[10px] text-zinc-500 text-center font-mono">
                    AURA SYNCHRONIZATION
                </div>
             </div>
          </div>

          <nav className="space-y-2">
            {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'MISSION CONTROL' },
                { id: 'analytics', icon: Trophy, label: 'LEADERBOARD' },
                { id: 'settings', icon: Settings, label: 'SYSTEM CONFIG' }
            ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 border
                    ${activeTab === item.id 
                        ? 'bg-zinc-900 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] translate-x-1' 
                        : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-violet-400' : ''}`} />
                  <span className="font-mono">{item.label}</span>
                </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-900 bg-zinc-950/50">
           <div className="mb-6 bg-black/40 rounded-lg p-3 border-l-2 border-emerald-500 font-mono">
              <div className="flex items-center gap-2 mb-1">
                 <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-emerald-500 uppercase">System Msg</span>
              </div>
              <p className="text-xs text-zinc-300 leading-tight">"{nudge}"</p>
           </div>

           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-xs font-bold text-white border border-zinc-600 shadow-lg">
                 {user.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs font-bold text-white uppercase tracking-wider truncate w-24 font-mono">{user.name}</p>
                 <p className="text-[9px] text-emerald-500">ONLINE</p>
               </div>
             </div>
             <button onClick={onLogout} className="text-zinc-600 hover:text-red-500 transition-colors">
               <LogOut className="w-4 h-4" />
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
         {/* Particle Explosion Container */}
         {explosion && <ParticleExplosion x={explosion.x} y={explosion.y} />}

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-black sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <Gamepad2 className="text-violet-500 w-5 h-5" />
                <span className="font-bold text-white font-mono tracking-tighter">STATUSBAR</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400">
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 w-full bg-zinc-950 border-b border-zinc-800 p-4 z-20 space-y-2 shadow-2xl">
                 <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-white font-mono text-sm bg-zinc-900 rounded border border-zinc-800">MISSION CONTROL</button>
                 <button onClick={() => {setActiveTab('analytics'); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-zinc-400 font-mono text-sm hover:bg-zinc-900 rounded">LEADERBOARD</button>
                 <button onClick={onLogout} className="block w-full text-left py-3 px-4 text-red-500 font-mono text-sm hover:bg-zinc-900 rounded">LOG OUT</button>
            </div>
        )}

        <div className="max-w-7xl mx-auto p-6 lg:p-12 pb-32">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2 font-mono uppercase glitch-text" style={{ textShadow: "2px 2px 0px #8b5cf6" }}>
                        {activeTab === 'dashboard' && getGreeting()}
                        {activeTab === 'analytics' && "STATS & LOOT"}
                        {activeTab === 'settings' && "CONFIG"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                
                {activeTab === 'dashboard' && schedule.length > 0 && (
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReOptimize} isLoading={isGenerating} className="text-xs px-4 h-10">
                            <RefreshCcw className="w-3.5 h-3.5" />
                            REROLL
                        </Button>
                    </div>
                )}
            </header>

            {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: Input */}
                <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-left-4 duration-700 delay-100">
                    <TaskForm onAddTask={handleAddTask} />
                    
                    {/* Brain Dump Area */}
                    <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 backdrop-blur-sm p-1 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
                             <BrainCircuit className="w-12 h-12 text-violet-500" />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-violet-400 mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Thought Stream</h3>
                            </div>
                            <textarea 
                                value={brainDump}
                                onChange={(e) => setBrainDump(e.target.value)}
                                placeholder="// Input raw data..."
                                className="w-full h-24 bg-black/30 rounded-lg border border-zinc-800 p-3 text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 backdrop-blur-sm overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-sm"></span>
                                Quest Log
                            </h3>
                            <div className="flex gap-2">
                                {tasks.some(t => t.completed) && (
                                    <button onClick={handleClearCompleted} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors bg-zinc-800 px-2 py-1 rounded">
                                        Clear Done
                                    </button>
                                )}
                                <span className="text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded border border-fuchsia-500/20">{tasks.length}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-zinc-800 overflow-y-auto custom-scrollbar flex-1 p-2">
                            {tasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2 opacity-50">
                                    <Gamepad2 className="w-8 h-8" />
                                    <p className="text-xs font-mono uppercase">No Quests Active</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                <div key={task.id} className="p-3 hover:bg-zinc-800/50 rounded-lg transition-colors duration-200 flex items-center gap-3 group relative border border-transparent hover:border-zinc-700">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={task.completed}
                                            onClick={(e) => handleToggleTask(task.id, e)}
                                            readOnly
                                            className="checkbox-pop peer w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-950 checked:bg-violet-500 checked:border-violet-400 focus:ring-0 cursor-pointer appearance-none transition-all"
                                        />
                                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    
                                    <div className={`flex-1 min-w-0 transition-all duration-300 ${task.completed ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                                        <p className={`text-sm font-bold truncate font-mono ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                                task.priority === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                task.priority === 'Medium' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                'border-zinc-700 text-zinc-500 bg-zinc-800'
                                            }`}>{task.priority}</span>
                                            <span className="text-[9px] font-mono text-zinc-500 py-0.5">{task.durationMinutes}m</span>
                                        </div>
                                    </div>

                                    {/* Inline Edit/Delete */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-zinc-900 border border-zinc-700 rounded-md p-1 shadow-xl z-10">
                                        <button onClick={() => handleEditTaskClick(task.id)} className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded">
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur-md">
                            <Button variant="neon" onClick={handleGenerateSchedule} className="w-full" disabled={tasks.length === 0} isLoading={isGenerating}>
                                <Zap className="w-4 h-4" />
                                INITIALIZE RUN
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-8 animate-in slide-in-from-right-4 duration-700 delay-200">
                    <div className="bg-zinc-900/20 rounded-3xl p-1 min-h-[600px] transition-all relative">
                        {/* Decorative HUD corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-violet-500/50 rounded-tl-xl pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-violet-500/50 rounded-tr-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-violet-500/50 rounded-bl-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-violet-500/50 rounded-br-xl pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-8 pl-4 pt-4 pr-4">
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-2xl font-bold text-white font-mono tracking-tighter uppercase text-shadow-neon">Active Timeline</h3>
                                {schedule.length > 0 && (
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded animate-pulse">
                                        Live
                                    </span>
                                )}
                            </div>
                            {schedule.length > 0 && (
                                <div className="flex gap-2">
                                    {schedule.find(s => !tasks.find(t=>t.id===s.taskId)?.completed && !s.isBreak) && (
                                        <Button 
                                            variant="neon"
                                            onClick={() => setFocusTask(schedule.find(s => !tasks.find(t=>t.id===s.taskId)?.completed && !s.isBreak) || null)}
                                            className="text-xs h-9 px-4"
                                        >
                                            <Flame className="w-3.5 h-3.5 mr-1" />
                                            BOSS MODE
                                        </Button>
                                    )}
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleExportICS} 
                                        className="text-xs h-9 px-3"
                                    >
                                        <CalendarPlus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleGenerateInfographic} 
                                        isLoading={isGeneratingInfographic}
                                        className="text-xs h-9 px-3"
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        {infographicUrl ? 'VIEW' : 'VISUAL'}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="p-2">
                            <Timeline 
                                schedule={schedule} 
                                isLoading={isGenerating} 
                                onEdit={handleEditTaskClick}
                                onDelete={handleDeleteTask}
                                onReorder={handleReorderSchedule}
                                completedTaskIds={new Set(tasks.filter(t => t.completed).map(t => t.id))}
                            />
                        </div>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'analytics' && (
                <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
                    <Analytics tasks={tasks} schedule={schedule} />
                </div>
            )}

            {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8 space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none"></div>
                
                <div>
                    <h2 className="text-xl font-bold text-white mb-1 font-mono uppercase">System Configuration</h2>
                    <p className="text-sm text-zinc-500">Calibrate your productivity parameters.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">Codename</label>
                        <input 
                            type="text" 
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-white focus:border-violet-500 focus:outline-none transition-colors font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">Peak Hours</label>
                        <select 
                            value={userProfile.productiveHours}
                            onChange={(e) => setUserProfile({...userProfile, productiveHours: e.target.value})}
                            className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-white focus:border-violet-500 focus:outline-none transition-colors appearance-none cursor-pointer font-mono"
                        >
                            <option value="morning">Morning (Early Game)</option>
                            <option value="afternoon">Afternoon (Mid Game)</option>
                            <option value="night">Night (End Game)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">Boot Time</label>
                        <input 
                            type="time" 
                            value={userProfile.wakeUpTime}
                            onChange={(e) => setUserProfile({...userProfile, wakeUpTime: e.target.value})}
                            className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-white focus:border-violet-500 focus:outline-none transition-colors font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">Shutdown</label>
                        <input 
                            type="time" 
                            value={userProfile.sleepTime}
                            onChange={(e) => setUserProfile({...userProfile, sleepTime: e.target.value})}
                            className="w-full bg-black/50 border border-zinc-700 rounded p-3 text-white focus:border-violet-500 focus:outline-none transition-colors font-mono"
                        />
                    </div>
                </div>
                 <div className="pt-6 border-t border-zinc-800 flex justify-between items-center relative z-10">
                    <button 
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest hover:underline"
                    >
                        Factory Reset
                    </button>
                    <span className="text-xs text-zinc-600 font-mono">AUTO-SAVE ENABLED</span>
                </div>
            </div>
            )}
        </div>
      </main>

      {/* Overlays */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {focusTask && (
        <FocusMode 
            currentTask={focusTask} 
            onComplete={handleFocusModeComplete}
            onClose={() => setFocusTask(null)}
        />
      )}

      {editingTask && (
        <EditTaskModal 
            task={editingTask} 
            onSave={handleSaveTask} 
            onClose={() => setEditingTask(null)} 
        />
      )}

      {showInfographicModal && infographicUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-zinc-950 rounded-2xl border-2 border-zinc-800 shadow-[0_0_50px_rgba(139,92,246,0.2)] max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3 font-mono">
                          <ImageIcon className="w-5 h-5 text-violet-500" />
                          TACTICAL MAP
                      </h3>
                      <button 
                        onClick={() => setShowInfographicModal(false)}
                        className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-8 bg-zinc-950 flex-1 overflow-auto flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
                      <img 
                        src={infographicUrl} 
                        alt="Schedule Infographic" 
                        className="max-w-full h-auto rounded shadow-2xl border border-zinc-800"
                      />
                  </div>
                  <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                      <a 
                        href={infographicUrl} 
                        download={`statusbar-mission-map-${new Date().toISOString().split('T')[0]}.png`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-violet-600 text-white hover:bg-violet-500 rounded-lg font-bold text-sm transition-all shadow-lg shadow-violet-500/20 font-mono uppercase tracking-widest"
                      >
                          <Download className="w-4 h-4" />
                          Download Intel
                      </a>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};