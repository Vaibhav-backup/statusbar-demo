import React, { useState, useEffect } from 'react';
import { Task, ScheduleItem, UserProfile } from '../types';
import { generateSmartSchedule, getMotivationalNudge, generateScheduleInfographic } from '../services/geminiService';
import { Button } from './Button';
import { TaskForm } from './TaskForm';
import { Timeline } from './Timeline';
import { Analytics } from './Analytics';
import { 
  LayoutDashboard, 
  Settings, 
  RefreshCcw, 
  Zap, 
  CheckCircle2,
  LogOut,
  Calendar,
  Image as ImageIcon,
  X,
  Download
} from 'lucide-react';

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  productiveHours: "morning"
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ ...DEFAULT_PROFILE, name: user.name });
  const [nudge, setNudge] = useState<string>("System online. Let's get this bread.");
  
  // Infographic state
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [showInfographicModal, setShowInfographicModal] = useState(false);

  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };
    setTasks(prev => [...prev, task]);
  };

  const handleGenerateSchedule = async () => {
    if (tasks.length === 0) return;
    setIsGenerating(true);
    setSchedule([]); 
    setInfographicUrl(null); // Reset infographic on new schedule
    try {
      const newSchedule = await generateSmartSchedule(tasks, userProfile);
      setSchedule(newSchedule);
      
      const completed = tasks.filter(t => t.completed).length;
      const quote = await getMotivationalNudge(completed, tasks.length);
      setNudge(quote);

    } catch (error) {
      console.error(error);
      alert("Failed to generate schedule. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReOptimize = async () => {
    if(schedule.length === 0) return;
    setIsGenerating(true);
    try {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const context = `The current time is ${currentTime}. The user has requested a re-optimization. Vibes have shifted. Re-plan from ${currentTime} onwards.`;
      const newSchedule = await generateSmartSchedule(tasks.filter(t => !t.completed), userProfile, context);
      setSchedule(newSchedule);
      setNudge("Recalculating... vibes restored.");
      setInfographicUrl(null); // Reset infographic
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInfographic = async () => {
    if (schedule.length === 0) return;
    if (infographicUrl) {
        setShowInfographicModal(true);
        return;
    }
    
    setIsGeneratingInfographic(true);
    try {
        const url = await generateScheduleInfographic(schedule);
        setInfographicUrl(url);
        setShowInfographicModal(true);
    } catch (error) {
        console.error(error);
        alert("Failed to generate visual. The vibes were too strong.");
    } finally {
        setIsGeneratingInfographic(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 relative">
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center lg:items-stretch py-6 sticky top-0 h-screen z-20">
        <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold hidden lg:block tracking-tight text-white">Statusbar</span>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden lg:block font-medium">The Hub</span>
          </button>
          <button 
             onClick={() => setActiveTab('analytics')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Receipts</span>
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Vibe Check</span>
          </button>
        </nav>

        {/* User & Logout */}
        <div className="px-4 py-4 border-t border-slate-800 hidden lg:block">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
               {user.name.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-white truncate">{user.name}</p>
               <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
           </div>
           <Button variant="secondary" onClick={onLogout} className="w-full text-xs h-8">
             <LogOut className="w-3 h-3" />
             Log Out
           </Button>
        </div>

        {/* Mini Player / Focus Widget placeholder */}
        <div className="mt-4 px-4 pb-4 hidden lg:block">
           <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 Live Feed
              </div>
              <p className="text-xs text-slate-300 italic">"{nudge}"</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-white mb-1">
                {activeTab === 'dashboard' ? `Yo, ${userProfile.name}` : 
                 activeTab === 'analytics' ? 'Performance Receipts' : 'Config Vibes'}
             </h1>
             <p className="text-slate-400 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          </div>
          
          {activeTab === 'dashboard' && schedule.length > 0 && (
            <div className="flex gap-2">
                 <Button variant="secondary" onClick={handleReOptimize} isLoading={isGenerating}>
                  <RefreshCcw className="w-4 h-4" />
                  Fix My Vibes
                </Button>
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Tasks & Input */}
            <div className="lg:col-span-4 space-y-6">
              <TaskForm onAddTask={handleAddTask} />
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                  <h3 className="font-semibold text-slate-200">Backlog</h3>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{tasks.length}</span>
                </div>
                <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No tasks. You're chilling.</div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="p-3 hover:bg-slate-700/50 transition-colors flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                task.priority === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-600/20 text-slate-400'
                            }`}>{task.priority}</span>
                            <span className="text-[10px] text-slate-500">{task.durationMinutes}m</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-slate-800 border-t border-slate-700">
                    <Button onClick={handleGenerateSchedule} className="w-full" disabled={tasks.length === 0} isLoading={isGenerating}>
                        <Calendar className="w-4 h-4" />
                        Generate The Plan
                    </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-8">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 min-h-[600px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        Today's Plot
                        {schedule.length > 0 && <span className="text-xs font-normal text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Cooked</span>}
                    </h3>
                     {schedule.length > 0 && (
                        <Button 
                            variant="secondary" 
                            onClick={handleGenerateInfographic} 
                            isLoading={isGeneratingInfographic}
                            className="text-xs h-8"
                        >
                            <ImageIcon className="w-4 h-4" />
                            {infographicUrl ? 'Show Visuals' : 'Visualize Plot'}
                        </Button>
                    )}
                </div>
                <Timeline schedule={schedule} isLoading={isGenerating} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto">
             <Analytics tasks={tasks} schedule={schedule} />
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl border border-slate-700 p-8 space-y-6">
              <h2 className="text-xl font-semibold text-white">Main Character Config</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Peak Energy</label>
                      <select 
                        value={userProfile.productiveHours}
                        onChange={(e) => setUserProfile({...userProfile, productiveHours: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      >
                          <option value="morning">Morning Person (Early Bird)</option>
                          <option value="afternoon">Afternoon Flow</option>
                          <option value="night">Night Owl (Demon Mode)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Wake Up Time</label>
                      <input 
                        type="time" 
                        value={userProfile.wakeUpTime}
                        onChange={(e) => setUserProfile({...userProfile, wakeUpTime: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Sleep Time</label>
                      <input 
                        type="time" 
                        value={userProfile.sleepTime}
                        onChange={(e) => setUserProfile({...userProfile, sleepTime: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                  </div>
              </div>
              <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">Settings auto-saved. No cap.</p>
              </div>
           </div>
        )}

      </main>

      {/* Infographic Modal */}
      {showInfographicModal && infographicUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-emerald-400" />
                          Visual Vibe Check
                      </h3>
                      <button 
                        onClick={() => setShowInfographicModal(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-4 bg-slate-950 flex-1 overflow-auto flex items-center justify-center">
                      <img 
                        src={infographicUrl} 
                        alt="Schedule Infographic" 
                        className="max-w-full h-auto rounded-lg shadow-lg"
                      />
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2">
                      <a 
                        href={infographicUrl} 
                        download={`statusbar-schedule-${new Date().toISOString().split('T')[0]}.png`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                          <Download className="w-4 h-4" />
                          Save to Camera Roll
                      </a>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};