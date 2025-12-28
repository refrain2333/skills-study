'use client';

import { cn } from '@/lib/utils';
import type { SkillCategory } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | SkillCategory;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-foreground-subtle/10 text-foreground-muted border-foreground-subtle/20',
  foundational: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  architectural: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  operational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  methodology: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}



