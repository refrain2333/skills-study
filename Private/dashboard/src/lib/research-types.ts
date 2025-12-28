// Research Pipeline Types - Based on LLM-as-a-Judge Framework

export type SourceType = 
  | 'peer_reviewed' 
  | 'engineering_blog' 
  | 'documentation' 
  | 'preprint' 
  | 'tutorial' 
  | 'other';

export type TaxonomyCategory = 
  | 'context_retrieval' 
  | 'context_processing' 
  | 'context_management' 
  | 'rag' 
  | 'memory' 
  | 'tool_integration' 
  | 'multi_agent';

export type ImplementationType = 
  | 'prompt_template' 
  | 'code_pattern' 
  | 'architecture' 
  | 'evaluation_method';

export type EvaluationVerdict = 'APPROVE' | 'HUMAN_REVIEW' | 'REJECT';
export type Confidence = 'high' | 'medium' | 'low';
export type Complexity = 'low' | 'medium' | 'high';

export interface GateResult {
  pass: boolean;
  evidence: string;
}

export interface Gatekeeper {
  G1_mechanism_specificity: GateResult;
  G2_implementable_artifacts: GateResult;
  G3_beyond_basics: GateResult;
  G4_source_verifiability: GateResult;
  verdict: 'PASS' | 'REJECT';
  rejection_reason: string | null;
}

export interface DimensionScore {
  reasoning: string;
  score: 0 | 1 | 2;
}

export interface Scoring {
  D1_technical_depth: DimensionScore;
  D2_context_engineering_relevance: DimensionScore;
  D3_evidence_rigor: DimensionScore;
  D4_novelty_insight: DimensionScore;
  weighted_total: number;
  calculation_shown: string;
}

export interface Decision {
  verdict: EvaluationVerdict;
  override_triggered: 'O1' | 'O2' | 'O3' | 'O4' | null;
  confidence: Confidence;
  justification: string;
}

export interface SkillExtraction {
  extractable: boolean;
  skill_name: string;
  taxonomy_category: TaxonomyCategory;
  description: string;
  implementation_type: ImplementationType;
  estimated_complexity: Complexity;
}

export interface ResearchSource {
  id: string;
  url: string;
  title: string;
  author: string | null;
  source_type: SourceType;
  content_preview?: string;
  added_at: string;
  added_by: string;
}

export interface Evaluation {
  evaluation_id: string;
  timestamp: string;
  source: ResearchSource;
  gatekeeper: Gatekeeper;
  scoring: Scoring | null; // null if rejected at gate
  decision: Decision;
  skill_extraction: SkillExtraction | null;
  human_review_notes: string | null;
  processing_time_ms: number;
}

export type ProcessingStatus = 
  | 'queued' 
  | 'fetching' 
  | 'evaluating' 
  | 'completed' 
  | 'failed';

export interface QueueItem {
  id: string;
  source: ResearchSource;
  status: ProcessingStatus;
  progress: number; // 0-100
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  evaluation: Evaluation | null;
}

// Mock data generators
export function createMockQueueItem(overrides?: Partial<QueueItem>): QueueItem {
  const id = Math.random().toString(36).substring(7);
  return {
    id,
    source: {
      id,
      url: 'https://example.com/article',
      title: 'Loading...',
      author: null,
      source_type: 'other',
      added_at: new Date().toISOString(),
      added_by: 'user',
    },
    status: 'queued',
    progress: 0,
    started_at: null,
    completed_at: null,
    error: null,
    evaluation: null,
    ...overrides,
  };
}

