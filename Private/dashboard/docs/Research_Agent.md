# Research Agent Documentation

## Feature Overview

The **Skill Discovery** page (`/research`) is a research curation cockpit where users can:

1. Submit documents or URLs for evaluation
2. Watch agents evaluate content using the LLM-as-a-Judge framework
3. Review and approve/reject skill candidates
4. Track discovered skill opportunities

This is a human-in-the-loop research pipeline for discovering new skills to add to the Agent Skills library.

## Route

```
/research
```

## Architecture

### Three-Column Layout

```
┌─────────────┬─────────────────────────────┬─────────────────┐
│   Sidebar   │         Main Content         │    Activity     │
│   (shared)  │                              │     Panel       │
├─────────────┼─────────────────────────────┼─────────────────┤
│             │  ┌─────────────────────────┐ │                 │
│  Navigation │  │      Stats Row          │ │   Activity      │
│             │  └─────────────────────────┘ │   Feed          │
│             │  ┌─────────────────────────┐ │                 │
│             │  │    Filter Bar           │ │                 │
│  Add Source │  └─────────────────────────┘ │                 │
│  Panel      │  ┌─────────────────────────┐ │                 │
│             │  │                         │ │                 │
│  Processing │  │   Evaluation Cards      │ │                 │
│  Queue      │  │                         │ │                 │
│             │  │                         │ │                 │
│  Skill      │  │                         │ │                 │
│  Candidates │  │                         │ │                 │
│             │  └─────────────────────────┘ │                 │
└─────────────┴─────────────────────────────┴─────────────────┘
```

### Component Hierarchy

```
/research (page.tsx)
├── Sidebar (shared)
├── Header
│   ├── Radar icon + title
│   ├── BETA badge
│   ├── Search input
│   └── Notification button
└── Main Content
    ├── Left Column (col-span-3)
    │   ├── SourceInput
    │   ├── ProcessingQueue
    │   └── SkillCandidates
    ├── Center Column (col-span-6)
    │   ├── CockpitStats
    │   ├── Filter Bar
    │   └── EvaluationCard[] (list)
    └── Right Column (col-span-3)
        └── ActivityFeed
```

## Components

### SourceInput (`source-input.tsx`)

Input panel for adding sources to evaluate.

**Features**:
- Three input modes: URL, Paste, Upload
- Quick-add buttons for common domains (arxiv.org, anthropic.com, openai.com)
- Loading state during submission

**Props**:
```typescript
interface SourceInputProps {
  onSubmit: (url: string) => void;
  isProcessing?: boolean;
}
```

### ProcessingQueue (`processing-queue.tsx`)

Shows items currently being fetched and evaluated.

**Features**:
- Status icons per processing stage (queued, fetching, evaluating, completed, failed)
- Progress bars with percentage
- Error states with retry option
- URL preview

**Props**:
```typescript
interface ProcessingQueueProps {
  items: QueueItem[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}
```

### EvaluationCard (`evaluation-card.tsx`)

Expandable card showing evaluation results for a source.

**Features**:
- Verdict badge (APPROVE / HUMAN_REVIEW / REJECT)
- Left border color indicates verdict
- Collapsed: title, source type, time, score, gate indicators (G1-G4)
- Expanded: gatekeeper details, dimensional scores, decision, skill extraction
- Copy JSON button
- Approve/Reject actions for HUMAN_REVIEW items

**Props**:
```typescript
interface EvaluationCardProps {
  evaluation: Evaluation;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  compact?: boolean;
}
```

### SkillCandidates (`skill-candidates.tsx`)

Panel showing approved sources with extractable skills.

**Features**:
- Category icon and color
- Skill name, description, taxonomy category
- Implementation type badge
- Complexity indicator (low/medium/high)
- Link to source
- Create button (for future skill creation flow)

**Props**:
```typescript
interface SkillCandidatesProps {
  evaluations: Evaluation[];
  onCreateSkill?: (evaluation: Evaluation) => void;
}
```

### CockpitStats (`cockpit-stats.tsx`)

Metrics row showing pipeline statistics.

**Metrics**:
- Approved count (with trend)
- Needs Review count
- Avg Score (out of 2.0)
- Avg Time (in seconds)

### ActivityFeed (`activity-feed.tsx`)

Real-time feed of processing events and evaluation results.

**Features**:
- Combines queue events and evaluation results
- Sorted by timestamp (newest first)
- Status icons with colors
- Skill name shown for approved items

## Data Types

All types are defined in `/lib/research-types.ts`:

### Key Interfaces

