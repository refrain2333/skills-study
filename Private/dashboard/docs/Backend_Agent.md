# Backend Agent Documentation

## Current State: Static Data

The dashboard currently uses **mock data** defined inline in `page.tsx`. This is intentional for rapid prototyping. The data layer is designed for easy migration to API-based fetching.

## Data Sources

### Primary: SKILL.md Files

Skills are defined as markdown files in the main repository:

```
/skills/
├── context-fundamentals/
│   ├── SKILL.md           ← Main content
│   ├── scripts/
│   │   └── context_manager.py
│   └── references/
│       └── context-components.md
├── tool-design/
│   └── ...
└── ...
```

Each SKILL.md has frontmatter:
```yaml
---
name: context-fundamentals
description: Understand the components, mechanics, and constraints...
---
```

### Skill Parsing (`lib/skills.ts`)

The data layer provides these functions:

```typescript
// Get all skill slugs (directory names)
getAllSkillSlugs(): string[]

// Get full skill object by slug
getSkillBySlug(slug: string): Skill | null

// Get all skills with full details
getAllSkills(): Skill[]

// Get lightweight summaries for listing
getAllSkillSummaries(): SkillSummary[]

// Get skills filtered by category
getSkillsByCategory(category: SkillCategory): Skill[]

// Render markdown to HTML
renderMarkdown(content: string): Promise<string>
```

### Parsing Logic

```typescript
// 1. Read frontmatter
const { data, content } = matter(fileContent);

// 2. Parse sections from content
const sections = parseSections(content);

// 3. Extract structured data
const whenToActivate = parseWhenToActivate(content);
const guidelines = parseGuidelines(content);
const relatedSkills = parseRelatedSkills(content);
const metadata = parseMetadata(content);

// 4. Check for scripts/references
const hasScripts = fs.existsSync(scriptsDir);
const hasReferences = fs.existsSync(referencesDir);
```

## Type Definitions (`lib/types.ts`)

### Core Types

```typescript
type SkillCategory = 
  | 'foundational'
  | 'architectural'
  | 'operational'
  | 'methodology';

interface Skill {
  // Identification
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  
  // Content
  content: string;  // Raw markdown body
  sections: SkillSection[];
  
  // Structured data
  whenToActivate: string[];
  guidelines: string[];
  relatedSkills: string[];
  references: SkillReference[];
  
  // Metadata
  metadata: SkillMetadata;
  
  // File info
  hasScripts: boolean;
  hasReferences: boolean;
  scriptFiles?: string[];
  referenceFiles?: string[];
}

interface SkillMetadata {
  created: string;
  updated: string;
  author: string;
  version: string;
}

interface SkillSummary {
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  updated: string;
}
```

### Constants

```typescript
// Category configuration
const CATEGORY_CONFIG: Record<SkillCategory, {
  label: string;
  color: string;
  description: string;
}>;

// Skill to category mapping
const SKILL_CATEGORIES: Record<string, SkillCategory>;
```

## Mock Data Structure

Current mock data in `page.tsx`:

```typescript
const mockSkills: Skill[] = [
  {
    slug: 'context-fundamentals',
    name: 'context-fundamentals',
    description: '...',
    category: 'foundational',
    content: '',  // Empty for mock
    sections: [],
    whenToActivate: [
      'Designing new agent systems...',
      'Debugging unexpected behavior...',
    ],
    guidelines: [
      'Treat context as finite resource...',
      'Place critical info at attention-favored positions...',
    ],
    relatedSkills: ['context-degradation', 'context-optimization'],
    references: [],
    metadata: {
      created: '2025-12-20',
      updated: '2025-12-20',
      author: 'Contributors',
      version: '1.0.0'
    },
    hasScripts: true,
    hasReferences: true,
    scriptFiles: ['context_manager.py'],
    referenceFiles: ['context-components.md'],
  },
  // ... more skills
];
```

## Migration to API

### Phase 1: Extract Mock Data

```typescript
// lib/mock-data.ts
export const mockSkills: Skill[] = [...];
```

### Phase 2: API Routes