// Sample evaluations for demo
export const SAMPLE_EVALUATIONS: Evaluation[] = [
  {
    evaluation_id: 'eval-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    source: {
      id: 'src-001',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      title: 'Building Effective Agents',
      author: 'Erik Schluntz, Barry Zhang',
      source_type: 'engineering_blog',
      added_at: new Date(Date.now() - 7200000).toISOString(),
      added_by: 'murat',
    },
    gatekeeper: {
      G1_mechanism_specificity: { pass: true, evidence: 'Defines workflow patterns, orchestrator-worker delegation, tool interface design' },
      G2_implementable_artifacts: { pass: true, evidence: 'Includes code patterns, prompt templates, architectural diagrams' },
      G3_beyond_basics: { pass: true, evidence: 'Covers agent lifecycle, state persistence, multi-step orchestration' },
      G4_source_verifiability: { pass: true, evidence: 'Anthropic engineering blog - top-tier AI lab' },
      verdict: 'PASS',
      rejection_reason: null,
    },
    scoring: {
      D1_technical_depth: { reasoning: 'Complete workflow patterns with implementation guidance. Practitioner can directly implement orchestrator patterns.', score: 2 },
      D2_context_engineering_relevance: { reasoning: 'Directly addresses agent context management, tool integration, and state handling.', score: 2 },
      D3_evidence_rigor: { reasoning: 'Production experience shared but lacks quantitative metrics.', score: 1 },
      D4_novelty_insight: { reasoning: 'Novel framing of "agentic systems" vs "workflows". New mental models for agent design.', score: 2 },
      weighted_total: 1.85,
      calculation_shown: '(2×0.35) + (2×0.30) + (1×0.20) + (2×0.15) = 1.85',
    },
    decision: {
      verdict: 'APPROVE',
      override_triggered: null,
      confidence: 'high',
      justification: 'Authoritative source with implementable patterns for agent architecture. Novel frameworks for thinking about agent systems.',
    },
    skill_extraction: {
      extractable: true,
      skill_name: 'DesignAgentWorkflows',
      taxonomy_category: 'multi_agent',
      description: 'Pattern library for orchestrator-worker delegation and workflow composition',
      implementation_type: 'architecture',
      estimated_complexity: 'medium',
    },
    human_review_notes: null,
    processing_time_ms: 4523,
  },
  {
    evaluation_id: 'eval-002',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: {
      id: 'src-002',
      url: 'https://arxiv.org/abs/2507.13334',
      title: 'Context Engineering for LLMs: A Survey',
      author: 'Research Team',
      source_type: 'preprint',
      added_at: new Date(Date.now() - 3600000).toISOString(),
      added_by: 'murat',
    },
    gatekeeper: {
      G1_mechanism_specificity: { pass: true, evidence: 'Comprehensive taxonomy of context engineering mechanisms' },
      G2_implementable_artifacts: { pass: true, evidence: 'Includes framework diagrams, categorization schemas' },
      G3_beyond_basics: { pass: true, evidence: 'Covers retrieval, processing, management across system types' },
      G4_source_verifiability: { pass: true, evidence: 'arXiv preprint with citations' },
      verdict: 'PASS',
      rejection_reason: null,
    },
    scoring: {
      D1_technical_depth: { reasoning: 'Survey format - comprehensive categorization but limited implementation detail.', score: 1 },
      D2_context_engineering_relevance: { reasoning: 'Defines the field taxonomy. Core reference document.', score: 2 },
      D3_evidence_rigor: { reasoning: 'Literature review with citations. Synthesizes existing research.', score: 2 },
      D4_novelty_insight: { reasoning: 'First comprehensive taxonomy of context engineering as discipline.', score: 2 },
      weighted_total: 1.65,
      calculation_shown: '(1×0.35) + (2×0.30) + (2×0.20) + (2×0.15) = 1.65',
    },
    decision: {
      verdict: 'APPROVE',
      override_triggered: null,
      confidence: 'high',
      justification: 'Foundational taxonomy document. Essential reference for categorizing all other skills.',
    },
    skill_extraction: {
      extractable: true,
      skill_name: 'ContextEngineeringTaxonomy',
      taxonomy_category: 'context_management',
      description: 'Reference taxonomy for categorizing context engineering techniques',
      implementation_type: 'architecture',
      estimated_complexity: 'low',
    },
    human_review_notes: null,
    processing_time_ms: 3891,
  },
  {
    evaluation_id: 'eval-003',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    source: {
      id: 'src-003',
      url: 'https://medium.com/@random/10-prompt-tips',
      title: '10 Prompt Engineering Tips for Better AI',
      author: 'Unknown',
      source_type: 'tutorial',
      added_at: new Date(Date.now() - 1800000).toISOString(),
      added_by: 'murat',
    },
    gatekeeper: {
      G1_mechanism_specificity: { pass: false, evidence: 'Generic tips like "be specific" without mechanisms' },
      G2_implementable_artifacts: { pass: false, evidence: 'No code, schemas, or templates' },
      G3_beyond_basics: { pass: false, evidence: 'Basic tips only' },
      G4_source_verifiability: { pass: false, evidence: 'Anonymous author' },
      verdict: 'REJECT',
      rejection_reason: 'Failed G1, G2, G3, G4 - No implementable engineering value',
    },
    scoring: null,
    decision: {
      verdict: 'REJECT',
      override_triggered: null,
      confidence: 'high',
      justification: 'Failed 4/4 gate criteria. Generic content without actionable patterns.',
    },
    skill_extraction: null,
    human_review_notes: null,
    processing_time_ms: 1203,
  },
  {
    evaluation_id: 'eval-004',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    source: {
      id: 'src-004',
      url: 'https://github.com/user/novel-memory-arch',
      title: 'Novel 3-Tier Memory Architecture for Agents',
      author: 'Independent Researcher',
      source_type: 'documentation',
      added_at: new Date(Date.now() - 600000).toISOString(),
      added_by: 'murat',
    },
    gatekeeper: {
      G1_mechanism_specificity: { pass: true, evidence: 'Defines 3-tier memory with specific retrieval thresholds' },
      G2_implementable_artifacts: { pass: true, evidence: 'Complete Python implementation' },
      G3_beyond_basics: { pass: true, evidence: 'Novel architecture beyond standard patterns' },
      G4_source_verifiability: { pass: true, evidence: 'GitHub with 2k+ stars' },
      verdict: 'PASS',
      rejection_reason: null,
    },
    scoring: {
      D1_technical_depth: { reasoning: 'Complete code implementation. Can be directly adapted.', score: 2 },
      D2_context_engineering_relevance: { reasoning: 'Core memory systems topic from CE taxonomy.', score: 2 },
      D3_evidence_rigor: { reasoning: 'Single benchmark on custom dataset. No baselines.', score: 1 },
      D4_novelty_insight: { reasoning: 'Novel 3-tier approach not documented elsewhere.', score: 2 },
      weighted_total: 1.85,
      calculation_shown: '(2×0.35) + (2×0.30) + (1×0.20) + (2×0.15) = 1.85',
    },
    decision: {
      verdict: 'HUMAN_REVIEW',
      override_triggered: 'O3',
      confidence: 'medium',
      justification: 'High-quality with novel ideas but evidence rigor limited. Verify claims before adding.',
    },
    skill_extraction: {
      extractable: true,
      skill_name: 'ThreeTierMemoryArchitecture',
      taxonomy_category: 'memory',
      description: 'Hierarchical memory system with episodic, semantic, and procedural tiers',
      implementation_type: 'code_pattern',
      estimated_complexity: 'high',
    },
    human_review_notes: 'Verify benchmark methodology. Check if approach generalizes.',
    processing_time_ms: 5102,
  },
];

export const SAMPLE_QUEUE: QueueItem[] = [
  {
    id: 'q-001',
    source: {
      id: 'q-001',
      url: 'https://vercel.com/blog/ai-sdk-tool-calling',
      title: 'Fetching...',
      author: null,
      source_type: 'engineering_blog',
      added_at: new Date().toISOString(),
      added_by: 'murat',
    },
    status: 'fetching',
    progress: 25,
    started_at: new Date(Date.now() - 10000).toISOString(),
    completed_at: null,
    error: null,
    evaluation: null,
  },
  {
    id: 'q-002',
    source: {
      id: 'q-002',
      url: 'https://openai.com/research/function-calling',
      title: 'Function Calling and Tool Use',
      author: 'OpenAI Research',
      source_type: 'engineering_blog',
      added_at: new Date().toISOString(),
      added_by: 'murat',
    },
    status: 'evaluating',
    progress: 65,
    started_at: new Date(Date.now() - 30000).toISOString(),
    completed_at: null,
    error: null,
    evaluation: null,
  },
];



