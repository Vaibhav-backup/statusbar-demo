import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  Zap, Brain, Sparkles, ArrowRight, Layout, 
  Flame, Trophy, Calendar, CheckCircle2, 
  BatteryCharging, MousePointer2, Lock, 
  BarChart3, RefreshCcw, Command
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface LandingPageProps {
  onGetStarted: () => void;
}

// --- Mock Components for Demo ---

const MockTimeline = () => {
  const [tasks, setTasks] = useState([
    { id: 1, time: '09:00', title: 'Deep Work Protocol', cat: 'Work', completed: false },
    { id: 2, time: '11:30', title: 'Touch Grass', cat: 'Break', completed: false },
    { id: 3, time: '12:00', title: 'System Architecture', cat: 'Study', completed: false },
  ]);

  const toggle = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-3 font-mono text-sm">
      {tasks.map((t, i) => (
        <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${t.completed ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70' : 'bg-zinc-900 border-zinc-800 hover:border-violet-500/50'}`} onClick={() => toggle(t.id)}>
          <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
            {t.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
          </div>
          <span className="text-zinc-500 text-xs">{t.time}</span>
          <span className={t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>{t.title}</span>
        </div>
      ))}
      <div className="text-center text-xs text-zinc-600 pt-2 animate-pulse">Click tasks to simulate completion</div>
    </div>
  );
};

const MockFocus = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(1500); // 25 min

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setTime(t => t > 0 ? t - 1 : 1500), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const mins = Math.floor(time / 60);
  const secs = time % 60;

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-6xl font-mono font-bold tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        {mins}:{secs < 10 ? '0' : ''}{secs}
      </div>
      <Button variant={isActive ? "secondary" : "neon"} onClick={() => setIsActive(!isActive)} className="px-8">
        {isActive ? "PAUSE" : "ENGAGE FOCUS"}
      </Button>
    </div>
  );
};

const MockStats = () => {
  const data = [
    { name: 'Work', value: 65, color: '#8b5cf6' },
    { name: 'Health', value: 15, color: '#10b981' },
    { name: 'Study', value: 20, color: '#f59e0b' },
  ];

  return (
    <div className="flex items-center gap-8 justify-center h-full">
        <div className="w-32 h-32 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-xs font-bold text-white">Lvl 5</span>
             </div>
        </div>
        <div className="space-y-2 text-xs font-mono">
            {data.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                    <span className="text-zinc-400">{d.name}</span>
                    <span className="text-white font-bold">{d.value}%</span>
                </div>
            ))}
        </div>
    </div>
  );
};

