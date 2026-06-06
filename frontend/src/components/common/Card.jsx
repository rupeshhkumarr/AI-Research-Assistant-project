import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div className={cn("bg-bg-card border border-border rounded-2xl p-6 shadow-xl transition-colors duration-300", className)} {...props}>
      {children}
    </div>
  );
};
