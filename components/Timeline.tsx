import React from 'react';
import { ScheduleItem, TaskCategory } from '../types';
import { Clock, Coffee, Briefcase, BookOpen, Heart, User } from 'lucide-react';

interface TimelineProps {
  schedule: ScheduleItem[];
  isLoading: boolean;
}

const getIcon = (category: TaskCategory | string, isBreak: boolean) => {
  if (isBreak) return <Coffee className="w-5 h-5 text-amber-400" />;
  switch (category) {
    case TaskCategory.Work: return <Briefcase className="w-5 h-5 text-blue-400" />;
    case TaskCategory.Study: return <BookOpen className="w-5 h-5 text-purple-400" />;
    case TaskCategory.Health: return <Heart className="w-5 h-5 text-red-400" />;
    case TaskCategory.Personal: return <User className="w-5 h-5 text-green-400" />;
    default: return <Clock className="w-5 h-5 text-slate-400" />;
  }
};

export const Timeline: React.FC<TimelineProps> = ({ schedule, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
        <div className="w-full h-12 bg-slate-800 rounded-lg"></div>
        <div className="w-full h-24 bg-slate-800 rounded-lg"></div>
        <div className="w-full h-12 bg-slate-800 rounded-lg"></div>
        <p className="text-slate-500 text-sm">Cooking up the schedule...</p>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
        <p className="font-medium">It's giving... empty.</p>
        <p className="text-sm mt-2">Drop some tasks to start your villain arc.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
       {/* Vertical Line */}
      <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-700/50 -z-10"></div>
      
      {schedule.map((item, index) => (
        <div key={item.id} className="relative flex items-start gap-4 pb-6 group">
          {/* Time & Node */}
          <div className="flex flex-col items-center min-w-[3rem]">
            <div className={`w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg z-10 ${
              item.isBreak ? 'bg-amber-900/20 text-amber-400' : 'bg-slate-800 text-slate-200'
            }`}>
              {getIcon(item.category, item.isBreak)}
            </div>
          </div>

          {/* Card */}
          <div className={`flex-1 rounded-xl p-4 border transition-all duration-300 ${
            item.isBreak 
              ? 'bg-slate-800/50 border-slate-700/50' 
              : 'bg-slate-800 border-slate-700 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
          }`}>
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-semibold ${item.isBreak ? 'text-amber-200' : 'text-slate-100'}`}>
                {item.title}
              </h4>
              <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                {item.timeSlot}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 mb-2">{item.description}</p>
            
            {!item.isBreak && (
               <div className="flex gap-2">
                 <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-900/50 px-2 py-0.5 rounded text-slate-500">
                    {item.category}
                 </span>
               </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};