// --- Main Component ---

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [demoTab, setDemoTab] = useState<'schedule' | 'focus' | 'stats'>('schedule');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 selection:text-violet-200 font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={onGetStarted}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Zap className="text-black w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight font-mono">NEXUS_</span>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={onGetStarted} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors hidden sm:block">Log In</button>
              <Button variant="primary" onClick={onGetStarted} className="px-5 py-2 h-auto text-xs">
                Launch App
              </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 text-center">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest mb-8 animate-fade-in hover:bg-violet-500/20 transition-colors cursor-default">
            <Sparkles className="w-3 h-3" />
            AI-Powered Productivity Engine
        </div>
        
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
          CHAOS,<br />
          <span className="text-white relative">
            MANAGED.
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-violet-500 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          The daily planner that understands your energy. <br className="hidden md:block" />
          Turn your to-do list into a gamified quest log with one click.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button onClick={onGetStarted} className="h-14 px-8 text-sm md:text-base rounded-xl group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <span className="relative flex items-center gap-2">
               Initialize Protocol <ArrowRight className="w-4 h-4" />
             </span>
          </Button>
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'})} className="text-zinc-400 hover:text-white text-sm font-mono flex items-center gap-2 px-6 py-4 rounded-xl border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-all">
             <Command className="w-4 h-4" /> View Interface
          </button>
        </div>

        {/* Floating UI Elements (Decoration) */}
        <div className="hidden lg:block absolute top-1/3 left-10 p-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl rotate-[-6deg] animate-float">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-bold text-zinc-500 uppercase">Status</div>
                    <div className="text-sm font-bold text-white">Locked In</div>
                </div>
            </div>
        </div>
        <div className="hidden lg:block absolute bottom-1/4 right-10 p-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl rotate-[6deg] animate-float" style={{animationDelay: '1s'}}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-bold text-zinc-500 uppercase">Streak</div>
                    <div className="text-sm font-bold text-white">5 Days</div>
                </div>
            </div>
        </div>
      </section>

      {/* Interactive Interface Simulator */}
      <section id="demo" className="container mx-auto px-6 py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-mono uppercase tracking-tight mb-4">The Command Center</h2>
                <p className="text-zinc-400">Experience the interface before you join.</p>
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Simulator Sidebar */}
                <div className="w-full md:w-64 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-2">
                    <button 
                        onClick={() => setDemoTab('schedule')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-mono font-bold transition-all flex items-center gap-3 ${demoTab === 'schedule' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Layout className="w-4 h-4" /> Timeline
                    </button>
                    <button 
                        onClick={() => setDemoTab('focus')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-mono font-bold transition-all flex items-center gap-3 ${demoTab === 'focus' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Flame className="w-4 h-4" /> Boss Mode
                    </button>
                    <button 
                        onClick={() => setDemoTab('stats')}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-mono font-bold transition-all flex items-center gap-3 ${demoTab === 'stats' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Trophy className="w-4 h-4" /> Analytics
                    </button>
                    
                    <div className="mt-auto pt-6 border-t border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2">Live Status</div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-white">System Online</span>
                        </div>
                    </div>
                </div>

                {/* Simulator Content */}
                <div className="flex-1 bg-black p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-mono uppercase text-white">
                                {demoTab === 'schedule' && "Daily Protocol"}
                                {demoTab === 'focus' && "Deep Work Session"}
                                {demoTab === 'stats' && "Performance Metrics"}
                            </h3>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                            {demoTab === 'schedule' && <MockTimeline />}
                            {demoTab === 'focus' && <MockFocus />}
                            {demoTab === 'stats' && <MockStats />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="container mx-auto px-6 py-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Main AI Feature - Large */}
            <div className="md:col-span-2 row-span-2 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 relative overflow-hidden group hover:border-violet-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6">
                            <Brain className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Gemini 2.5 Intelligence</h3>
                        <p className="text-zinc-400 max-w-md text-lg">
                            We don't just list tasks. We analyze your sleep schedule, energy peaks, and habits to build the perfect day. 
                            If you're tired, we schedule breaks. If you're locked in, we block distractions.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-8">
                        <div className="px-3 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-400">Auto-Reschedule</div>
                        <div className="px-3 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-400">Context Aware</div>
                    </div>
                </div>
            </div>

            {/* Vibe Check */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-amber-500/30 transition-colors">
                <div className="flex justify-between items-start">
                    <BatteryCharging className="w-8 h-8 text-amber-400" />
                    <span className="text-xs font-mono uppercase text-zinc-500">Feature 02</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">Vibe Checks</h4>
                    <p className="text-sm text-zinc-400">Tell the AI you're "Cooked" or "Locked In". The schedule adapts instantly.</p>
                </div>
            </div>

            {/* Gamification */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-start">
                    <Trophy className="w-8 h-8 text-emerald-400" />
                    <span className="text-xs font-mono uppercase text-zinc-500">Feature 03</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">Aura & XP</h4>
                    <p className="text-sm text-zinc-400">Earn XP for every task. Level up from Novice to Boss. Keep the streak alive.</p>
                </div>
            </div>

            {/* Visuals */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-pink-500/30 transition-colors md:col-span-1">
                 <div className="flex justify-between items-start">
                    <BarChart3 className="w-8 h-8 text-pink-400" />
                    <span className="text-xs font-mono uppercase text-zinc-500">Feature 04</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">Visual Export</h4>
                    <p className="text-sm text-zinc-400">Generate aesthetic infographics of your day to share on socials.</p>
                </div>
            </div>

            {/* Task Breakdown */}
            <div className="md:col-span-2 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col md:flex-row items-center gap-8 group hover:border-blue-500/30 transition-colors">
                <div className="flex-1">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                        <RefreshCcw className="w-5 h-5" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2">Overwhelmed?</h4>
                    <p className="text-zinc-400">One click breaks down complex projects ("Build App") into actionable micro-steps ("Setup Repo", "Design DB").</p>
                </div>
                <div className="w-full md:w-1/3 bg-black/50 rounded-xl p-4 border border-zinc-800 font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500 line-through"><div className="w-3 h-3 border border-zinc-700"></div> Write Essay</div>
                    <div className="pl-4 text-blue-400 flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Research Topic</div>
                    <div className="pl-4 text-zinc-300 flex items-center gap-2"><div className="w-3 h-3 border border-zinc-600 rounded-sm"></div> Draft Outline</div>
                    <div className="pl-4 text-zinc-300 flex items-center gap-2"><div className="w-3 h-3 border border-zinc-600 rounded-sm"></div> Write Intro</div>
                </div>
            </div>
         </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-500 mb-16">The Workflow</h2>
          <div className="relative max-w-4xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-900 -z-10 -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                      { icon: MousePointer2, title: "Input", desc: "Dump your brain. Tasks, ideas, deadlines." },
                      { icon: Sparkles, title: "Synthesize", desc: "AI organizes your day based on energy." },
                      { icon: Flame, title: "Execute", desc: "Enter Boss Mode. Focus timer + Blocking." },
                      { icon: Trophy, title: "Level Up", desc: "Gain Aura. Check stats. Repeat." }
                  ].map((step, i) => (
                      <div key={i} className="bg-black p-6 rounded-2xl border border-zinc-900 hover:border-zinc-700 transition-colors">
                          <div className="w-12 h-12 mx-auto bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 text-white">
                              <step.icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold mb-2">{step.title}</h3>
                          <p className="text-sm text-zinc-500">{step.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Ticker / Social Proof */}
      <section className="py-12 bg-zinc-950 border-y border-zinc-900 overflow-hidden">
          <div className="flex gap-12 animate-scroll whitespace-nowrap opacity-50">
              {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 text-zinc-400 font-mono text-sm uppercase tracking-widest">
                      <Zap className="w-4 h-4" /> Locked In
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      Academic Weapon
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      Touch Grass
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      Secure The Bag
                  </div>
              ))}
          </div>
      </section>

      {/* Footer / CTA */}
      <footer className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to fix your schedule?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={onGetStarted} variant="primary" className="h-12 px-8 w-full sm:w-auto">
                    Create Free Account
                </Button>
            </div>
            <p className="mt-8 text-zinc-600 text-sm font-mono">
                NEXUS_SYSTEM_V2.5 // ALL RIGHTS RESERVED
            </p>
          </div>
      </footer>
    </div>
  );
};