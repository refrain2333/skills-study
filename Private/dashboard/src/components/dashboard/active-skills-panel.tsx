'use client';

import { cn } from '@/lib/utils';
import type { Skill, SkillCategory } from '@/lib/types';
import { X, ChevronUp, ChevronDown, Pause, Play } from 'lucide-react';

interface ActiveSkillsPanelProps {
  activeSkills: Skill[];
  onRemove: (slug: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const categoryColors: Record<SkillCategory, string> = {
  foundational: 'bg-category-foundational',
  architectural: 'bg-category-architectural',
  operational: 'bg-category-operational',
  methodology: 'bg-category-methodology',
};

export function ActiveSkillsPanel({ activeSkills, onRemove, onReorder }: ActiveSkillsPanelProps) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Active Skills</span>
        <span className="text-xs font-mono text-ink-muted">{activeSkills.length}/10</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeSkills.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-ink-faint text-sm">No active skills</div>
            <div className="text-ink-faint text-xs mt-1">Toggle skills from the list to activate</div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {activeSkills.map((skill, index) => (
              <div
                key={skill.slug}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-sunken group"
              >
                {/* Order indicator */}
                <div className="w-5 h-5 rounded bg-surface-hover flex items-center justify-center">
                  <span className="text-2xs font-mono text-ink-muted">{index + 1}</span>
                </div>
                
                {/* Category dot */}
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  categoryColors[skill.category]
                )} />
                
                {/* Name */}
                <span className="flex-1 text-xs font-medium text-ink-primary truncate">
                  {skill.name}
                </span>
                
                {/* Controls */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => index > 0 && onReorder(index, index - 1)}
                    className="p-1 rounded hover:bg-surface-hover text-ink-faint hover:text-ink-muted"
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => index < activeSkills.length - 1 && onReorder(index, index + 1)}
                    className="p-1 rounded hover:bg-surface-hover text-ink-faint hover:text-ink-muted"
                    disabled={index === activeSkills.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => onRemove(skill.slug)}
                    className="p-1 rounded hover:bg-status-error/10 text-ink-faint hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Context usage summary */}
      {activeSkills.length > 0 && (
        <div className="p-3 border-t border-stroke-subtle">
          <div className="text-xs text-ink-muted mb-2">Estimated token usage</div>
          <div className="space-y-1.5">
            {activeSkills.slice(0, 3).map((skill) => (
              <div key={skill.slug} className="flex items-center gap-2">
                <div className="flex-1 text-2xs text-ink-secondary truncate">{skill.name}</div>
                <div className="text-2xs font-mono text-ink-faint">~2.4k</div>
              </div>
            ))}
            {activeSkills.length > 3 && (
              <div className="text-2xs text-ink-faint">
                +{activeSkills.length - 3} more skills
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



