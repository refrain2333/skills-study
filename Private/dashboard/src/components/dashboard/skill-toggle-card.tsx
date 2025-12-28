'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Skill, SkillCategory } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';
import { Clock, FileText, Code, ChevronRight, GripVertical } from 'lucide-react';

interface SkillToggleCardProps {
  skill: Skill;
  isActive: boolean;
  isSelected: boolean;
  onToggle: (slug: string) => void;
  onSelect: (slug: string) => void;
}

const categoryColors: Record<SkillCategory, string> = {
  foundational: 'bg-category-foundational',
  architectural: 'bg-category-architectural',
  operational: 'bg-category-operational',
  methodology: 'bg-category-methodology',
};

export function SkillToggleCard({ 
  skill, 
  isActive, 
  isSelected,
  onToggle, 
  onSelect 
}: SkillToggleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={cn(
        'skill-card group cursor-pointer',
        isActive && 'active',
        isSelected && 'selected'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(skill.slug)}
    >
      {/* Drag handle */}
      <div className={cn(
        'absolute left-1 top-1/2 -translate-y-1/2 opacity-0 transition-opacity',
        isHovered && 'opacity-100'
      )}>
        <GripVertical className="w-4 h-4 text-ink-faint" />
      </div>
      
      <div className="flex items-start gap-3 pl-4">
        {/* Category indicator */}
        <div className={cn(
          'w-1 h-full absolute left-0 top-0 rounded-l-lg',
          categoryColors[skill.category]
        )} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-ink-primary text-sm truncate">
              {skill.name}
            </h3>
            <span className={cn('tag', `tag-${skill.category}`)}>
              {CATEGORY_CONFIG[skill.category].label}
            </span>
          </div>
          
          <p className="text-xs text-ink-muted line-clamp-2 mb-2">
            {skill.description}
          </p>
          
          <div className="flex items-center gap-3 text-2xs text-ink-faint">
            {skill.hasReferences && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Refs
              </span>
            )}
            {skill.hasScripts && (
              <span className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                Scripts
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              v{skill.metadata.version}
            </span>
          </div>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(skill.slug);
            }}
            className={cn(
              'toggle',
              isActive && 'bg-accent-primary'
            )}
            data-state={isActive ? 'checked' : 'unchecked'}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}



