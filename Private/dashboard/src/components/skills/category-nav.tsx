'use client';

import { cn } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/types';
import { CategoryIcon } from '@/components/skills/category-icon';
import type { SkillCategory } from '@/lib/types';

interface CategoryNavProps {
  skillCounts: Record<SkillCategory, number>;
}

export function CategoryNav({ skillCounts }: CategoryNavProps) {
  const categories = Object.entries(CATEGORY_CONFIG) as [SkillCategory, typeof CATEGORY_CONFIG[SkillCategory]][];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map(([key, config]) => {
        const count = skillCounts[key] || 0;
        
        return (
          <div
            key={key}
            className={cn(
              'p-5 rounded-xl border transition-all duration-200',
              'bg-background-secondary/50 border-border',
              'hover:border-border-hover hover:bg-background-tertiary',
              key === 'foundational' && 'hover:border-blue-500/30',
              key === 'architectural' && 'hover:border-purple-500/30',
              key === 'operational' && 'hover:border-emerald-500/30',
              key === 'methodology' && 'hover:border-amber-500/30',
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                key === 'foundational' && 'bg-blue-500/10',
                key === 'architectural' && 'bg-purple-500/10',
                key === 'operational' && 'bg-emerald-500/10',
                key === 'methodology' && 'bg-amber-500/10',
              )}>
                <CategoryIcon category={key} size="sm" />
              </div>
              <span className="text-2xl font-serif font-medium text-foreground">
                {count}
              </span>
            </div>
            <h3 className="font-medium text-foreground mb-1">
              {config.label}
            </h3>
            <p className="text-xs text-foreground-subtle line-clamp-2">
              {config.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

