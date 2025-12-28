'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/types';
import { CATEGORY_CONFIG } from '@/lib/types';
import { 
  X, 
  ExternalLink, 
  FileText, 
  Code, 
  Clock, 
  User,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

interface SkillDetailPanelProps {
  skill: Skill | null;
  isActive: boolean;
  onClose: () => void;
  onToggle: (slug: string) => void;
}

export function SkillDetailPanel({ skill, isActive, onClose, onToggle }: SkillDetailPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('when-to-activate');
  const [copied, setCopied] = useState(false);
  
  if (!skill) {
    return (
      <div className="panel h-full flex items-center justify-center">
        <div className="text-center text-ink-muted">
          <div className="text-sm">Select a skill to view details</div>
        </div>
      </div>
    );
  }
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className="panel h-full flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className={cn('tag', `tag-${skill.category}`)}>
            {CATEGORY_CONFIG[skill.category].label}
          </span>
          <span className="text-xs font-mono text-ink-faint">v{skill.metadata.version}</span>
        </div>
        <button onClick={onClose} className="btn-icon p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold text-ink-primary mb-2">{skill.name}</h2>
        <p className="text-sm text-ink-secondary mb-4">{skill.description}</p>
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-xs text-ink-muted mb-6">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {skill.metadata.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Updated {skill.metadata.updated}
          </span>
        </div>
        
        {/* Collapsible sections */}
        <div className="space-y-2">
          {/* When to Activate */}
          {skill.whenToActivate.length > 0 && (
            <div className="border border-stroke-subtle rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('when-to-activate')}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-ink-primary hover:bg-surface-hover"
              >
                <span>When to Activate</span>
                {expandedSection === 'when-to-activate' ? (
                  <ChevronDown className="w-4 h-4 text-ink-faint" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-faint" />
                )}
              </button>
              {expandedSection === 'when-to-activate' && (
                <div className="px-3 pb-3">
                  <ul className="space-y-1">
                    {skill.whenToActivate.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                        <span className="w-1 h-1 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Guidelines */}
          {skill.guidelines.length > 0 && (
            <div className="border border-stroke-subtle rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('guidelines')}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-ink-primary hover:bg-surface-hover"
              >
                <span>Guidelines ({skill.guidelines.length})</span>
                {expandedSection === 'guidelines' ? (
                  <ChevronDown className="w-4 h-4 text-ink-faint" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-faint" />
                )}
              </button>
              {expandedSection === 'guidelines' && (
                <div className="px-3 pb-3">
                  <ol className="space-y-1">
                    {skill.guidelines.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                        <span className="font-mono text-ink-faint shrink-0 w-4">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          
          {/* Resources */}
          {(skill.hasReferences || skill.hasScripts) && (
            <div className="border border-stroke-subtle rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('resources')}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-ink-primary hover:bg-surface-hover"
              >
                <span>Resources</span>
                {expandedSection === 'resources' ? (
                  <ChevronDown className="w-4 h-4 text-ink-faint" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-faint" />
                )}
              </button>
              {expandedSection === 'resources' && (
                <div className="px-3 pb-3 space-y-2">
                  {skill.referenceFiles?.map((file) => (
                    <a
                      key={file}
                      href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/skills/${skill.slug}/references/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded bg-surface-sunken hover:bg-surface-hover transition-colors text-xs"
                    >
                      <FileText className="w-3 h-3 text-ink-faint" />
                      <span className="flex-1 font-mono text-ink-secondary truncate">{file}</span>
                      <ExternalLink className="w-3 h-3 text-ink-faint" />
                    </a>
                  ))}
                  {skill.scriptFiles?.map((file) => (
                    <a
                      key={file}
                      href={`https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/blob/main/skills/${skill.slug}/scripts/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded bg-surface-sunken hover:bg-surface-hover transition-colors text-xs"
                    >
                      <Code className="w-3 h-3 text-ink-faint" />
                      <span className="flex-1 font-mono text-ink-secondary truncate">{file}</span>
                      <ExternalLink className="w-3 h-3 text-ink-faint" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer actions */}
      <div className="p-4 border-t border-stroke-subtle flex items-center gap-2">
        <button
          onClick={() => onToggle(skill.slug)}
          className={cn(
            'flex-1',
            isActive ? 'btn-secondary' : 'btn-primary'
          )}
        >
          {isActive ? 'Deactivate' : 'Activate Skill'}
        </button>
        <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}



