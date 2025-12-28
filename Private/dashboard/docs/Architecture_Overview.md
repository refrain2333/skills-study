# Architecture Overview

## Project Context

This is the **Agent Skills Dashboard** - a product feature for the Agent Skills for Context Engineering platform. It is NOT a marketing site, but an actual application feature where users manage their active skills, monitor context usage, and configure their agent systems.

GitHub: https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | SSR-ready, scalable, good DX |
| Language | TypeScript | Type safety, better tooling |
| Styling | Tailwind CSS | Utility-first, custom design tokens |
| Icons | Lucide React | Consistent, tree-shakeable |
| Markdown | gray-matter + marked | Parse SKILL.md frontmatter and content |
| State | React useState (local) | Simple for now, can migrate to Zustand/Jotai |

## Folder Structure

```
dashboard/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main dashboard (Skills page)
│   │   ├── globals.css           # Global styles + Tailwind
│   │   └── skills/
│   │       ├── page.tsx          # Skills listing (legacy, may remove)
│   │       └── [slug]/page.tsx   # Individual skill detail (legacy)
│   │
│   ├── components/
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   ├── sidebar.tsx       # Left navigation sidebar
│   │   │   ├── header.tsx        # Top header with search
│   │   │   ├── skill-toggle-card.tsx    # Skill card with toggle
│   │   │   ├── active-skills-panel.tsx  # Right panel - active skills
│   │   │   ├── skill-detail-panel.tsx   # Right panel - skill details
│   │   │   ├── metrics-panel.tsx        # Top metrics row
│   │   │   └── activity-log.tsx         # Activity feed
│   │   │
│   │   ├── skills/               # Skill-related shared components
│   │   │   ├── category-icon.tsx # Category icon wrapper
│   │   │   ├── category-nav.tsx  # Category navigation
│   │   │   ├── skill-card.tsx    # Basic skill card (for listing)
│   │   │   └── skills-grid.tsx   # Grid with search/filter
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── header.tsx        # Marketing header (legacy)
│   │   │   └── footer.tsx        # Marketing footer (legacy)
│   │   │
│   │   └── ui/                   # Base UI primitives
│   │       ├── badge.tsx         # Category badges
│   │       ├── button.tsx        # Button variants
│   │       ├── input.tsx         # Input with icon support
│   │       └── icon.tsx          # Icon re-exports
│   │
│   └── lib/
│       ├── skills.ts             # Data layer - skill parsing
│       ├── types.ts              # TypeScript types + constants
│       └── utils.ts              # Utility functions (cn, formatDate, etc.)
│
├── docs/                         # Project documentation
│   ├── Architecture_Overview.md  # This file
│   ├── Design_Agent.md           # Design system docs
│   ├── Frontend_Agent.md         # Component architecture
│   ├── Backend_Agent.md          # Data layer docs
│   └── Product_Context.md        # Product requirements
│
├── tailwind.config.ts            # Design tokens, colors, fonts
├── package.json                  # Dependencies
└── next.config.js                # Next.js config
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Skills Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────┐    │
│  │   Sidebar   │    │          Main Content Area           │    │
│  │             │    │  ┌────────────────────────────────┐  │    │
│  │  - Nav      │    │  │       Metrics Panel            │  │    │
│  │  - Budget   │    │  └────────────────────────────────┘  │    │
│  │  - User     │    │  ┌─────────────────┐ ┌────────────┐  │    │
│  │             │    │  │   Skills List   │ │Right Panel │  │    │
│  │             │    │  │                 │ │            │  │    │
│  │             │    │  │  - Filters      │ │ - Active   │  │    │
│  │             │    │  │  - Toggle Cards │ │   Skills   │  │    │
│  │             │    │  │                 │ │ - Details  │  │    │
│  │             │    │  │                 │ │ - Activity │  │    │
│  │             │    │  └─────────────────┘ └────────────┘  │    │
│  └─────────────┘    └──────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

State Flow:
1. mockSkills (static data) → filteredSkills (via categoryFilter)
2. activeSkillSlugs (array of slugs) → activeSkills (filtered list)
3. selectedSkillSlug → selectedSkill (detail panel)
4. User actions → state updates → UI re-render
```

## Key Decisions

### 1. Local State vs Global State
Currently using React useState for simplicity. When scaling:
- **Zustand**: For cross-component state (active skills, user preferences)
- **React Query**: For server state (skill data from API)

### 2. Mock Data vs API
Currently using mock data in page.tsx. Migration path:
1. Extract to `/lib/mock-data.ts`
2. Create API routes in `/app/api/skills/`
3. Use React Query for data fetching
4. Add caching layer

### 3. Component Composition
Components are designed for composition:
- `SkillToggleCard` handles its own toggle UI
- `ActiveSkillsPanel` receives data and callbacks
- `SkillDetailPanel` is stateless except for local UI state

## Scaling Considerations

### Near-term
- [ ] Extract mock data to separate file
- [ ] Add loading states
- [ ] Implement actual search functionality
- [ ] Add keyboard navigation

### Medium-term
- [ ] API routes for skill CRUD
- [ ] User authentication
- [ ] Persistent skill configuration
- [ ] Real-time activity updates

### Long-term
- [ ] Multi-tenant support
- [ ] Team collaboration
- [ ] Skill versioning
- [ ] Usage analytics



