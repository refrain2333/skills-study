'use client';

import { useState } from 'react';
import { SourceInput } from '@/components/research/source-input';
import { ProcessingQueue } from '@/components/research/processing-queue';
import { EvaluationCard } from '@/components/research/evaluation-card';
import { SkillCandidates } from '@/components/research/skill-candidates';
import { CockpitStats } from '@/components/research/cockpit-stats';
import { ActivityFeed } from '@/components/research/activity-feed';
import { Sidebar } from '@/components/dashboard/sidebar';
import { 
  SAMPLE_EVALUATIONS, 
  SAMPLE_QUEUE, 
  QueueItem, 
  Evaluation,
  createMockQueueItem 
} from '@/lib/research-types';
import { 
  Filter, 
  SortDesc, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Search,
  Radar,
  Bell
} from 'lucide-react';

type FilterType = 'all' | 'approved' | 'review' | 'rejected';

export default function ResearchPage() {
  const [queue, setQueue] = useState<QueueItem[]>(SAMPLE_QUEUE);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(SAMPLE_EVALUATIONS);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddSource = (url: string) => {
    setIsProcessing(true);
    
    const newItem = createMockQueueItem({
      source: {
        id: Math.random().toString(36).substring(7),
        url,
        title: 'Fetching...',
        author: null,
        source_type: 'other',
        added_at: new Date().toISOString(),
        added_by: 'user',
      },
      status: 'queued',
      progress: 0,
    });

    setQueue(prev => [newItem, ...prev]);

    setTimeout(() => {
      setQueue(prev => 
        prev.map(item => 
          item.id === newItem.id 
            ? { ...item, status: 'fetching' as const, progress: 25 }
            : item
        )
      );
    }, 500);

    setTimeout(() => {
      setQueue(prev => 
        prev.map(item => 
          item.id === newItem.id 
            ? { 
                ...item, 
                status: 'evaluating' as const, 
                progress: 60,
                source: { ...item.source, title: 'Document Loaded' }
              }
            : item
        )
      );
    }, 1500);

    setTimeout(() => {
      setQueue(prev => prev.filter(item => item.id !== newItem.id));
      
      const mockEval: Evaluation = {
        evaluation_id: `eval-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: {
          id: newItem.id,
          url,
          title: 'New Document',
          author: 'Unknown',
          source_type: 'other',
          added_at: new Date().toISOString(),
          added_by: 'user',
        },
        gatekeeper: {
          G1_mechanism_specificity: { pass: true, evidence: 'Pending full evaluation' },
          G2_implementable_artifacts: { pass: true, evidence: 'Pending full evaluation' },
          G3_beyond_basics: { pass: true, evidence: 'Pending full evaluation' },
          G4_source_verifiability: { pass: true, evidence: 'Pending full evaluation' },
          verdict: 'PASS',
          rejection_reason: null,
        },
        scoring: {
          D1_technical_depth: { reasoning: 'Demo mode - connect API for real evaluation', score: 1 },
          D2_context_engineering_relevance: { reasoning: 'Demo mode', score: 1 },
          D3_evidence_rigor: { reasoning: 'Demo mode', score: 1 },
          D4_novelty_insight: { reasoning: 'Demo mode', score: 1 },
          weighted_total: 1.0,
          calculation_shown: '(1×0.35) + (1×0.30) + (1×0.20) + (1×0.15) = 1.0',
        },
        decision: {
          verdict: 'HUMAN_REVIEW',
          override_triggered: null,
          confidence: 'medium',
          justification: 'Demo mode - connect API endpoint for real LLM-as-a-Judge evaluation',
        },
        skill_extraction: null,
        human_review_notes: 'This is a demo. Connect the backend API to enable real evaluation.',
        processing_time_ms: 2500,
      };

      setEvaluations(prev => [mockEval, ...prev]);
      setIsProcessing(false);
    }, 3000);
  };

  const handleApprove = (id: string) => {
    setEvaluations(prev => 
      prev.map(e => 
        e.evaluation_id === id 
          ? { 
              ...e, 
              decision: { ...e.decision, verdict: 'APPROVE' as const },
              skill_extraction: {
                extractable: true,
                skill_name: 'ManuallyApprovedSkill',
                taxonomy_category: 'context_management',
                description: 'Skill manually approved by human reviewer',
                implementation_type: 'architecture',
                estimated_complexity: 'medium',
              }
            }
          : e
      )
    );
  };

  const handleReject = (id: string) => {
    setEvaluations(prev => 
      prev.map(e => 
        e.evaluation_id === id 
          ? { ...e, decision: { ...e.decision, verdict: 'REJECT' as const } }
          : e
      )
    );
  };

  const filteredEvaluations = evaluations.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'approved') return e.decision.verdict === 'APPROVE';
    if (filter === 'review') return e.decision.verdict === 'HUMAN_REVIEW';
    if (filter === 'rejected') return e.decision.verdict === 'REJECT';
    return true;
  });

  const counts = {
    all: evaluations.length,
    approved: evaluations.filter(e => e.decision.verdict === 'APPROVE').length,
    review: evaluations.filter(e => e.decision.verdict === 'HUMAN_REVIEW').length,
    rejected: evaluations.filter(e => e.decision.verdict === 'REJECT').length,
  };

  return (
    <div className="flex min-h-screen bg-surface-base">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-stroke-subtle bg-surface-raised">
          <div className="flex items-center gap-3">
            <Radar className="w-5 h-5 text-accent-primary" />
            <h1 className="text-lg font-semibold text-ink-primary">Skill Discovery</h1>
            <span className="px-2 py-0.5 bg-accent-subtle text-accent-primary text-xs font-medium rounded">
              BETA
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
              <input
                type="text"
                placeholder="Search evaluations..."
                className="w-64 pl-9 pr-4 py-2 bg-surface-sunken border border-stroke-subtle rounded-lg text-sm text-ink-primary placeholder-ink-faint focus:outline-none focus:border-accent-primary"
              />
            </div>
            <button className="p-2 text-ink-muted hover:text-ink-primary hover:bg-surface-hover rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Input & Queue */}
            <div className="col-span-3 space-y-4">
              <SourceInput onSubmit={handleAddSource} isProcessing={isProcessing} />
              <ProcessingQueue items={queue} />
              <SkillCandidates evaluations={evaluations} />
            </div>

            {/* Center Column - Evaluations */}
            <div className="col-span-6 space-y-4">
              {/* Stats Row */}
              <CockpitStats evaluations={evaluations} queue={queue} />
              
              {/* Filter Bar */}
              <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-ink-muted" />
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'all'
                          ? 'bg-surface-sunken text-ink-primary'
                          : 'text-ink-muted hover:text-ink-primary hover:bg-surface-hover'
                      }`}
                    >
                      All ({counts.all})
                    </button>
                    <button
                      onClick={() => setFilter('approved')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : 'text-ink-muted hover:text-green-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved ({counts.approved})
                    </button>
                    <button
                      onClick={() => setFilter('review')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'review'
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-ink-muted hover:text-amber-600'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Review ({counts.review})
                    </button>
                    <button
                      onClick={() => setFilter('rejected')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'rejected'
                          ? 'bg-red-50 text-red-700'
                          : 'text-ink-muted hover:text-red-600'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected ({counts.rejected})
                    </button>
                  </div>

                  <div className="flex-1" />

                  <button className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-primary transition-colors">
                    <SortDesc className="w-4 h-4" />
                    Newest
                  </button>
                </div>
              </div>

              {/* Evaluation Cards */}
              <div className="space-y-3">
                {filteredEvaluations.length === 0 ? (
                  <div className="bg-surface-raised border border-stroke-subtle rounded-lg p-8 text-center">
                    <p className="text-ink-muted">No evaluations match the current filter</p>
                  </div>
                ) : (
                  filteredEvaluations.map((evaluation) => (
                    <EvaluationCard
                      key={evaluation.evaluation_id}
                      evaluation={evaluation}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Activity */}
            <div className="col-span-3">
              <ActivityFeed evaluations={evaluations} queue={queue} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
