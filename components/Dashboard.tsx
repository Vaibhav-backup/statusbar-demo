
import React, { useState, useEffect } from 'react';
import { Task, ScheduleItem, UserProfile, ToastMessage, PomodoroSettings, Theme } from '../types';
import { generateSmartSchedule, getMotivationalNudge, generateScheduleInfographic } from '../services/geminiService';
import { Button } from './Button';
import { TaskForm } from './TaskForm';
import { Timeline } from './Timeline';
import { Analytics } from './Analytics';
import { EditTaskModal } from './EditTaskModal';
import { FocusMode } from './FocusMode';
import { ToastContainer } from './Toast';
import { PomodoroTimer } from './PomodoroTimer';
import { TaskHistory } from './TaskHistory';
import { DailyVibeCheck } from './DailyVibeCheck';
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
  Flame,
  Timer,
  Palette,
  Archive,
  History
} from 'lucide-react';

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onThemeChange?: (theme: Theme) => void;
}

const DEFAULT_POMODORO: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false
};

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  productiveHours: "morning",
  aura: 0,
  pomodoroSettings: DEFAULT_POMODORO,
  theme: 'cyber'
};

const THEMES: {id: Theme, label: string, color: string}[] = [
  { id: 'cyber', label: 'Cyber Arcade', color: '#8b5cf6' },
  { id: 'y2k', label: 'Y2K Matrix', color: '#22c55e' },
  { id: 'brat', label: 'Brat Summer', color: '#84cc16' },
  { id: 'cozy', label: 'Lo-Fi Chill', color: '#fdba74' },
  { id: 'drift', label: 'Night Drift', color: '#f43f5e' }
];

