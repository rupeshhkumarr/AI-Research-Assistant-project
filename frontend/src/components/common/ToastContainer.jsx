import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg p-4 shadow-lg min-w-[300px] animate-in slide-in-from-right-full duration-300",
            toast.type === 'success' ? "bg-green-900/90 border border-green-500/50 text-green-100" :
            toast.type === 'error' ? "bg-red-900/90 border border-red-500/50 text-red-100" :
            "bg-blue-900/90 border border-blue-500/50 text-blue-100"
          )}
        >
          {toast.type === 'success' && <CheckCircle size={20} className="text-green-400 mt-0.5 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />}
          {toast.type === 'info' && <Info size={20} className="text-blue-400 mt-0.5 shrink-0" />}
          
          <p className="flex-1 text-sm">{toast.message}</p>
          
          <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
