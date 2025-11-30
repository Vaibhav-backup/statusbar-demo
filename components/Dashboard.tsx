import React, { useState, useEffect } from 'react';
import { Task, ScheduleItem, UserProfile, ToastMessage, PomodoroSettings, Theme, TaskCategory } from '../types';
import { generateSmartSchedule, getMotivationalNudge, generateScheduleInfographic, roastSchedule } from '../services/geminiService';
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
import { MoodTracker } from './MoodTracker';
import { YapPad } from './YapPad';
import { RoastModal } from './RoastModal';
import { ReceiptModal } from './ReceiptModal';
import { 
  LayoutDashboard, 
  Settings, 
  RefreshCcw, 
  Zap, 
  CheckCircle2,
  LogOut,
  CalendarPlus,
  Image as ImageIcon,
  X,
  Download,
  Menu,
  Trash2,
  BrainCircuit,
  Pencil,
  Gamepad2,
  Trophy,
  Flame,
  Timer,
  Palette,
  History,
  Receipt,
  Skull
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
  theme: 'cyber',
  streak: 0,
  lastLoginDate: new Date().toISOString().split('T')[0]
};

const THEMES: {id: Theme, label: string, color: string}[] = [
  { id: 'cyber', label: 'Cyber Arcade', color: '#8b5cf6' },
  { id: 'y2k', label: 'Y2K Matrix', color: '#22c55e' },
  { id: 'brat', label: 'Brat Summer', color: '#84cc16' },
  { id: 'cozy', label: 'Lo-Fi Chill', color: '#fdba74' },
  { id: 'drift', label: 'Night Drift', color: '#f43f5e' },
  { id: 'vapor', label: 'Vaporwave', color: '#00f0ff' },
  { id: 'acid', label: 'Acid Pixie', color: '#ccff00' },
  { id: 'goth', label: 'Whimsigoth', color: '#9d4edd' },
  { id: 'cloud', label: 'Cloud Dream', color: '#c084fc' },
  { id: 'retro', label: 'Retro 90s', color: '#f59e0b' },
  { id: 'glitch', label: 'Glitchcore', color: '#ff003c' },
  { id: 'luxe', label: 'Old Money', color: '#d4af37' },
  { id: 'void', label: 'Pure Void', color: '#ffffff' },
  { id: 'sunset', label: 'Golden Hour', color: '#f97316' },
  { id: 'mint', label: 'Mint Fresh', color: '#34d399' }
];

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
    if (parsed.streak === undefined) parsed.streak = 0;
    return parsed;
  });
  const [yapText, setYapText] = useState(() => localStorage.getItem('statusbar_yap') || '');

  // Feature States
  const [rotMode, setRotMode] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

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
  useEffect(() => { localStorage.setItem('statusbar_yap', yapText); }, [yapText]);

  // Rot Mode Effect
  useEffect(() => {
    if (rotMode) {
      document.body.classList.add('rot-mode');
    } else {
      document.body.classList.remove('rot-mode');
    }
  }, [rotMode]);

  // Streak Logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (userProfile.lastLoginDate !== today) {
        const lastLogin = new Date(userProfile.lastLoginDate);
        const diff = Math.floor((new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStreak = userProfile.streak;
        if (diff === 1) {
            newStreak += 1; // Consecutive day
        } else if (diff > 1) {
            newStreak = 0; // Streak broken
        }

        setUserProfile(prev => ({
            ...prev,
            lastLoginDate: today,
            streak: newStreak
        }));
    }
  }, []);

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

  // New: Handle Tasks from YapPad
  const handleAddYapTasks = (newTasks: any[]) => {
      newTasks.forEach(t => {
          handleAddTask({
              title: t.title,
              priority: t.priority,
              durationMinutes: 30,
              category: TaskCategory.Work,
              energyRequired: 'Medium' as any
          });
      });
      addToast(`EXTRACTED ${newTasks.length} TASKS`, "success");
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

  // Roast Feature
  const handleRoast = async () => {
    setIsGenerating(true);
    try {
        const roastText = await roastSchedule(schedule);
        setRoast(roastText);
    } catch (e) {
        addToast("ROAST MACHINE BROKE", "error");
    } finally {
        setIsGenerating(false);
    }
  };

  // Rot Mode Toggle
  const toggleRotMode = () => {
      setRotMode(!rotMode);
      if (!rotMode) {
          addToast("ROT PROTOCOL ENGAGED", "info");
          setNudge("It's okay to do nothing. Go nap.");
      } else {
          addToast("SYSTEM REBOOTING...", "success");
          setNudge("We are so back.");
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
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//NEXUS//AI Schedule//EN\n";
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
            icsContent += `UID:${item.id}@nexus.ai\n`;
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
    link.setAttribute('download', `nexus-mission-${now.toISOString().split('T')[0]}.ics`);
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
     if (schedule.length > 0) {
         addToast("HIT REROLL TO APPLY", "info");
     }
  };

  const handleMoodSelect = (mood: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setScheduleContext(prev => {
        const cleanPrev = prev.replace(/\[Mood:.*?\]/g, '').trim();
        return `${cleanPrev} [Mood: ${mood}]`.trim();
    });
    addToast(`LOGGED: ${mood}`, "info");
    if (schedule.length > 0) {
         addToast("REROLL SUGGESTED", "info");
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary selection:text-primary-fg overflow-hidden transition-colors duration-500">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 flex-col border-r border-border bg-surface/80 backdrop-blur-xl sticky top-0 h-screen z-20 shadow-2xl">
        {/* Header - Fixed */}
        <div className="p-6">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-primary rounded-lg transform rotate-3 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:rotate-6 transition-transform">
              <Gamepad2 className="text-primary-fg w-6 h-6" />
            </div>
            <div>
                 <span className="text-2xl font-bold tracking-tighter text-foreground font-mono">NEXUS</span>
                 <div className="h-0.5 w-full bg-gradient-to-r from-primary to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-8">
            <div className="space-y-4">
                {/* Aura Bar */}
                <div className="bg-surface-highlight/50 rounded-xl p-4 border border-border relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">Current Lvl</span>
                        <span className="text-primary font-bold font-mono text-xl">{getLevel(userProfile.aura)}</span>
                    </div>
                    <div className="relative h-4 bg-black rounded-full border border-border overflow-hidden shadow-inner">
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="text-[9px] font-bold text-white/50">{userProfile.aura} / {getLevel(userProfile.aura) * 1000}</span>
                        </div>
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.8)]" 
                            style={{ width: `${getProgress(userProfile.aura)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Streak Flame */}
                <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl no-rot">
                    <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                        <Flame className={`w-5 h-5 text-orange-500 ${userProfile.streak > 0 ? 'animate-pulse' : 'opacity-50'}`} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">Daily Streak</div>
                        <div className="text-lg font-bold text-orange-500 font-mono">{userProfile.streak} Days</div>
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

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-border bg-surface/50 mt-auto">
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
         {explosion && <ParticleExplosion x={explosion.x} y={explosion.y} />}

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-lg">
                   <Gamepad2 className="text-primary-fg w-5 h-5" />
                </div>
                <span className="font-bold text-foreground font-mono tracking-tighter text-lg">NEXUS</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-muted p-2 hover:bg-surface rounded-lg transition-colors">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-16 bg-background z-40 animate-in slide-in-from-top-10 duration-200 flex flex-col p-4 space-y-4 overflow-y-auto">
                 <div className="space-y-2">
                     <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className={`block w-full text-left py-4 px-4 font-mono text-sm rounded-xl transition-colors border ${activeTab === 'dashboard' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-foreground'}`}>MISSION CONTROL</button>
                     <button onClick={() => {setActiveTab('analytics'); setMobileMenuOpen(false)}} className={`block w-full text-left py-4 px-4 font-mono text-sm rounded-xl transition-colors border ${activeTab === 'analytics' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-muted'}`}>LEADERBOARD</button>
                     <button onClick={() => {setActiveTab('history'); setMobileMenuOpen(false)}} className={`block w-full text-left py-4 px-4 font-mono text-sm rounded-xl transition-colors border ${activeTab === 'history' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-muted'}`}>ARCHIVES</button>
                     <button onClick={() => {setActiveTab('settings'); setMobileMenuOpen(false)}} className={`block w-full text-left py-4 px-4 font-mono text-sm rounded-xl transition-colors border ${activeTab === 'settings' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-muted'}`}>SYSTEM CONFIG</button>
                 </div>
                 
                 <div className="h-px bg-border my-2"></div>
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-surface p-4 rounded-xl border border-border">
                         <p className="text-[10px] text-muted uppercase font-mono mb-1">Current Aura</p>
                         <p className="text-xl font-bold text-primary font-mono">{userProfile.aura}</p>
                     </div>
                     <div className="bg-surface p-4 rounded-xl border border-border">
                         <p className="text-[10px] text-muted uppercase font-mono mb-1">Streak</p>
                         <p className="text-xl font-bold text-orange-500 font-mono">{userProfile.streak}</p>
                     </div>
                 </div>

                 <Button onClick={() => {setShowPomodoro(!showPomodoro); setMobileMenuOpen(false)}} variant="outline" className="w-full justify-start">
                     <Timer className="w-4 h-4 mr-2" /> TOGGLE TIMER
                 </Button>
                 
                 <Button onClick={onLogout} variant="danger" className="w-full justify-start mt-auto">
                     <LogOut className="w-4 h-4 mr-2" /> LOG OUT
                 </Button>
            </div>
        )}

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-12 pb-32">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 lg:mb-12 gap-6 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tighter mb-2 font-mono uppercase glitch-text leading-tight" style={{ textShadow: "2px 2px 0px var(--primary)" }}>
                        {activeTab === 'dashboard' && getGreeting()}
                        {activeTab === 'analytics' && "STATS & LOOT"}
                        {activeTab === 'history' && "MISSION LOGS"}
                        {activeTab === 'settings' && "CONFIG"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${rotMode ? 'bg-red-500' : 'bg-primary'}`}></span>
                        <p className="text-muted text-xs md:text-sm font-mono uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                
                {activeTab === 'dashboard' && (
                    <div className="flex flex-wrap gap-2 no-rot">
                        <button 
                            onClick={toggleRotMode}
                            className={`px-3 py-2 rounded-lg font-mono font-bold text-xs uppercase transition-all flex items-center gap-2 border ${
                                rotMode 
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-400 shadow-inner' 
                                : 'bg-surface border-border text-muted hover:text-foreground'
                            }`}
                        >
                            <Skull className="w-4 h-4" />
                            {rotMode ? 'Rot Enabled' : 'Rot Mode'}
                        </button>
                        {schedule.length > 0 && (
                            <Button variant="outline" onClick={handleReOptimize} isLoading={isGenerating} className="text-xs px-4 h-10">
                                <RefreshCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline ml-2">REROLL</span>
                            </Button>
                        )}
                    </div>
                )}
            </header>

            {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 relative">
                {/* Left Column - Input & Context */}
                <div className="lg:col-span-4 space-y-4">
                    <DailyVibeCheck onVibeSelect={handleVibeSelect} currentContext={scheduleContext} />
                    <MoodTracker onMoodSelect={handleMoodSelect} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border p-4 space-y-2">
                             <div className="flex items-center gap-2 mb-2">
                                 <Trophy className="w-4 h-4 text-primary" />
                                 <h3 className="text-xs font-bold font-mono text-foreground uppercase">Aura</h3>
                             </div>
                             <div className="text-2xl font-bold font-mono text-primary">{userProfile.aura}</div>
                             <div className="relative h-2 bg-black rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-primary" style={{ width: `${getProgress(userProfile.aura)}%` }}></div>
                             </div>
                        </div>
                        <div className="bg-surface/40 backdrop-blur-md rounded-2xl border border-border p-4 space-y-2 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowPomodoro(true)}>
                             <div className="flex items-center gap-2 mb-2">
                                 <Timer className="w-4 h-4 text-primary" />
                                 <h3 className="text-xs font-bold font-mono text-foreground uppercase">Focus</h3>
                             </div>
                             <div className="text-xs text-muted font-mono">Quick Access</div>
                             <div className="text-xs font-bold text-primary font-mono uppercase">START TIMER &rarr;</div>
                        </div>
                    </div>

                    <TaskForm onAddTask={handleAddTask} />
                    
                    <YapPad 
                        value={yapText}
                        onChange={setYapText}
                        onAddTasks={handleAddYapTasks}
                    />

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
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-surface border border-border rounded-md p-1 shadow-xl z-10">
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
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={scheduleContext}
                                    onChange={(e) => setScheduleContext(e.target.value)}
                                    placeholder="Strategy (e.g. 'Speedrun')"
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

                {/* Right Column - Timeline */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-surface/20 rounded-3xl p-1 min-h-[500px] transition-all relative">
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-xl pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pl-4 pt-4 pr-4 gap-4">
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-xl md:text-2xl font-bold text-foreground font-mono tracking-tighter uppercase text-shadow-neon">Active Timeline</h3>
                                {schedule.length > 0 && (
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded animate-pulse">
                                        Live
                                    </span>
                                )}
                            </div>
                            {schedule.length > 0 && (
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                    {schedule.find(s => !tasks.find(t=>t.id===s.taskId)?.completed && !s.isBreak) && (
                                        <Button 
                                            variant="neon"
                                            onClick={() => setFocusTask(schedule.find(s => !tasks.find(t=>t.id===s.taskId)?.completed && !s.isBreak) || null)}
                                            className="text-xs h-9 px-4 flex-1 sm:flex-none"
                                        >
                                            <Flame className="w-3.5 h-3.5 mr-1" />
                                            BOSS MODE
                                        </Button>
                                    )}
                                    <div className="flex gap-2 ml-auto sm:ml-0">
                                        <Button variant="danger" onClick={handleRoast} className="text-xs h-9 px-3" title="Roast my schedule">
                                            <Flame className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="secondary" onClick={() => setShowReceipt(true)} className="text-xs h-9 px-3" title="View Receipt">
                                            <Receipt className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="secondary" onClick={handleExportICS} className="text-xs h-9 px-3">
                                            <CalendarPlus className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="secondary" onClick={handleGenerateInfographic} isLoading={isGeneratingInfographic} className="text-xs h-9 px-3">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-0 sm:p-2">
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

      {roast && (
        <RoastModal roast={roast} onClose={() => setRoast(null)} />
      )}

      {showReceipt && (
        <ReceiptModal schedule={schedule} user={userProfile} onClose={() => setShowReceipt(false)} />
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
                        download={`nexus-mission-map-${new Date().toISOString().split('T')[0]}.png`}
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