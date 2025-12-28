'use client';

import { Evaluation, TaxonomyCategory } from '@/lib/research-types';
import { 
  Lightbulb, 
  ArrowRight, 
  Code2, 
  FileCode, 
  Boxes, 
  FlaskConical,
  ExternalLink,
  Plus
} from 'lucide-react';

interface SkillCandidatesProps {
  evaluations: Evaluation[];
  onCreateSkill?: (evaluation: Evaluation) => void;
}

const categoryIcons: Record<TaxonomyCategory, React.ElementType> = {
  context_retrieval: FileCode,
  context_processing: Code2,
  context_management: Boxes,
  rag: FileCode,
  memory: Boxes,
  tool_integration: Code2,
  multi_agent: Boxes,
};

const categoryColors: Record<TaxonomyCategory, string> = {
  context_retrieval: 'text-blue-600 bg-blue-50 border-blue-200',
  context_processing: 'text-purple-600 bg-purple-50 border-purple-200',
  context_management: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  rag: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  memory: 'text-amber-600 bg-amber-50 border-amber-200',
  tool_integration: 'text-pink-600 bg-pink-50 border-pink-200',
  multi_agent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
};

const implementationIcons = {
  prompt_template: FileCode,
  code_pattern: Code2,
  architecture: Boxes,
  evaluation_method: FlaskConical,
};

export function SkillCandidates({ evaluations, onCreateSkill }: SkillCandidatesProps) {
  const approved = evaluations.filter(
    e => e.decision.verdict === 'APPROVE' && e.skill_extraction
  );

  if (approved.length === 0) {
    return (
      <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Skill Candidates
          </span>
          <span className="text-xs text-ink-faint">0</span>
        </div>
        <div className="text-center py-8 text-ink-faint text-sm">
          No skill candidates yet. Add sources to discover opportunities.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-accent-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Skill Candidates
        </span>
        <span className="px-1.5 py-0.5 bg-accent-subtle text-accent-primary text-xs font-medium rounded">
          {approved.length}
        </span>
      </div>

      <div className="space-y-2">
        {approved.map((evaluation) => {
          const skill = evaluation.skill_extraction!;
          const Icon = categoryIcons[skill.taxonomy_category];
          const ImplIcon = implementationIcons[skill.implementation_type];
          const colorClass = categoryColors[skill.taxonomy_category];

          return (
            <div
              key={evaluation.evaluation_id}
              className="bg-surface-sunken border border-stroke-subtle rounded-lg p-3 hover:border-accent-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-ink-primary">
                      {skill.skill_name}
                    </span>
                  </div>

                  <p className="text-xs text-ink-muted mb-2 line-clamp-2">
                    {skill.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${colorClass}`}>
                      {skill.taxonomy_category.replace(/_/g, ' ')}
                    </span>
                    <span className="px-1.5 py-0.5 bg-surface-raised text-ink-muted text-xs rounded flex items-center gap-1">
                      <ImplIcon className="w-3 h-3" />
                      {skill.implementation_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      skill.estimated_complexity === 'low' 
                        ? 'bg-green-50 text-green-700'
                        : skill.estimated_complexity === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {skill.estimated_complexity}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-ink-faint">
                    <span>From:</span>
                    <a
                      href={evaluation.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-accent-primary truncate flex items-center gap-1"
                    >
                      {evaluation.source.title}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {onCreateSkill && (
                  <button
                    onClick={() => onCreateSkill(evaluation)}
                    className="flex items-center gap-1 px-2 py-1 bg-accent-primary hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Create
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {approved.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stroke-subtle">
          <button className="flex items-center gap-2 text-sm text-ink-muted hover:text-accent-primary transition-colors">
            View all candidates
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
