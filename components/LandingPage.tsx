import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { 
  Zap, Brain, Sparkles, ArrowRight, Layout, 
  Flame, Trophy, Calendar, CheckCircle2, 
  BatteryCharging, MousePointer2, Lock, 
  BarChart3, RefreshCcw, Command, Skull, 
  MessageSquarePlus, Receipt, Palette, Ghost,
  Terminal, ShieldCheck, Cpu
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
    { id: 1, time: '09:00', title: 'Academic Weaponry', cat: 'Study', completed: true },
    { id: 2, time: '11:30', title: 'Touch Grass', cat: 'Break', completed: false },
    { id: 3, time: '12:00', title: 'Secure The Bag', cat: 'Work', completed: false },
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
          <span className={t.completed ? 'line-through text-emerald-500' : 'text-zinc-200'}>{t.title}</span>
          {t.completed && <span className="ml-auto text-[10px] text-emerald-500 font-bold">+100 XP</span>}
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
    <div className="flex flex-col items-center justify-center h-full space-y-6 relative overflow-hidden">
      <div className={`absolute inset-0 bg-red-900/10 transition-opacity ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
      <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl font-mono font-bold tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {mins}:{secs < 10 ? '0' : ''}{secs}
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">
            {isActive ? '/// BOSS BATTLE ACTIVE ///' : 'READY PLAYER ONE'}
          </div>
      </div>
      <Button variant={isActive ? "secondary" : "neon"} onClick={() => setIsActive(!isActive)} className="px-8 z-10">
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
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-white leading-none">52</span>
                 <span className="text-[9px] uppercase font-mono text-zinc-500">Streak</span>
             </div>
        </div>
        <div className="space-y-2 text-xs font-mono">
             <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-bold uppercase">Lvl 12 Boss</span>
             </div>
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 selection:text-violet-200 font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={onGetStarted}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <Zap className="text-black w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight font-mono">LOCK IN</span>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={onGetStarted} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors hidden sm:block uppercase tracking-wider">
                System Login
              </button>
              <Button variant="primary" onClick={onGetStarted} className="px-5 py-2 h-auto text-xs shadow-lg shadow-violet-500/20">
                INITIALIZE
              </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 text-center">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-[10px] font-bold uppercase tracking-widest mb-8 animate-fade-in hover:bg-violet-500/20 transition-colors cursor-default backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE // V 3.0
        </div>
        
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.9] text-white">
          LOCK IN<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white relative">
            OR LOG OFF
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed font-mono">
          The productivity engine for the chronically online. <br className="hidden md:block" />
          Weaponize your ADHD. Gamify the grind. Secure the bag.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Button onClick={onGetStarted} className="h-14 px-8 text-sm md:text-base rounded-xl group relative overflow-hidden bg-white text-black hover:bg-zinc-200">
             <span className="relative flex items-center gap-2 font-bold tracking-tight">
               ENTER THE SYSTEM <ArrowRight className="w-4 h-4" />
             </span>
          </Button>
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'})} className="text-zinc-400 hover:text-white text-sm font-mono flex items-center gap-2 px-6 py-4 rounded-xl border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-all">
             <Terminal className="w-4 h-4" /> READ MANIFESTO
          </button>
        </div>

        {/* Floating UI Elements (Decoration) */}
        <div className="hidden lg:block absolute top-1/3 left-10 p-4 bg-black/80 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl rotate-[-6deg] animate-float hover:scale-110 transition-transform cursor-default">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Brain className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-bold text-zinc-500 uppercase">Focus</div>
                    <div className="text-sm font-bold text-white">Hyper-fixated</div>
                </div>
            </div>
        </div>
        <div className="hidden lg:block absolute bottom-1/4 right-10 p-4 bg-black/80 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl rotate-[6deg] animate-float" style={{animationDelay: '1s'}}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-bold text-zinc-500 uppercase">Streak</div>
                    <div className="text-sm font-bold text-white">420 Days</div>
                </div>
            </div>
        </div>
      </section>

      {/* Interactive Interface Simulator */}
      <section id="demo" className="container mx-auto px-6 py-24 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-mono uppercase tracking-tight mb-4 flex items-center justify-center gap-3">
                   <Cpu className="w-6 h-6 text-violet-500" /> Command Center
                </h2>
                <p className="text-zinc-400">Experience the interface before you join the server.</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl border border-zinc-800 shadow-[0_0_50px_rgba(139,92,246,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[600px] group hover:border-violet-500/30 transition-colors">
                {/* Simulator Sidebar */}
                <div className="w-full md:w-64 bg-zinc-900/30 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col gap-2 backdrop-blur-sm">
                    <div className="mb-6 flex items-center gap-2 px-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500"></div>
                    </div>
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
                        <Trophy className="w-4 h-4" /> Stats & Loot
                    </button>
                    
                    <div className="mt-auto pt-6 border-t border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2">Live Context</div>
                        <div className="bg-black/40 p-3 rounded border border-zinc-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-zinc-400 uppercase">Vibe</span>
                                <span className="text-[10px] font-bold text-amber-500">GRIND</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-amber-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simulator Content */}
                <div className="flex-1 bg-black p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-mono uppercase text-white flex items-center gap-2">
                                {demoTab === 'schedule' && <><Layout className="w-5 h-5 text-violet-500"/> Daily Protocol</>}
                                {demoTab === 'focus' && <><Flame className="w-5 h-5 text-red-500"/> Deep Work Session</>}
                                {demoTab === 'stats' && <><Trophy className="w-5 h-5 text-yellow-500"/> Performance Metrics</>}
                            </h3>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-500 uppercase tracking-wider animate-pulse">
                                System Online
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm shadow-2xl relative">
                            {/* Glass reflection */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none rounded-xl"></div>
                            
                            {demoTab === 'schedule' && <MockTimeline />}
                            {demoTab === 'focus' && <MockFocus />}
                            {demoTab === 'stats' && <MockStats />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="py-8 bg-violet-600/10 border-y border-violet-500/20 overflow-hidden transform -skew-y-2">
          <div className="flex gap-12 animate-scroll whitespace-nowrap">
              {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 text-violet-300 font-mono text-lg font-bold uppercase tracking-widest">
                      <Zap className="w-5 h-5 fill-current" /> LOCK IN OR LOG OFF
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      SECURE THE BAG
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      TOUCH GRASS
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      ACADEMIC WEAPON
                  </div>
              ))}
          </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="container mx-auto px-6 py-32">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* The Yap Pad */}
            <div className="md:col-span-2 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 relative overflow-hidden group hover:border-violet-500/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-600/30 transition-colors"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-6 text-violet-400 border border-violet-500/30">
                            <MessageSquarePlus className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 font-mono uppercase">The Yap Pad</h3>
                        <p className="text-zinc-400 max-w-md text-lg">
                            Brain too loud? Just yap into the text box. Our AI analyzes your brain dump, extracts tasks, assigns priority, and builds your schedule automatically.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <div className="px-3 py-1 rounded-full bg-black/50 text-xs font-mono text-zinc-300 border border-zinc-700">Auto-Extraction</div>
                        <div className="px-3 py-1 rounded-full bg-black/50 text-xs font-mono text-zinc-300 border border-zinc-700">Sentiment Analysis</div>
                    </div>
                </div>
            </div>

            {/* Roast Mode */}
            <div className="bg-red-950/10 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-red-500/50 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Flame className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-red-500 font-bold border border-red-500/30 px-2 py-0.5 rounded-full">New</span>
                </div>
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2 text-white">Roast My Schedule</h4>
                    <p className="text-sm text-zinc-400">
                        Need a reality check? The AI will savage your delusional planning with zero mercy. "You're cooked."
                    </p>
                </div>
            </div>

            {/* Rot Mode */}
            <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-zinc-500/50 transition-all duration-500 grayscale hover:grayscale-0">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-zinc-700/20 flex items-center justify-center border border-zinc-700/30">
                        <Ghost className="w-6 h-6 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold border border-zinc-700/30 px-2 py-0.5 rounded-full">Health</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">Rot Protocol</h4>
                    <p className="text-sm text-zinc-400">Burned out? Enable Rot Mode. The interface dims, tasks are paused, and self-care is prioritized.</p>
                </div>
            </div>

            {/* Visuals / Receipt */}
            <div className="bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-pink-500/50 transition-all duration-500">
                 <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                        <Receipt className="w-6 h-6 text-pink-400" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-pink-500 font-bold border border-pink-500/30 px-2 py-0.5 rounded-full">Viral</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">Digital Receipts</h4>
                    <p className="text-sm text-zinc-400">Prove you did the work. Export your daily log as an aesthetic shopping receipt for your story.</p>
                </div>
            </div>

            {/* Aesthetics */}
            <div className="md:col-span-1 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800 flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-500">
                 <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Palette className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-cyan-500 font-bold border border-cyan-500/30 px-2 py-0.5 rounded-full">Custom</span>
                </div>
                <div>
                    <h4 className="text-xl font-bold mb-2">15+ Aesthetics</h4>
                    <p className="text-sm text-zinc-400">Y2K, Vaporwave, Whimsigoth, Old Money. Switch your entire app theme instantly.</p>
                </div>
            </div>
         </div>
      </section>

      {/* Workflow / How it Works */}
      <section className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-zinc-500 mb-16">The Algorithm</h2>
          <div className="relative max-w-5xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent -z-10 -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                      { icon: MousePointer2, title: "Input", desc: "Dump tasks, ideas, or just yap into the void." },
                      { icon: Sparkles, title: "Synthesize", desc: "AI optimizes flow based on your 'Vibe Check'." },
                      { icon: Flame, title: "Execute", desc: "Enter Boss Mode. Timers, blocking, laser focus." },
                      { icon: Trophy, title: "Reward", desc: "Gain XP (Aura). Build streaks. Flex receipts." }
                  ].map((step, i) => (
                      <div key={i} className="bg-black p-6 rounded-2xl border border-zinc-900 hover:border-zinc-700 transition-colors group relative">
                          <div className="w-14 h-14 mx-auto bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800 text-white group-hover:scale-110 transition-transform group-hover:border-violet-500/50 group-hover:text-violet-400">
                              <step.icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold mb-2 font-mono uppercase tracking-tight">{step.title}</h3>
                          <p className="text-sm text-zinc-500">{step.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Hall of Fame / Reviews */}
      <section className="container mx-auto px-6 py-24 border-t border-zinc-900">
          <h2 className="text-3xl font-bold font-mono uppercase text-center mb-12">Hall of Fame</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { name: "AcademicWeapon_99", role: "Med Student", text: "I finished my thesis in 4 hours using Boss Mode. This app actually bullies me into working and I love it." },
                  { name: "night_owl_coder", role: "Dev", text: "The dark mode themes go crazy. Y2K theme is elite. Finally a productivity app that doesn't look like a spreadsheet." },
                  { name: "sarah_grinds", role: "Founder", text: "The Yap Pad is a lifesaver. I just ramble at it and it plans my whole day. Roast mode humbled me tho 💀" }
              ].map((review, i) => (
                  <div key={i} className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                      <div className="flex items-center gap-1 mb-4 text-yellow-500">
                          {[1,2,3,4,5].map(s => <Zap key={s} className="w-3 h-3 fill-current" />)}
                      </div>
                      <p className="text-zinc-300 text-sm mb-6 leading-relaxed">"{review.text}"</p>
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono uppercase">
                              {review.name.charAt(0)}
                          </div>
                          <div>
                              <div className="text-xs font-bold text-white font-mono">{review.name}</div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{review.role}</div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Footer / CTA */}
      <footer className="container mx-auto px-6 py-24 text-center border-t border-zinc-900 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter font-mono uppercase text-white">
                Ready to fix your life?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={onGetStarted} variant="primary" className="h-14 px-10 w-full sm:w-auto font-mono uppercase tracking-widest text-lg bg-white text-black hover:bg-zinc-200">
                    JOIN LOCK IN
                </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-zinc-600">
                <ShieldCheck className="w-6 h-6" />
                <span className="text-xs font-mono uppercase">Secure Data</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span className="text-xs font-mono uppercase">No Ads</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span className="text-xs font-mono uppercase">Free Tier</span>
            </div>
            <p className="mt-12 text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
                LOCK_IN_SYSTEMS_V3.0 // EST. 2025
            </p>
          </div>
      </footer>
    </div>
  );
};