```typescript
// app/api/skills/route.ts
export async function GET() {
  const skills = getAllSkills();  // Or fetch from DB
  return Response.json(skills);
}

// app/api/skills/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const skill = getSkillBySlug(params.slug);
  if (!skill) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json(skill);
}
```

### Phase 3: React Query Integration

```typescript
// hooks/use-skills.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => fetch('/api/skills').then(r => r.json()),
  });
}

export function useSkill(slug: string) {
  return useQuery({
    queryKey: ['skills', slug],
    queryFn: () => fetch(`/api/skills/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });
}
```

### Phase 4: User State Persistence

For active skills and preferences:

```typescript
// app/api/user/skills/route.ts
export async function GET() {
  // Get user from session
  const user = await getUser();
  const activeSkills = await db.userSkills.findMany({
    where: { userId: user.id },
    orderBy: { priority: 'asc' },
  });
  return Response.json(activeSkills);
}

export async function PUT(request: Request) {
  const user = await getUser();
  const { skills } = await request.json();
  
  await db.userSkills.deleteMany({ where: { userId: user.id } });
  await db.userSkills.createMany({
    data: skills.map((slug: string, i: number) => ({
      userId: user.id,
      skillSlug: slug,
      priority: i,
    })),
  });
  
  return Response.json({ success: true });
}
```

## Database Schema (Future)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  activeSkills  UserSkill[]
  preferences   UserPreferences?
}

model UserSkill {
  id        String   @id @default(cuid())
  userId    String
  skillSlug String
  priority  Int      // Order in active skills list
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, skillSlug])
}

model UserPreferences {
  id             String  @id @default(cuid())
  userId         String  @unique
  defaultView    String  @default("list")
  contextBudget  Int     @default(80000)  // tokens
  user           User    @relation(fields: [userId], references: [id])
}

model SkillUsageLog {
  id        String   @id @default(cuid())
  userId    String
  skillSlug String
  action    String   // 'activated', 'deactivated', 'viewed'
  createdAt DateTime @default(now())
}
```

## Activity Log System

### Current: Mock Data

Static array in `activity-log.tsx`:

```typescript
const recentLogs: LogEntry[] = [
  { id: '1', time: '12:34', type: 'success', message: 'Skill activated', skill: 'context-fundamentals' },
  // ...
];
```

### Future: Real-time Updates

```typescript
// Using Server-Sent Events
// app/api/activity/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const subscription = await subscribeToActivities(userId);
      
      subscription.on('activity', (activity) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(activity)}\n\n`)
        );
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

## Context Budget Calculation

### Current: Static Display

Shows fixed 67% in sidebar.

### Future: Real Calculation

```typescript
interface ContextEstimate {
  totalTokens: number;
  breakdown: {
    skillSlug: string;
    tokens: number;
  }[];
  utilization: number;  // 0-1
}

async function estimateContextUsage(
  activeSkillSlugs: string[]
): Promise<ContextEstimate> {
  const skills = await getSkillsBySlug(activeSkillSlugs);
  
  const breakdown = skills.map(skill => ({
    skillSlug: skill.slug,
    tokens: estimateTokens(skill.content),  // Use tiktoken
  }));
  
  const totalTokens = breakdown.reduce((sum, b) => sum + b.tokens, 0);
  const limit = 80000;  // Configurable per user/plan
  
  return {
    totalTokens,
    breakdown,
    utilization: totalTokens / limit,
  };
}
```

## Error Handling

### API Error Responses

```typescript
interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Usage
return Response.json(
  { error: 'Skill not found', code: 'SKILL_NOT_FOUND' },
  { status: 404 }
);
```

### Client-side Error Handling

```typescript
const { data, error, isLoading } = useSkills();

if (error) {
  return <ErrorState message={error.message} />;
}

if (isLoading) {
  return <LoadingState />;
}
```

## Caching Strategy

### Static Skills (rarely change)
- Cache for 1 hour
- Revalidate on webhook from GitHub

### User Data (changes frequently)
- No cache or short cache (30s)
- Optimistic updates on mutations

### Activity Log
- Real-time via SSE
- Keep last 50 in memory
- Paginate historical data



