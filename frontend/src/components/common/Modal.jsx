import React from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={cn("bg-bg-card border border-border relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-main">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
