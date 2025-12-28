'use client';

import { useState } from 'react';
import { Evaluation, EvaluationVerdict } from '@/lib/research-types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Clock,
  Zap,
  Target,
  BookOpen,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';

interface EvaluationCardProps {
  evaluation: Evaluation;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  compact?: boolean;
}

function VerdictBadge({ verdict }: { verdict: EvaluationVerdict }) {
  const config = {
    APPROVE: {
      icon: CheckCircle2,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    HUMAN_REVIEW: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
    },
    REJECT: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
    },
  };

  const { icon: Icon, bg, border, text } = config[verdict];

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${bg} ${border}`}>
      <Icon className={`w-3.5 h-3.5 ${text}`} />
      <span className={`text-xs font-medium ${text}`}>{verdict.replace('_', ' ')}</span>
    </div>
  );
}

function GateIndicator({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 ${pass ? 'text-green-600' : 'text-red-500'}`}>
      {pass ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) {
  const percentage = (score / 2) * 100;
  const color = score === 2 ? 'bg-green-500' : score === 1 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-ink-muted" />
          <span className="text-xs text-ink-muted">{label}</span>
        </div>
        <span className="text-xs font-medium text-ink-secondary">{score}/2</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function EvaluationCard({ evaluation, onApprove, onReject, compact = false }: EvaluationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(evaluation, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const borderColor = evaluation.decision.verdict === 'APPROVE' 
    ? 'border-l-green-500' 
    : evaluation.decision.verdict === 'HUMAN_REVIEW'
    ? 'border-l-amber-500'
    : 'border-l-red-500';

  return (
    <div className={`bg-surface-raised border border-stroke-subtle rounded-lg overflow-hidden border-l-4 ${borderColor}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-surface-hover transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <button className="mt-0.5 text-ink-muted">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-ink-primary">
                {evaluation.source.title}
              </span>
              <VerdictBadge verdict={evaluation.decision.verdict} />
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-faint">
              <span className="px-1.5 py-0.5 bg-surface-sunken rounded text-ink-muted">
                {evaluation.source.source_type.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(evaluation.timestamp)}
              </span>
              {evaluation.scoring && (
                <span className="flex items-center gap-1 text-ink-secondary font-medium">
                  <Zap className="w-3 h-3 text-accent-primary" />
                  {evaluation.scoring.weighted_total.toFixed(2)}
                </span>
              )}
              <span className="text-ink-faint">
                {evaluation.processing_time_ms}ms
              </span>
            </div>

            {/* Compact Gates */}
            {!compact && (
              <div className="flex items-center gap-3 mt-2">
                <GateIndicator pass={evaluation.gatekeeper.G1_mechanism_specificity.pass} label="G1" />
                <GateIndicator pass={evaluation.gatekeeper.G2_implementable_artifacts.pass} label="G2" />
                <GateIndicator pass={evaluation.gatekeeper.G3_beyond_basics.pass} label="G3" />
                <GateIndicator pass={evaluation.gatekeeper.G4_source_verifiability.pass} label="G4" />
              </div>
            )}
          </div>

          <a
            href={evaluation.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted hover:text-accent-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-stroke-subtle p-4 space-y-4 bg-surface-sunken/50">
          {/* Gatekeeper Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Gatekeeper Results
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries({
                G1: evaluation.gatekeeper.G1_mechanism_specificity,
                G2: evaluation.gatekeeper.G2_implementable_artifacts,
                G3: evaluation.gatekeeper.G3_beyond_basics,
                G4: evaluation.gatekeeper.G4_source_verifiability,
              }).map(([key, result]) => (
                <div 
                  key={key}
                  className={`p-2 rounded-lg border ${
                    result.pass 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {result.pass ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-xs font-medium text-ink-primary">{key}</span>
                  </div>
                  <p className="text-xs text-ink-muted line-clamp-2">
                    {result.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring */}
          {evaluation.scoring && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Dimensional Scores
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <ScoreBar 
                  score={evaluation.scoring.D1_technical_depth.score} 
                  label="Technical Depth (35%)" 
                  icon={Target}
                />
                <ScoreBar 
                  score={evaluation.scoring.D2_context_engineering_relevance.score} 
                  label="CE Relevance (30%)" 
                  icon={BookOpen}
                />
                <ScoreBar 
                  score={evaluation.scoring.D3_evidence_rigor.score} 
                  label="Evidence Rigor (20%)" 
                  icon={CheckCircle2}
                />
                <ScoreBar 
                  score={evaluation.scoring.D4_novelty_insight.score} 
                  label="Novelty (15%)" 
                  icon={Lightbulb}
                />
              </div>
              <div className="mt-3 p-2 bg-surface-sunken rounded-lg font-mono text-xs text-ink-muted">
                {evaluation.scoring.calculation_shown}
              </div>
            </div>
          )}

          {/* Decision */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Decision
            </h4>
            <div className="p-3 bg-surface-raised border border-stroke-subtle rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <VerdictBadge verdict={evaluation.decision.verdict} />
                <span className="text-xs text-ink-faint">
                  Confidence: {evaluation.decision.confidence}
                </span>
                {evaluation.decision.override_triggered && (
                  <span className="text-xs text-amber-600 font-medium">
                    Override: {evaluation.decision.override_triggered}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-secondary">
                {evaluation.decision.justification}
              </p>
            </div>
          </div>

          {/* Skill Extraction */}
          {evaluation.skill_extraction && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Skill Candidate
              </h4>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-green-800">
                    {evaluation.skill_extraction.skill_name}
                  </span>
                  <span className="px-1.5 py-0.5 bg-surface-raised text-ink-secondary text-xs rounded">
                    {evaluation.skill_extraction.taxonomy_category.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 bg-surface-raised text-ink-secondary text-xs rounded">
                    {evaluation.skill_extraction.estimated_complexity}
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  {evaluation.skill_extraction.description}
                </p>
              </div>
            </div>
          )}

          {/* Human Review Notes */}
          {evaluation.human_review_notes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                Review Notes
              </h4>
              <p className="text-sm text-ink-secondary p-3 bg-amber-50 border border-amber-200 rounded-lg">
                {evaluation.human_review_notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-stroke-subtle">
            {evaluation.decision.verdict === 'HUMAN_REVIEW' && (
              <>
                {onApprove && (
                  <button
                    onClick={() => onApprove(evaluation.evaluation_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={() => onReject(evaluation.evaluation_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-muted hover:text-ink-primary text-sm transition-colors ml-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
