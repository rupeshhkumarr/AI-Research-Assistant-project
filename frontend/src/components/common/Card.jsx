import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, hoverable = false, glass = false, ...props }) => {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        glass ? "glass" : "bg-bg-card border border-border shadow-lg",
        hoverable && "hover:-translate-y-1 hover:shadow-2xl hover:border-primary-500/30 cursor-pointer",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};
