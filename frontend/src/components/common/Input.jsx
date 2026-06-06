import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({ className, type = "text", error, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full">
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-bg-card/50 px-4 py-2 text-sm text-text-main transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