// Simple particle system component
const ParticleExplosion = ({ x, y }: { x: number, y: number }) => {
    return (
        <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
            {[...Array(12)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary animate-[ping_0.8s_ease-out_forwards]"
                    style={{
                        transform: `rotate(${i * 30}deg) translate(20px)`,
                        opacity: 0
                    }}
                ></div>
            ))}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history' | 'settings'>('dashboard');
  
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
    const parsed = saved ? JSON.parse(saved) : { ...DEFAULT_PROFILE, name: user.name };
    if (!parsed.pomodoroSettings) parsed.pomodoroSettings = DEFAULT_POMODORO;
    if (!parsed.theme) parsed.theme = 'cyber';
    return parsed;
  });
  const [brainDump, setBrainDump] = useState(() => localStorage.getItem('statusbar_notes') || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [nudge, setNudge] = useState<string>("SYSTEM ONLINE. READY FOR INPUT.");
  const [scheduleContext, setScheduleContext] = useState('');
  
  // UI States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<ScheduleItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  
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
  useEffect(() => { 
      localStorage.setItem('statusbar_profile', JSON.stringify(userProfile)); 
      if (onThemeChange) onThemeChange(userProfile.theme);
  }, [userProfile, onThemeChange]);
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
      completed: false,
      timeSpent: 0
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
    addToast(`PURGED ${completed.length} RECORDS`, "info");
  };

  const handleGenerateSchedule = async () => {
    // Filter out completed tasks for scheduling
    const activeTasks = tasks.filter(t => !t.completed);
    if (activeTasks.length === 0) {
        addToast("NO ACTIVE QUESTS", "info");
        return;
    }
    
    setIsGenerating(true);
    setSchedule([]); 
    setInfographicUrl(null); 
    try {
      const context = scheduleContext.trim() || "Standard productivity flow";
      const newSchedule = await generateSmartSchedule(activeTasks, userProfile, context);
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
      const context = `${scheduleContext}. Current time: ${currentTime}. Re-optimize.`;
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
    const now = new Date().toISOString();

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) earnedXp = 100; 
        else earnedXp = -100;
        return { 
            ...t, 
            completed: isNowCompleted,
            completedAt: isNowCompleted ? now : undefined
        };
      }
      return t;
    }));

    setUserProfile(prev => ({ ...prev, aura: Math.max(0, prev.aura + earnedXp) }));
    
    if (earnedXp > 0) {
        const nudges = ["+100 AURA", "COMBO BREAK!", "QUEST COMPLETE", "XP GAINED"];
        addToast(nudges[Math.floor(Math.random() * nudges.length)], "success");
    }
  };

  const handleFocusTask = (item: ScheduleItem) => {
      setFocusTask(item);
  };

  const updateTaskTimeSpent = (taskId: string, minutes: number) => {
      setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
              return { ...t, timeSpent: (t.timeSpent || 0) + minutes };
          }
          return t;
      }));
  };

  const handleFocusModeComplete = (minutesSpent: number) => {
      if (focusTask && !focusTask.isBreak) {
          handleToggleTask(focusTask.taskId);
          updateTaskTimeSpent(focusTask.taskId, minutesSpent);
      }
      setFocusTask(null);
  };

  const handleFocusModeClose = (minutesSpent: number) => {
      if (focusTask && !focusTask.isBreak) {
          updateTaskTimeSpent(focusTask.taskId, minutesSpent);
          if (minutesSpent > 0) {
              addToast(`LOGGED ${minutesSpent}M WORK`, "info");
          }
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

  const updatePomodoroSettings = (newSettings: PomodoroSettings) => {
    setUserProfile(prev => ({
        ...prev,
        pomodoroSettings: newSettings
    }));
  };

  const handleVibeSelect = (vibe: string, context: string) => {
     setScheduleContext(context);
     addToast(`VIBE CALIBRATED: ${vibe}`, "success");
     // If schedule exists, we could prompt to re-roll, but for now just updating context for next action is good.
     if (schedule.length > 0) {
         addToast("HIT REROLL TO APPLY", "info");
     }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary selection:text-primary-fg overflow-hidden transition-colors duration-500">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-border bg-surface/80 backdrop-blur-xl sticky top-0 h-screen z-20 shadow-2xl">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="w-10 h-10 bg-primary rounded-lg transform rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:rotate-6 transition-transform">
              <Gamepad2 className="text-primary-fg w-6 h-6" />
            </div>
            <div>
                 <span className="text-2xl font-bold tracking-tighter text-foreground font-mono">STATUSBAR</span>
                 <div className="h-0.5 w-full bg-gradient-to-r from-primary to-transparent"></div>
            </div>
          </div>

          <div className="mb-8">
             <div className="bg-surface-highlight/50 rounded-xl p-4 border border-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Current Lvl</span>
                    <span className="text-primary font-bold font-mono text-xl">{getLevel(userProfile.aura)}</span>
                </div>
                {/* Custom XP Bar */}
                <div className="relative h-4 bg-black rounded-full border border-border overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                         <span className="text-[9px] font-bold text-white/50">{userProfile.aura} / {getLevel(userProfile.aura) * 1000}</span>
                    </div>
                    <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.8)]" 
                        style={{ width: `${getProgress(userProfile.aura)}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-[10px] text-muted text-center font-mono">
                    AURA SYNCHRONIZATION
                </div>
             </div>
          </div>

          <nav className="space-y-2">
            {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'MISSION CONTROL' },
                { id: 'analytics', icon: Trophy, label: 'LEADERBOARD' },
                { id: 'history', icon: History, label: 'ARCHIVES' },
                { id: 'settings', icon: Settings, label: 'SYSTEM CONFIG' }
            ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 border
                    ${activeTab === item.id 
                        ? 'bg-surface border-primary/50 text-foreground shadow-[0_0_15px_rgba(var(--primary),0.2)] translate-x-1' 
                        : 'border-transparent text-muted hover:text-foreground hover:bg-surface-highlight'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary' : ''}`} />
                  <span className="font-mono">{item.label}</span>
                </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border bg-surface/50">
           {/* Timer Toggle */}
           <button 
             onClick={() => setShowPomodoro(!showPomodoro)}
             className={`w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
               showPomodoro 
               ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]' 
               : 'bg-surface border-border text-muted hover:text-foreground hover:border-border'
             }`}
           >
             <Timer className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest font-mono">
               {showPomodoro ? 'Hide Timer' : 'Show Timer'}
             </span>
           </button>

           <div className="mb-6 bg-black/40 rounded-lg p-3 border-l-2 border-primary font-mono">
              <div className="flex items-center gap-2 mb-1">
                 <Zap className="w-3 h-3 text-primary animate-pulse" />
                 <span className="text-[9px] font-bold text-primary uppercase">System Msg</span>
              </div>
              <p className="text-xs text-muted leading-tight">"{nudge}"</p>
           </div>

           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-surface-highlight flex items-center justify-center text-xs font-bold text-foreground border border-border shadow-lg">
                 {user.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs font-bold text-foreground uppercase tracking-wider truncate w-24 font-mono">{user.name}</p>
                 <p className="text-[9px] text-primary">ONLINE</p>
               </div>
             </div>
             <button onClick={onLogout} className="text-muted hover:text-red-500 transition-colors">
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
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <Gamepad2 className="text-primary w-5 h-5" />
                <span className="font-bold text-foreground font-mono tracking-tighter">STATUSBAR</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-muted">
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 z-20 space-y-2 shadow-2xl">
                 <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-foreground font-mono text-sm bg-surface rounded border border-border">MISSION CONTROL</button>
                 <button onClick={() => {setActiveTab('analytics'); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-muted font-mono text-sm hover:bg-surface rounded">LEADERBOARD</button>
                 <button onClick={() => {setActiveTab('history'); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-muted font-mono text-sm hover:bg-surface rounded">ARCHIVES</button>
                 <button onClick={() => {setShowPomodoro(!showPomodoro); setMobileMenuOpen(false)}} className="block w-full text-left py-3 px-4 text-primary font-mono text-sm hover:bg-surface rounded">TOGGLE TIMER</button>
                 <button onClick={onLogout} className="block w-full text-left py-3 px-4 text-red-500 font-mono text-sm hover:bg-surface rounded">LOG OUT</button>
            </div>
        )}

        <div className="max-w-7xl mx-auto p-6 lg:p-12 pb-32">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter mb-2 font-mono uppercase glitch-text" style={{ textShadow: "2px 2px 0px var(--primary)" }}>
                        {activeTab === 'dashboard' && getGreeting()}
                        {activeTab === 'analytics' && "STATS & LOOT"}
                        {activeTab === 'history' && "MISSION LOGS"}
                        {activeTab === 'settings' && "CONFIG"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        <p className="text-muted text-sm font-mono uppercase tracking-widest">
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
                    <DailyVibeCheck onVibeSelect={handleVibeSelect} currentContext={scheduleContext} />

                    <TaskForm onAddTask={handleAddTask} />
                    
                    {/* Brain Dump Area */}
                    <div className="bg-surface/40 rounded-xl border border-border backdrop-blur-sm p-1 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-50 transition-opacity">
                             <BrainCircuit className="w-12 h-12 text-primary" />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-primary mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Thought Stream</h3>
                            </div>
                            <textarea 
                                value={brainDump}
                                onChange={(e) => setBrainDump(e.target.value)}
                                placeholder="// Input raw data..."
                                className="w-full h-24 bg-black/30 rounded-lg border border-border p-3 text-sm text-muted placeholder-zinc-700 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div className="bg-surface/40 rounded-xl border border-border backdrop-blur-sm overflow-hidden flex flex-col h-[400px]">
                        <div className="p-4 border-b border-border bg-surface/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-secondary rounded-sm"></span>
                                Quest Log
                            </h3>
                            <div className="flex gap-2">
                                {tasks.some(t => t.completed) && (
                                    <button onClick={handleClearCompleted} className="text-[10px] uppercase font-bold text-muted hover:text-red-400 transition-colors bg-surface-highlight px-2 py-1 rounded">
                                        Purge Log
                                    </button>
                                )}
                                <span className="text-xs font-mono font-bold text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20">{tasks.length}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-border overflow-y-auto custom-scrollbar flex-1 p-2">
                            {tasks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted text-center space-y-2 opacity-50">
                                    <Gamepad2 className="w-8 h-8" />
                                    <p className="text-xs font-mono uppercase">No Quests Active</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                <div key={task.id} className="p-3 hover:bg-surface-highlight/50 rounded-lg transition-colors duration-200 flex items-center gap-3 group relative border border-transparent hover:border-border">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={task.completed}
                                            onClick={(e) => handleToggleTask(task.id, e)}
                                            readOnly
                                            className="checkbox-pop peer w-5 h-5 rounded border-2 border-muted bg-background checked:bg-primary checked:border-primary focus:ring-0 cursor-pointer appearance-none transition-all"
                                        />
                                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-primary-fg pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    
                                    <div className={`flex-1 min-w-0 transition-all duration-300 ${task.completed ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                                        <p className={`text-sm font-bold truncate font-mono ${task.completed ? 'line-through text-muted' : 'text-foreground group-hover:text-primary'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                                task.priority === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                task.priority === 'Medium' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                'border-border text-muted bg-surface'
                                            }`}>{task.priority}</span>
                                            <span className="text-[9px] font-mono text-muted py-0.5">{task.durationMinutes}m</span>
                                            {task.timeSpent && task.timeSpent > 0 && (
                                                <span className="text-[9px] font-mono text-primary py-0.5 ml-auto flex items-center gap-1">
                                                    <Flame className="w-2 h-2" />
                                                    {task.timeSpent}m
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inline Edit/Delete */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-surface border border-border rounded-md p-1 shadow-xl z-10">
                                        <button onClick={() => handleEditTaskClick(task.id)} className="p-1 text-muted hover:text-foreground hover:bg-surface-highlight rounded">
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-muted hover:text-red-400 hover:bg-surface-highlight rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-surface/80 border-t border-border backdrop-blur-md space-y-3">
                            {/* Context Input */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={scheduleContext}
                                    onChange={(e) => setScheduleContext(e.target.value)}
                                    placeholder="Mission Strategy (e.g. 'Speedrun', 'Chill')"
                                    className="w-full bg-black/50 border border-border rounded px-3 py-2 text-xs text-foreground placeholder-zinc-600 focus:border-primary focus:outline-none font-mono"
                                />
                                <BrainCircuit className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted" />
                            </div>

                            <Button variant="neon" onClick={handleGenerateSchedule} className="w-full" disabled={tasks.length === 0} isLoading={isGenerating}>
                                <Zap className="w-4 h-4" />
                                INITIALIZE RUN
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-8 animate-in slide-in-from-right-4 duration-700 delay-200">
                    <div className="bg-surface/20 rounded-3xl p-1 min-h-[600px] transition-all relative">
                        {/* Decorative HUD corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-xl pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-xl pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-8 pl-4 pt-4 pr-4">
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-2xl font-bold text-foreground font-mono tracking-tighter uppercase text-shadow-neon">Active Timeline</h3>
                                {schedule.length > 0 && (
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded animate-pulse">
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
                                onFocus={handleFocusTask}
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
            
            {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
                    <TaskHistory tasks={tasks} />
                </div>
            )}

            {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto bg-surface/60 backdrop-blur-xl rounded-2xl border border-border p-8 space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-zinc-800/20 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none"></div>
                
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1 font-mono uppercase">System Configuration</h2>
                    <p className="text-sm text-muted">Calibrate your productivity parameters.</p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-4 relative z-10">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Visual Interface
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setUserProfile({...userProfile, theme: theme.id})}
                          className={`
                             group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                             ${userProfile.theme === theme.id 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border bg-black/40 hover:border-border/80'
                             }
                          `}
                        >
                           <div 
                              className="w-8 h-8 rounded-full shadow-lg"
                              style={{ backgroundColor: theme.color }}
                           ></div>
                           <span className={`text-[10px] font-bold uppercase font-mono ${userProfile.theme === theme.id ? 'text-primary' : 'text-muted'}`}>
                             {theme.label}
                           </span>
                           {userProfile.theme === theme.id && (
                             <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                           )}
                        </button>
                      ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Codename</label>
                        <input 
                            type="text" 
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            className="w-full bg-black/50 border border-border rounded p-3 text-foreground focus:border-primary focus:outline-none transition-colors font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Peak Hours</label>
                        <select 
                            value={userProfile.productiveHours}
                            onChange={(e) => setUserProfile({...userProfile, productiveHours: e.target.value})}
                            className="w-full bg-black/50 border border-border rounded p-3 text-foreground focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer font-mono"
                        >
                            <option value="morning">Morning (Early Game)</option>
                            <option value="afternoon">Afternoon (Mid Game)</option>
                            <option value="night">Night (End Game)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Boot Time</label>
                        <input 
                            type="time" 
                            value={userProfile.wakeUpTime}
                            onChange={(e) => setUserProfile({...userProfile, wakeUpTime: e.target.value})}
                            className="w-full bg-black/50 border border-border rounded p-3 text-foreground focus:border-primary focus:outline-none transition-colors font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider font-mono">Shutdown</label>
                        <input 
                            type="time" 
                            value={userProfile.sleepTime}
                            onChange={(e) => setUserProfile({...userProfile, sleepTime: e.target.value})}
                            className="w-full bg-black/50 border border-border rounded p-3 text-foreground focus:border-primary focus:outline-none transition-colors font-mono"
                        />
                    </div>
                </div>
                 <div className="pt-6 border-t border-border flex justify-between items-center relative z-10">
                    <button 
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest hover:underline"
                    >
                        Factory Reset
                    </button>
                    <span className="text-xs text-muted font-mono">AUTO-SAVE ENABLED</span>
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
            onClose={handleFocusModeClose}
        />
      )}

      {showPomodoro && userProfile.pomodoroSettings && (
        <PomodoroTimer 
            settings={userProfile.pomodoroSettings} 
            onUpdateSettings={updatePomodoroSettings} 
            onClose={() => setShowPomodoro(false)} 
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
              <div className="bg-background rounded-2xl border-2 border-border shadow-[0_0_50px_rgba(var(--primary),0.2)] max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center p-6 border-b border-border bg-surface/50">
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-3 font-mono">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          TACTICAL MAP
                      </h3>
                      <button 
                        onClick={() => setShowInfographicModal(false)}
                        className="text-muted hover:text-foreground transition-colors p-2 hover:bg-surface rounded-full"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-8 bg-background flex-1 overflow-auto flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-100">
                      <img 
                        src={infographicUrl} 
                        alt="Schedule Infographic" 
                        className="max-w-full h-auto rounded shadow-2xl border border-border"
                      />
                  </div>
                  <div className="p-6 border-t border-border bg-surface/50 flex justify-end gap-3">
                      <a 
                        href={infographicUrl} 
                        download={`statusbar-mission-map-${new Date().toISOString().split('T')[0]}.png`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-fg hover:bg-primary/90 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20 font-mono uppercase tracking-widest"
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
