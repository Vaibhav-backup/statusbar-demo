
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, Maximize2, Minimize2, Flame } from 'lucide-react';
import { ScheduleItem } from '../types';

interface FocusModeProps {
  currentTask: ScheduleItem;
  onComplete: (timeSpent: number) => void;
  onClose: (timeSpent: number) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ currentTask, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [elapsed, setElapsed] = useState(0); // Track total seconds spent
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setTimeLeft(25 * 60); 
    setElapsed(0);
    setIsActive(false);
  }, [currentTask]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive) {
      interval = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft((prev) => prev - 1);
        }
        setElapsed((prev) => prev + 1);
      }, 1000);
    } 

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getMinutesSpent = () => Math.floor(elapsed / 60);

  const handleClose = () => {
    onClose(getMinutesSpent());
  };

  const handleComplete = () => {
    onComplete(getMinutesSpent());
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-300 overflow-hidden ${isActive ? 'animate-pulse-slow' : ''}`}>
      
      {/* Background Pulse Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-violet-900/20 to-red-900/20 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Decorative Grid Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/20 to-transparent"></div>
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/20 to-transparent"></div>

      <div className="absolute top-8 right-8 flex gap-4 z-20">
        <button onClick={toggleFullscreen} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full">
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
        </button>
        <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl w-full text-center space-y-12 p-6 relative z-10">
        <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded border border-red-500/50 bg-red-950/30 text-red-400 text-sm font-bold tracking-[0.2em] uppercase animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.2)] font-mono">
                <Flame className="w-4 h-4 fill-current animate-bounce" />
                Boss Battle Active
                <Flame className="w-4 h-4 fill-current animate-bounce" />
            </div>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 font-mono glitch-text">
            {currentTask.title}
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto border-t border-b border-zinc-800 py-4 font-mono">
                {currentTask.description}
            </p>
        </div>

        <div className="relative">
            {/* Timer Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-violet-600 blur-[100px] rounded-full -z-10 transition-opacity duration-1000 ${isActive ? 'opacity-40' : 'opacity-10'}`}></div>
            
            <div className="text-[120px] md:text-[180px] font-mono font-bold tracking-tighter tabular-nums leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {formatTime(timeLeft)}
            </div>
            {elapsed > 0 && (
                 <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                        Total Time: {Math.floor(elapsed / 60)}m {elapsed % 60}s
                    </span>
                 </div>
            )}
        </div>

        <div className="flex items-center justify-center gap-8">
            <button 
                onClick={toggleTimer}
                className={`w-24 h-24 rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-2xl border-b-4 active:border-b-0 active:translate-y-1 ${isActive ? 'bg-amber-400 border-amber-600 text-black' : 'bg-white border-zinc-300 text-black'}`}
            >
                {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
            </button>
            
            <button 
                onClick={handleComplete}
                className="w-24 h-24 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-all group shadow-[0_0_30px_rgba(16,185,129,0.4)] active:border-b-0 active:translate-y-1"
            >
                <CheckCircle2 className="w-10 h-10 group-hover:rotate-12 transition-transform" />
            </button>
        </div>
      </div>
      
      <div className="absolute bottom-10 w-full text-center">
          <p className="text-zinc-500 text-sm font-bold font-mono uppercase tracking-widest animate-pulse">
            {isActive ? "/// FOCUS PROTOCOL ENGAGED ///" : "/// WAITING FOR INPUT ///"}
          </p>
      </div>
    </div>
  );
};
