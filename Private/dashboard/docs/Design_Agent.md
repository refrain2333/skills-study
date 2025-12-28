# Design Agent Documentation

## Design Philosophy

This dashboard follows a **professional tool aesthetic** inspired by:
- **Harvey** - Clean, minimal, warm cream backgrounds
- **Graphite** - Data-dense layouts, activity feeds
- **Flow** - Personal feel, subtle warmth
- **Robotics Simulator** - Technical precision, control panels

**NOT** a marketing site. This is an application feature where users actively work.

## Color System

### Surface Hierarchy (Warm Cream Palette)

```css
surface-base:    #F5F3EF  /* Main background - warm cream */
surface-raised:  #FFFFFF  /* Cards, panels - pure white */
surface-sunken:  #EDEAE4  /* Inset areas, inputs */
surface-hover:   #E8E5DF  /* Hover states */
```

Usage:
- `surface-base` → Page background
- `surface-raised` → Cards, panels, modals
- `surface-sunken` → Input backgrounds, nested containers
- `surface-hover` → Interactive element hover states

### Ink Hierarchy (Warm Grays)

```css
ink-primary:   #1C1917  /* Headings, primary text */
ink-secondary: #44403C  /* Body text */
ink-muted:     #78716C  /* Secondary info, labels */
ink-faint:     #A8A29E  /* Disabled, hints, timestamps */
```

### Accent Color (Warm Orange)

```css
accent-primary: #EA580C  /* Primary actions, active states */
accent-hover:   #DC4D0A  /* Hover state */
accent-muted:   #FED7AA  /* Light backgrounds */
accent-subtle:  rgba(234, 88, 12, 0.08)  /* Very subtle backgrounds */
```

The orange accent creates warmth and energy without being aggressive.

### Category Colors

Each skill category has a distinct color for quick visual identification:

```css
category-foundational:  #2563EB  /* Blue - core concepts */
category-architectural: #7C3AED  /* Purple - system design */
category-operational:   #059669  /* Emerald - runtime ops */
category-methodology:   #D97706  /* Amber - practices */
```

### Status Colors

```css
status-success: #22C55E  /* Green - success, active */
status-warning: #F59E0B  /* Amber - warning, attention */
status-error:   #EF4444  /* Red - error, critical */
status-info:    #3B82F6  /* Blue - informational */
```

## Typography

### Font Stack

```css
font-sans:  'IBM Plex Sans', system-ui, sans-serif
font-serif: 'Instrument Serif', Georgia, serif
font-mono:  'IBM Plex Mono', Menlo, monospace
```

**Rationale**:
- IBM Plex Sans: Technical, professional, excellent readability
- Instrument Serif: Elegant accent for headings (sparingly used)
- IBM Plex Mono: Matches sans, good for code/data

### Type Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-2xs` | 10px | Micro labels, timestamps |
| `text-xs` | 12px | Secondary info, badges |
| `text-sm` | 14px | Body text, descriptions |
| `text-base` | 16px | Standard text |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Panel titles |
| `text-2xl` | 24px | Large metrics |

### Font Weights

- `font-normal` (400): Body text
- `font-medium` (500): Labels, buttons, nav items
- `font-semibold` (600): Headings, emphasis

## Component Patterns

### Panel Structure

All panels follow this structure:

```tsx
<div className="panel">
  <div className="panel-header">
    <span className="panel-title">PANEL TITLE</span>
    <button>Action</button>
  </div>
  <div className="panel-body">
    {/* Content */}
  </div>
</div>
```

CSS:
```css
.panel {
  @apply bg-surface-raised border border-stroke-subtle rounded-lg;
}
.panel-header {
  @apply px-4 py-3 border-b border-stroke-subtle flex items-center justify-between;
}
.panel-title {
  @apply text-xs font-semibold uppercase tracking-wider text-ink-muted;
}
```

### Skill Cards

Two variants:

