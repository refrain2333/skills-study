# Frontend Agent Documentation

## Component Architecture

### Hierarchy

```
App (layout.tsx)
└── DashboardPage (page.tsx) ← Main state container
    ├── Sidebar
    │   ├── Logo
    │   ├── Navigation links
    │   ├── Context Budget meter
    │   └── User profile
    │
    ├── Header
    │   ├── Title
    │   ├── Search input
    │   └── Action buttons (help, notifications)
    │
    └── Main content
        ├── MetricsPanel
        │   └── 4x Metric cards
        │
        ├── Skills List (left)
        │   ├── Filter controls
        │   ├── View toggle (list/grid)
        │   └── SkillToggleCard[] (mapped)
        │
        └── Right Panel
            ├── SkillDetailPanel (when skill selected)
            │   OR
            ├── ActiveSkillsPanel (when no selection)
            │
            └── ActivityLog
```

### State Management

Current: Local state in `page.tsx`

```typescript
// Active skills - ordered array of slugs
const [activeSkillSlugs, setActiveSkillSlugs] = useState<string[]>([...]);

// Currently selected skill for detail panel
const [selectedSkillSlug, setSelectedSkillSlug] = useState<string | null>(null);

// Category filter
const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');

// View mode
const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
```

**Migration to Zustand (recommended for scaling)**:

```typescript
// stores/skill-store.ts
interface SkillStore {
  activeSkillSlugs: string[];
  selectedSkillSlug: string | null;
  categoryFilter: SkillCategory | 'all';
  
  toggleSkill: (slug: string) => void;
  selectSkill: (slug: string | null) => void;
  reorderSkills: (from: number, to: number) => void;
  setFilter: (filter: SkillCategory | 'all') => void;
}
```

## Component Specifications

### Sidebar (`sidebar.tsx`)

**Purpose**: Main navigation and context summary

**Props**: None (self-contained)

**State**:
- `activeItem: string` - Currently active nav item

**Sections**:
1. Logo block (h-14)
2. Navigation links (flex-1)
3. Context Budget summary (fixed)
4. User profile (fixed)

**Key Classes**:
```css
w-56 h-screen bg-surface-raised border-r border-stroke-subtle
```

### Header (`header.tsx`)

**Purpose**: Page title and global actions

**Props**:
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
}
```

**Features**:
- Search input with keyboard shortcut hint (⌘K)
- Help button
- Notifications button with indicator dot

### SkillToggleCard (`skill-toggle-card.tsx`)

**Purpose**: Display skill with activation toggle

**Props**:
```typescript
interface SkillToggleCardProps {
  skill: Skill;
  isActive: boolean;
  isSelected: boolean;
  onToggle: (slug: string) => void;
  onSelect: (slug: string) => void;
}
```

**Visual States**:
- Default: neutral border
- Active: accent border, light accent background
- Selected: ring around card
- Hover: shows drag handle

**Interaction**:
- Click card → select (show details)
- Click toggle → activate/deactivate
- Drag handle → (future) reorder in list

### ActiveSkillsPanel (`active-skills-panel.tsx`)

**Purpose**: Show active skills stack with reordering

**Props**:
```typescript
interface ActiveSkillsPanelProps {
  activeSkills: Skill[];
  onRemove: (slug: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}
```

**Features**:
- Numbered priority order
- Category color dot
- Up/down reorder buttons
- Remove button
- Token usage estimates

### SkillDetailPanel (`skill-detail-panel.tsx`)

**Purpose**: Show full skill details and actions

**Props**:
```typescript
interface SkillDetailPanelProps {
  skill: Skill | null;
  isActive: boolean;
  onClose: () => void;
  onToggle: (slug: string) => void;
}
```

**Sections**:
1. Header with category badge and version
2. Title and description
3. Meta info (author, updated date)
4. Collapsible sections:
   - When to Activate
   - Guidelines
   - Resources (files)
5. Footer actions (Activate/Deactivate, Copy)

**Local State**:
```typescript
const [expandedSection, setExpandedSection] = useState<string | null>('when-to-activate');
const [copied, setCopied] = useState(false);
```

### MetricsPanel (`metrics-panel.tsx`)

**Purpose**: Display key metrics

**Data Structure**:
```typescript
interface Metric {
  label: string;
  value: string;
  change?: number;  // percentage change
  unit?: string;
}
```

**Metrics Shown**:
- Active Skills (count)
- Context Used (%)
- Avg. Latency (seconds)
- Sessions Today (count)

### ActivityLog (`activity-log.tsx`)

**Purpose**: Show recent actions

**Data Structure**:
```typescript
interface LogEntry {
  id: string;
  time: string;
  type: 'success' | 'error' | 'info' | 'action';
  message: string;
  skill?: string;  // optional skill reference
}
```

**Features**:
- Color-coded icons by type
- Timestamp column
- "View all" link

## React Patterns Used

### 1. Controlled Components
All interactive elements receive state and callbacks from parent:
```tsx
<SkillToggleCard
  skill={skill}
  isActive={activeSkillSlugs.includes(skill.slug)}
  onToggle={handleToggle}
/>
```

### 2. Derived State with useMemo
```tsx
const activeSkills = useMemo(() => 
  mockSkills.filter(s => activeSkillSlugs.includes(s.slug)),
  [activeSkillSlugs]
);
```

### 3. Conditional Rendering
```tsx
{selectedSkillSlug ? (
  <SkillDetailPanel ... />
) : (
  <ActiveSkillsPanel ... />
)}
```

### 4. Event Propagation Control
```tsx
onClick={(e) => {
  e.stopPropagation();  // Prevent card selection
  onToggle(skill.slug);
}}
```

### 5. CSS Class Composition
Using `cn()` utility (clsx + tailwind-merge):
```tsx
className={cn(
  'skill-card',
  isActive && 'active',
  isSelected && 'selected'
)}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ State:                                                │    │
│  │  - activeSkillSlugs: string[]                        │    │
│  │  - selectedSkillSlug: string | null                  │    │
│  │  - categoryFilter: SkillCategory | 'all'             │    │
│  │  - viewMode: 'list' | 'grid'                         │    │
│  └──────────────────┬──────────────────────────────────┘    │
│                     │                                        │
│         ┌───────────┼───────────┬───────────────┐           │
│         ▼           ▼           ▼               ▼           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Filters  │ │  Cards   │ │  Active  │ │  Detail  │       │
│  │          │ │          │ │  Panel   │ │  Panel   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│       │            │            │             │             │
│       │            │            │             │             │
│       ▼            ▼            ▼             ▼             │
│  setCategoryFilter  │      onReorder    onClose/onToggle   │
│                onToggle       onRemove                      │
│                onSelect                                     │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Current Optimizations
- `useMemo` for filtered/derived data
- Minimal re-renders (state lifted appropriately)
- Lucide icons are tree-shakeable

### Future Optimizations
- `React.memo()` for card components
- Virtual scrolling for large skill lists (react-window)
- Suspense boundaries for data loading
- Image optimization for any future media

## Testing Strategy

### Unit Tests (recommended)
```typescript
// __tests__/skill-toggle-card.test.tsx
describe('SkillToggleCard', () => {
  it('renders skill name and description');
  it('shows active state when isActive=true');
  it('calls onToggle when toggle clicked');
  it('calls onSelect when card clicked');
  it('stops propagation on toggle click');
});
```

### Integration Tests
- Filter changes update visible skills
- Toggling skill updates Active Skills panel
- Selecting skill shows detail panel

### E2E Tests (Playwright)
- Full user flow: browse → filter → activate → configure
- Keyboard navigation
- Responsive behavior



