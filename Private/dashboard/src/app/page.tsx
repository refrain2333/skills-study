'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { SkillToggleCard } from '@/components/dashboard/skill-toggle-card';
import { ActiveSkillsPanel } from '@/components/dashboard/active-skills-panel';
import { MetricsPanel } from '@/components/dashboard/metrics-panel';
import { ActivityLog } from '@/components/dashboard/activity-log';
import { SkillDetailPanel } from '@/components/dashboard/skill-detail-panel';
import { CATEGORY_CONFIG, SKILL_CATEGORIES } from '@/lib/types';
import type { Skill, SkillCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react';

// Mock data - in production this would come from API/state
const mockSkills: Skill[] = [
  {
    slug: 'context-fundamentals',
    name: 'context-fundamentals',
    description: 'Understand the components, mechanics, and constraints of context in agent systems. Use when designing agent architectures, debugging context-related failures, or optimizing context usage.',
    category: 'foundational',
    content: '',
    sections: [],
    whenToActivate: [
      'Designing new agent systems or modifying existing architectures',
      'Debugging unexpected agent behavior that may relate to context',
      'Optimizing context usage to reduce token costs',
      'Onboarding new team members to context engineering concepts',
    ],
    guidelines: [
      'Treat context as a finite resource with diminishing returns',
      'Place critical information at attention-favored positions',
      'Use progressive disclosure to defer loading until needed',
    ],
    relatedSkills: ['context-degradation', 'context-optimization'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['context_manager.py'],
    referenceFiles: ['context-components.md'],
  },
  {
    slug: 'context-degradation',
    name: 'context-degradation',
    description: 'Recognize, diagnose, and mitigate patterns of context degradation in agent systems. Use when context grows large, agent performance degrades unexpectedly, or debugging agent failures.',
    category: 'foundational',
    content: '',
    sections: [],
    whenToActivate: ['Context grows large', 'Agent performance degrades unexpectedly', 'Debugging agent failures'],
    guidelines: ['Monitor for lost-in-middle effects', 'Implement context compaction triggers'],
    relatedSkills: ['context-fundamentals'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['degradation_detector.py'],
    referenceFiles: ['patterns.md'],
  },
  {
    slug: 'context-compression',
    name: 'context-compression',
    description: 'Design and evaluate context compression strategies for long-running agent sessions. Use when agents exhaust memory, need to summarize conversation history.',
    category: 'foundational',
    content: '',
    sections: [],
    whenToActivate: ['Agent sessions run long', 'Memory limits approached'],
    guidelines: ['Evaluate compression fidelity', 'Preserve critical information'],
    relatedSkills: ['context-fundamentals'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['compression_evaluator.py'],
    referenceFiles: ['evaluation-framework.md'],
  },
  {
    slug: 'multi-agent-patterns',
    name: 'multi-agent-patterns',
    description: 'Design multi-agent architectures for complex tasks. Use when single-agent context limits are exceeded, when tasks decompose naturally into subtasks.',
    category: 'architectural',
    content: '',
    sections: [],
    whenToActivate: ['Single-agent limits exceeded', 'Tasks decompose into subtasks'],
    guidelines: ['Design for context isolation', 'Implement explicit handoff protocols'],
    relatedSkills: ['memory-systems', 'tool-design'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['coordination.py'],
    referenceFiles: ['frameworks.md'],
  },
  {
    slug: 'memory-systems',
    name: 'memory-systems',
    description: 'Design and implement memory architectures for agent systems. Use when building agents that need to persist state across sessions, maintain entity consistency.',
    category: 'architectural',
    content: '',
    sections: [],
    whenToActivate: ['State persistence needed', 'Entity tracking required'],
    guidelines: ['Choose appropriate memory type', 'Implement efficient retrieval'],
    relatedSkills: ['multi-agent-patterns'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['memory_store.py'],
    referenceFiles: ['implementation.md'],
  },
  {
    slug: 'tool-design',
    name: 'tool-design',
    description: 'Design tools that agents can use effectively, including when to reduce tool complexity. Use when creating, optimizing, or reducing agent tool sets.',
    category: 'architectural',
    content: '',
    sections: [],
    whenToActivate: ['Creating new tools', 'Optimizing existing tools', 'Reducing tool complexity'],
    guidelines: ['Write clear descriptions', 'Use consolidation principle', 'Design for recovery'],
    relatedSkills: ['context-fundamentals'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-23', author: 'Contributors', version: '1.1.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['description_generator.py'],
    referenceFiles: ['best_practices.md', 'architectural_reduction.md'],
  },
  {
    slug: 'context-optimization',
    name: 'context-optimization',
    description: 'Apply optimization techniques to extend effective context capacity. Use when context limits constrain agent performance, when optimizing for cost or latency.',
    category: 'operational',
    content: '',
    sections: [],
    whenToActivate: ['Context limits constrain performance', 'Optimizing for cost/latency'],
    guidelines: ['Apply compaction strategies', 'Implement caching where appropriate'],
    relatedSkills: ['context-fundamentals', 'context-compression'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['compaction.py'],
    referenceFiles: ['optimization_techniques.md'],
  },
  {
    slug: 'evaluation',
    name: 'evaluation',
    description: 'Build evaluation frameworks for agent systems. Use when testing agent performance, validating context engineering choices, or measuring improvements over time.',
    category: 'operational',
    content: '',
    sections: [],
    whenToActivate: ['Testing agent performance', 'Validating engineering choices'],
    guidelines: ['Define clear metrics', 'Build reproducible benchmarks'],
    relatedSkills: ['advanced-evaluation'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['evaluator.py'],
    referenceFiles: ['metrics.md'],
  },
  {
    slug: 'advanced-evaluation',
    name: 'advanced-evaluation',
    description: 'Master LLM-as-a-Judge evaluation techniques including direct scoring, pairwise comparison, rubric generation, and bias mitigation.',
    category: 'operational',
    content: '',
    sections: [],
    whenToActivate: ['Building automated evaluation pipelines', 'Comparing model responses', 'Establishing quality standards'],
    guidelines: ['Always require justification before scores', 'Swap positions in pairwise comparison', 'Use domain-specific rubrics'],
    relatedSkills: ['evaluation', 'context-fundamentals'],
    references: [],
    metadata: { created: '2025-12-24', updated: '2025-12-24', author: 'Muratcan Koylan', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['evaluation_example.py'],
    referenceFiles: ['implementation-patterns.md', 'bias-mitigation.md', 'metrics-guide.md'],
  },
  {
    slug: 'project-development',
    name: 'project-development',
    description: 'Design and build LLM-powered projects from ideation through deployment. Use when starting new agent projects, choosing between LLM and traditional approaches.',
    category: 'methodology',
    content: '',
    sections: [],
    whenToActivate: ['Starting new agent projects', 'Choosing LLM vs traditional approaches'],
    guidelines: ['Analyze task-model fit', 'Structure pipelines appropriately'],
    relatedSkills: ['evaluation', 'tool-design'],
    references: [],
    metadata: { created: '2025-12-20', updated: '2025-12-20', author: 'Contributors', version: '1.0.0' },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['pipeline_template.py'],
    referenceFiles: ['pipeline-patterns.md', 'case-studies.md'],
  },
];

type ViewMode = 'grid' | 'list';

export default function DashboardPage() {
  const [activeSkillSlugs, setActiveSkillSlugs] = useState<string[]>([
    'context-fundamentals',
    'tool-design',
    'multi-agent-patterns',
    'evaluation',
  ]);
  const [selectedSkillSlug, setSelectedSkillSlug] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const activeSkills = useMemo(() => 
    mockSkills.filter(s => activeSkillSlugs.includes(s.slug)),
    [activeSkillSlugs]
  );
  
  const selectedSkill = useMemo(() => 
    mockSkills.find(s => s.slug === selectedSkillSlug) || null,
    [selectedSkillSlug]
  );
  
  const filteredSkills = useMemo(() => 
    categoryFilter === 'all' 
      ? mockSkills 
      : mockSkills.filter(s => s.category === categoryFilter),
    [categoryFilter]
  );
  
  const handleToggle = (slug: string) => {
    setActiveSkillSlugs(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };
  
  const handleSelect = (slug: string) => {
    setSelectedSkillSlug(slug === selectedSkillSlug ? null : slug);
  };
  
  const handleRemove = (slug: string) => {
    setActiveSkillSlugs(prev => prev.filter(s => s !== slug));
  };
  
  const handleReorder = (fromIndex: number, toIndex: number) => {
    setActiveSkillSlugs(prev => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return newOrder;
    });
  };
  
  return (
    <div className="flex h-screen bg-surface-base">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Skills Dashboard" 
          subtitle="Configure active skills and manage your context budget"
        />
        
        <main className="flex-1 overflow-hidden p-6">
          {/* Metrics row */}
          <div className="mb-6">
            <MetricsPanel />
          </div>
          
          {/* Main content area */}
          <div className="flex gap-6 h-[calc(100%-88px)]">
            {/* Skills list */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Filters */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-ink-muted" />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-lg transition-colors',
                        categoryFilter === 'all'
                          ? 'bg-accent-primary text-white'
                          : 'text-ink-muted hover:bg-surface-hover'
                      )}
                    >
                      All
                    </button>
                    {(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          'px-3 py-1.5 text-xs rounded-lg transition-colors',
                          categoryFilter === cat
                            ? 'bg-accent-primary text-white'
                            : 'text-ink-muted hover:bg-surface-hover'
                        )}
                      >
                        {CATEGORY_CONFIG[cat].label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-faint">
                    {filteredSkills.length} skills
                  </span>
                  <div className="flex items-center border border-stroke-subtle rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-1.5 transition-colors',
                        viewMode === 'list' 
                          ? 'bg-surface-sunken text-ink-primary' 
                          : 'text-ink-faint hover:text-ink-muted'
                      )}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-1.5 transition-colors',
                        viewMode === 'grid' 
                          ? 'bg-surface-sunken text-ink-primary' 
                          : 'text-ink-faint hover:text-ink-muted'
                      )}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Skills grid/list */}
              <div className={cn(
                'flex-1 overflow-y-auto pr-2 -mr-2',
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 gap-3 auto-rows-min' 
                  : 'space-y-2'
              )}>
                {filteredSkills.map((skill) => (
                  <SkillToggleCard
                    key={skill.slug}
                    skill={skill}
                    isActive={activeSkillSlugs.includes(skill.slug)}
                    isSelected={selectedSkillSlug === skill.slug}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
            
            {/* Right panels */}
            <div className="w-80 flex flex-col gap-4 shrink-0">
              {/* Detail panel or Active skills */}
              <div className="flex-1 min-h-0">
                {selectedSkillSlug ? (
                  <SkillDetailPanel
                    skill={selectedSkill}
                    isActive={activeSkillSlugs.includes(selectedSkillSlug)}
                    onClose={() => setSelectedSkillSlug(null)}
                    onToggle={handleToggle}
                  />
                ) : (
                  <ActiveSkillsPanel
                    activeSkills={activeSkills}
                    onRemove={handleRemove}
                    onReorder={handleReorder}
                  />
                )}
              </div>
              
              {/* Activity log */}
              <div className="h-64 shrink-0">
                <ActivityLog />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
