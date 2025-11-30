
import React from 'react';
import { X, GripHorizontal, Plus } from 'lucide-react';

interface WidgetWrapperProps {
  id: string;
  title?: string;
  isEditing: boolean;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  onDragStart: (e: React.DragEvent, id: string, col: 'left' | 'right') => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string, col: 'left' | 'right') => void;
  column: 'left' | 'right';
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
  id, 
  title, 
  isEditing, 
  onRemove, 
  children, 
  onDragStart,
  onDragOver,
  onDrop,
  column
}) => {
  return (
    <div 
      draggable={isEditing}
      onDragStart={(e) => onDragStart(e, id, column)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id, column)}
      className={`relative group transition-all duration-300 ${isEditing ? 'cursor-move ring-2 ring-dashed ring-zinc-700 hover:ring-zinc-500 rounded-xl' : ''}`}
    >
      {/* Edit Mode Controls */}
      {isEditing && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center z-20 pointer-events-none">
             <div className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest shadow-xl flex items-center gap-2 pointer-events-auto">
                 <GripHorizontal className="w-4 h-4" />
                 <span>Drag</span>
             </div>
        </div>
      )}

      {isEditing && (
        <button 
            onClick={() => onRemove(id)}
            className="absolute -top-2 -right-2 z-20 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-400 hover:scale-110 transition-all"
        >
            <X className="w-4 h-4" />
        </button>
      )}

      {/* Widget Content */}
      <div className={`${isEditing ? 'opacity-80 pointer-events-none scale-95' : 'opacity-100'} transition-all h-full`}>
         {children}
      </div>
    </div>
  );
};
