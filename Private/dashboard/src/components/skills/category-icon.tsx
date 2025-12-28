'use client';

import {
  BookOpen,
  Network,
  Settings,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillCategory } from '@/lib/types';

const categoryIcons = {
  foundational: BookOpen,
  architectural: Network,
  operational: Settings,
  methodology: GitBranch,
};

interface CategoryIconProps {
  category: SkillCategory;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function CategoryIcon({ category, className, size = 'md' }: CategoryIconProps) {
  const Icon = categoryIcons[category];
  
  return (
    <Icon 
      className={cn(
        sizeClasses[size],
        category === 'foundational' && 'text-blue-400',
        category === 'architectural' && 'text-purple-400',
        category === 'operational' && 'text-emerald-400',
        category === 'methodology' && 'text-amber-400',
        className
      )} 
    />
  );
}

export function CategoryIconWrapper({ 
  category, 
  size = 'md' 
}: { 
  category: SkillCategory; 
  size?: 'sm' | 'md' | 'lg';
}) {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className={cn(
      containerSizes[size],
      'rounded-xl flex items-center justify-center',
      category === 'foundational' && 'bg-blue-500/10 border border-blue-500/20',
      category === 'architectural' && 'bg-purple-500/10 border border-purple-500/20',
      category === 'operational' && 'bg-emerald-500/10 border border-emerald-500/20',
      category === 'methodology' && 'bg-amber-500/10 border border-amber-500/20',
    )}>
      <CategoryIcon category={category} size={size} />
    </div>
  );
}



