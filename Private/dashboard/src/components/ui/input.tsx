'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-background-secondary border border-border rounded-lg',
            'px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
            'hover:border-border-hover',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';