```typescript
// Source document metadata
interface ResearchSource {
  id: string;
  url: string;
  title: string;
  author: string | null;
  source_type: SourceType;
  added_at: string;
  added_by: string;
}

// Full evaluation result
interface Evaluation {
  evaluation_id: string;
  timestamp: string;
  source: ResearchSource;
  gatekeeper: Gatekeeper;
  scoring: Scoring | null;
  decision: Decision;
  skill_extraction: SkillExtraction | null;
  human_review_notes: string | null;
  processing_time_ms: number;
}

// Queue item for processing
interface QueueItem {
  id: string;
  source: ResearchSource;
  status: ProcessingStatus;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  evaluation: Evaluation | null;
}
```

### LLM-as-a-Judge Framework

The evaluation follows the rubric defined in `/researcher/llm-as-a-judge.md`:

**Gatekeeper (G1-G4)**: Binary pass/fail checks
- G1: Mechanism Specificity
- G2: Implementable Artifacts
- G3: Beyond Basics
- G4: Source Verifiability

**Dimensional Scoring (D1-D4)**: 0-2 scale with weights
- D1: Technical Depth (35%)
- D2: Context Engineering Relevance (30%)
- D3: Evidence Rigor (20%)
- D4: Novelty/Insight (15%)

**Verdicts**:
- `APPROVE`: weighted_total >= 1.4
- `HUMAN_REVIEW`: 0.9 <= weighted_total < 1.4
- `REJECT`: weighted_total < 0.9 or any gate fail

**Skill Extraction**: For approved sources
- skill_name (VerbNoun format)
- taxonomy_category (context_retrieval, memory, etc.)
- implementation_type (prompt_template, code_pattern, etc.)
- estimated_complexity (low/medium/high)

## Current State

### Implemented (UI Only)

- Complete UI for all components
- Filter by verdict (All/Approved/Review/Rejected)
- Expandable evaluation cards with full details
- Mock data for demonstration
- Demo processing simulation when adding URLs

### Pending (Backend)

1. **API Route**: `/api/evaluate`
   - Fetch URL content
   - Run LLM-as-a-Judge prompt
   - Return evaluation JSON

2. **Persistence**: Store evaluations in database
   - Supabase or Postgres
   - User-specific evaluations

3. **Real LLM Integration**:
   - Claude API for evaluation
   - Use rubric from `llm-as-a-judge.md`

4. **Skill Creation Flow**:
   - Create skill from approved evaluation
   - Generate SKILL.md template
   - Add to repository

## State Management

Currently using React `useState` in the page component:

```typescript
const [queue, setQueue] = useState<QueueItem[]>(SAMPLE_QUEUE);
const [evaluations, setEvaluations] = useState<Evaluation[]>(SAMPLE_EVALUATIONS);
const [filter, setFilter] = useState<FilterType>('all');
const [isProcessing, setIsProcessing] = useState(false);
```

**Migration Path**:
- Extract to Zustand store for cross-component access
- Add React Query for API integration
- Persist user preferences

## Design Notes

This page follows the same design system as the Skills Dashboard:

- Warm cream background (`surface-base`)
- White panels (`surface-raised`)
- Orange accent (`accent-primary`)
- Category colors for verdicts (green/amber/red)
- Left colored border on cards indicates verdict
- IBM Plex typography

See `Design_Agent.md` for full design system documentation.

## File Structure

```
src/
├── app/
│   └── research/
│       └── page.tsx          # Main research page
├── components/
│   └── research/
│       ├── source-input.tsx
│       ├── processing-queue.tsx
│       ├── evaluation-card.tsx
│       ├── skill-candidates.tsx
│       ├── cockpit-stats.tsx
│       └── activity-feed.tsx
└── lib/
    └── research-types.ts     # All TypeScript types
```

## Usage Example

```tsx
// Adding a source (demo mode)
const handleAddSource = (url: string) => {
  // 1. Create queue item
  // 2. Simulate fetching (500ms)
  // 3. Simulate evaluating (1500ms)
  // 4. Add evaluation result
};

// Approving a HUMAN_REVIEW item
const handleApprove = (id: string) => {
  setEvaluations(prev => 
    prev.map(e => 
      e.evaluation_id === id 
        ? { ...e, decision: { ...e.decision, verdict: 'APPROVE' } }
        : e
    )
  );
};
```

## Next Steps

1. Create API route for real evaluation
2. Integrate Claude API with LLM-as-a-Judge prompt
3. Add database persistence
4. Implement skill creation workflow
5. Add pagination for evaluation list
6. Add bulk import for multiple URLs



