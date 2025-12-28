'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, Code, Clock } from '@/components/ui/icon';
import { CategoryIcon, CategoryIconWrapper } from '@/components/skills/category-icon';
import { cn, estimateReadingTime } from '@/lib/utils';
import { CATEGORY_CONFIG } from '@/lib/types';
import type { Skill, SkillSummary } from '@/lib/types';

interface SkillCardProps {
  skill: Skill | SkillSummary;
  variant?: 'default' | 'compact';
}

export function SkillCard({ skill, variant = 'default' }: SkillCardProps) {
  const categoryConfig = CATEGORY_CONFIG[skill.category];
  
  // Check if this is a full Skill object (has content) for reading time
  const hasContent = 'content' in skill && skill.content;
  const readingTime = hasContent ? estimateReadingTime(skill.content) : null;
  
  // Check for scripts/references (only available on full Skill)
  const hasScripts = 'hasScripts' in skill && skill.hasScripts;
  const hasReferences = 'hasReferences' in skill && skill.hasReferences;
  
  if (variant === 'compact') {
    return (
      <Link
        href={`/skills/${skill.slug}`}
        className="group block p-4 rounded-lg bg-background-secondary/50 border border-border hover:border-border-hover hover:bg-background-tertiary transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              skill.category === 'foundational' && 'bg-blue-500/10',
              skill.category === 'architectural' && 'bg-purple-500/10',
              skill.category === 'operational' && 'bg-emerald-500/10',
              skill.category === 'methodology' && 'bg-amber-500/10',
            )}>
              <CategoryIcon category={skill.category} size="sm" />
            </div>
            <span className="font-medium text-foreground group-hover:text-accent transition-colors">
              {skill.name}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-foreground-subtle group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    );
  }
  
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group block card card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="transition-transform group-hover:scale-110">
          <CategoryIconWrapper category={skill.category} size="md" />
        </div>
        <Badge variant={skill.category}>
          {categoryConfig.label}
        </Badge>
      </div>
      
      <h3 className="font-serif text-xl font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
        {skill.name}
      </h3>
      
      <p className="text-sm text-foreground-muted line-clamp-3 mb-4">
        {skill.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          {readingTime && (
            <span className="flex items-center gap-1.5 text-xs text-foreground-subtle">
              <Clock className="w-3.5 h-3.5" />
              {readingTime} min
            </span>
          )}
          {hasReferences && (
            <span className="flex items-center gap-1.5 text-xs text-foreground-subtle">
              <FileText className="w-3.5 h-3.5" />
              Refs
            </span>
          )}
          {hasScripts && (
            <span className="flex items-center gap-1.5 text-xs text-foreground-subtle">
              <Code className="w-3.5 h-3.5" />
              Code
            </span>
          )}
        </div>
        <span className="text-xs text-foreground-subtle font-mono">
          v{'version' in skill ? skill.version : skill.metadata?.version || '1.0.0'}
        </span>
      </div>
    </Link>
  );
}

