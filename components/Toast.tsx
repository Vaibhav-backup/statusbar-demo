
import React, { useEffect } from 'react';
import { X, Undo2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  return (
    <div className="min-w-[300px] bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300">
      {icons[toast.type]}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      
      {toast.onUndo && (
        <button 
          onClick={toast.onUndo}
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
        >
          <Undo2 className="w-3 h-3" />
          Undo
        </button>
      )}

      <button onClick={onRemove} className="text-zinc-500 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
