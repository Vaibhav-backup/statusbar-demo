
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Settings, Minimize2, Maximize2, Coffee, Brain, Timer } from 'lucide-react';
import { PomodoroSettings } from '../types';
import { Button } from './Button';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onClose: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ settings, onUpdateSettings, onClose }) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    // Reset timer when settings change or mode changes
    const getDuration = () => {
      switch (mode) {
        case 'work': return settings.workDuration * 60;
        case 'shortBreak': return settings.shortBreakDuration * 60;
        case 'longBreak': return settings.longBreakDuration * 60;
      }
    };
    setTimeLeft(getDuration());
    setIsActive(false);
  }, [settings, mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    // Logic for auto-switching
    if (mode === 'work') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      if (newCycle % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
      if (settings.autoStartBreaks) setIsActive(true);
    } else {
      setMode('work');
      if (settings.autoStartPomodoros) setIsActive(true);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case 'work': setTimeLeft(settings.workDuration * 60); break;
      case 'shortBreak': setTimeLeft(settings.shortBreakDuration * 60); break;
      case 'longBreak': setTimeLeft(settings.longBreakDuration * 60); break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgress = () => {
    const total = mode === 'work' ? settings.workDuration * 60 : 
                  mode === 'shortBreak' ? settings.shortBreakDuration * 60 : 
                  settings.longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-20 right-4 lg:bottom-6 lg:left-6 lg:right-auto z-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 flex items-center gap-3 cursor-pointer hover:border-violet-500 transition-colors animate-in slide-in-from-bottom-10"
        onClick={() => setIsMinimized(false)}
      >
        <div className={`w-2 h-2 rounded-full animate-pulse ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
        <span className="font-mono font-bold text-white text-sm">{formatTime(timeLeft)}</span>
        {mode === 'work' ? <Brain className="w-4 h-4 text-violet-400" /> : <Coffee className="w-4 h-4 text-emerald-400" />}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:bottom-6 lg:left-6 lg:right-auto z-40 w-full lg:w-80 bg-zinc-950/95 lg:bg-zinc-950/90 backdrop-blur-xl border-t lg:border border-zinc-800 rounded-t-2xl lg:rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">POMO-DROID</span>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors">
                <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      {!showSettings ? (
        <div className="p-6 relative">
             {/* Mode Indicators */}
             <div className="flex justify-center gap-2 mb-6">
                 {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                     <button
                        key={m}
                        onClick={() => { setMode(m); setIsActive(false); }}
                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border transition-all ${
                            mode === m 
                            ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                     >
                         {m === 'shortBreak' ? 'Short' : m === 'longBreak' ? 'Long' : 'Focus'}
                     </button>
                 ))}
             </div>

             {/* Timer Display */}
             <div className="relative flex items-center justify-center mb-8">
                {/* Progress Ring (SVG) */}
                <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-zinc-800" />
                    <circle 
                        cx="96" cy="96" r="88" 
                        stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 88}
                        strokeDashoffset={2 * Math.PI * 88 * (1 - getProgress() / 100)}
                        className={`${isActive ? 'text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'text-zinc-600'} transition-all duration-1000 ease-linear`}
                    />
                </svg>
                <div className="absolute text-center">
                    <div className="text-5xl font-mono font-bold text-white tracking-tighter tabular-nums text-shadow-neon">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">
                        {isActive ? 'Running' : 'Paused'}
                    </p>
                </div>
             </div>

             {/* Controls */}
             <div className="flex items-center justify-center gap-4">
                 <button 
                    onClick={toggleTimer}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                        isActive 
                        ? 'bg-amber-500 text-black shadow-amber-500/20' 
                        : 'bg-white text-black shadow-white/20'
                    }`}
                 >
                     {isActive ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-1" />}
                 </button>
                 <button 
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
                 >
                     <RotateCcw className="w-5 h-5" />
                 </button>
             </div>
        </div>
      ) : (
        <div className="p-6 space-y-4 animate-in slide-in-from-right-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-4">Configuration</h3>
            
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Focus Duration (min)</label>
                    <input 
                        type="range" min="15" max="60" step="5"
                        value={settings.workDuration}
                        onChange={(e) => onUpdateSettings({...settings, workDuration: Number(e.target.value)})}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>15m</span>
                        <span className="text-white">{settings.workDuration}m</span>
                        <span>60m</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Short Break (min)</label>
                    <input 
                        type="range" min="2" max="15" step="1"
                        value={settings.shortBreakDuration}
                        onChange={(e) => onUpdateSettings({...settings, shortBreakDuration: Number(e.target.value)})}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="text-right text-[10px] text-white font-mono">{settings.shortBreakDuration}m</div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Long Break (min)</label>
                    <input 
                        type="range" min="10" max="45" step="5"
                        value={settings.longBreakDuration}
                        onChange={(e) => onUpdateSettings({...settings, longBreakDuration: Number(e.target.value)})}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="text-right text-[10px] text-white font-mono">{settings.longBreakDuration}m</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-400">Auto-start Breaks</span>
                    <button 
                        onClick={() => onUpdateSettings({...settings, autoStartBreaks: !settings.autoStartBreaks})}
                        className={`w-8 h-4 rounded-full transition-colors relative ${settings.autoStartBreaks ? 'bg-violet-600' : 'bg-zinc-800'}`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.autoStartBreaks ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full mt-4" variant="secondary">
                Done
            </Button>
        </div>
      )}
    </div>
  );
};