1. **Toggle Card** (main dashboard):
```
┌─────────────────────────────────────────────────┐
│ ▓│ ⋮⋮  Skill Name          [Foundational] [◉] │
│  │      Description text here that can        │
│  │      span multiple lines if needed...      │
│  │      📄 Refs  💻 Scripts  ⏰ v1.0.0        │
└─────────────────────────────────────────────────┘
```
- Left colored bar indicates category
- Drag handle appears on hover
- Toggle switch on right

2. **Compact Card** (related skills):
```
┌────────────────────────────────────┐
│ ●  Skill Name                   → │
└────────────────────────────────────┘
```

### Buttons

Three variants:

```css
.btn-primary {
  @apply bg-accent-primary text-white hover:bg-accent-hover;
}
.btn-secondary {
  @apply bg-surface-hover text-ink-primary border border-stroke-subtle;
}
.btn-icon {
  @apply p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover;
}
```

### Tags/Badges

Category-specific styling:

```tsx
<span className="tag tag-foundational">Foundational</span>
<span className="tag tag-architectural">Architectural</span>
<span className="tag tag-operational">Operational</span>
<span className="tag tag-methodology">Methodology</span>
```

### Progress Bars

Simple, thin progress bars:

```tsx
<div className="progress-bar">
  <div 
    className="progress-fill bg-accent-primary" 
    style={{ width: '67%' }}
  />
</div>
```

### Metrics

```tsx
<div className="metric-card">
  <div className="flex items-end gap-1">
    <span className="metric-value">67</span>
    <span className="text-sm text-ink-muted">%</span>
  </div>
  <span className="metric-label">Context Used</span>
</div>
```

## Spacing System

Using Tailwind's default 4px base:

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Icon padding |
| `p-2` | 8px | Button padding, tight spacing |
| `p-3` | 12px | Card inner padding (small) |
| `p-4` | 16px | Standard panel padding |
| `p-6` | 24px | Large section padding |
| `gap-2` | 8px | Tight element spacing |
| `gap-3` | 12px | Standard element spacing |
| `gap-4` | 16px | Section spacing |
| `gap-6` | 24px | Major section gaps |

## Shadows

Subtle, warm shadows:

```css
shadow-soft:   0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)
shadow-medium: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)
shadow-panel:  0 0 0 1px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)
```

## Animation

Subtle, purposeful animations:

```css
animation-fade-in:   fadeIn 0.3s ease-out
animation-slide-in:  slideIn 0.3s ease-out (4px translateY)
animation-pulse-soft: 2s ease-in-out infinite (opacity 1 → 0.7)
```

Use animations for:
- Panel transitions
- Loading states
- Active indicators (pulse on status dots)

Avoid animations for:
- Every hover state
- Excessive micro-interactions
- Anything that slows down perception of speed

## Responsive Behavior

Current implementation is desktop-first. Breakpoints to consider:

| Breakpoint | Layout |
|------------|--------|
| `< 768px` | Stack sidebar, collapse right panel |
| `768px - 1024px` | Narrow sidebar, skill list only |
| `> 1024px` | Full three-column layout |

## Icons

Using Lucide React. Common icons:

| Icon | Usage |
|------|-------|
| `Layers` | Skills nav item |
| `BarChart3` | Analytics |
| `Terminal` | Logs |
| `BookOpen` | Docs, Foundational category |
| `Network` | Architectural category |
| `Settings` | Settings, Operational category |
| `GitBranch` | Methodology category |
| `Zap` | Logo, actions |
| `ChevronRight/Down` | Expand/collapse |
| `X` | Close, remove |
| `Check` | Success, copied |
| `Copy` | Copy action |

## Dark Mode (Future)

The design system supports dark mode. Implementation path:
1. Add `dark:` variants to Tailwind config
2. Create dark surface/ink palette
3. Add theme toggle in settings
4. Persist preference in localStorage

```css
/* Dark palette (proposed) */
surface-base-dark:    #0F0F10
surface-raised-dark:  #1A1A1C
ink-primary-dark:     #F5F5F5
accent-primary-dark:  #FB923C  /* Slightly lighter orange */
```



