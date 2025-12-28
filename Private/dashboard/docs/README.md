# Dashboard Documentation

This folder contains documentation for the Agent Skills Dashboard. These files are designed to be shared with AI agents and developers to quickly understand the project.

## Documents

| Document | Purpose | Share With |
|----------|---------|------------|
| [Architecture_Overview.md](./Architecture_Overview.md) | High-level system design, folder structure, data flow | New developers, architects |
| [Design_Agent.md](./Design_Agent.md) | Design system, colors, typography, component patterns | UI developers, designers |
| [Frontend_Agent.md](./Frontend_Agent.md) | Component architecture, React patterns, state management | Frontend developers |
| [Backend_Agent.md](./Backend_Agent.md) | Data layer, API design, database schema | Backend developers |
| [Product_Context.md](./Product_Context.md) | Product vision, user journeys, feature roadmap | Product managers, stakeholders |
| [Research_Agent.md](./Research_Agent.md) | Skill Discovery page, LLM-as-a-Judge integration | AI/ML developers, research features |

## For AI Agents

When working with AI coding assistants (Claude, Cursor, etc.), include the relevant document in your prompt:

```
@dashboard/docs/Frontend_Agent.md

Can you add a new component for skill comparison?
```

Or for broader context:

```
@dashboard/docs/Architecture_Overview.md
@dashboard/docs/Design_Agent.md

I need to create a new analytics page. What's the best approach?
```

## Quick Start

1. **Understanding the project**: Start with `Architecture_Overview.md`
2. **Making UI changes**: Read `Design_Agent.md` + `Frontend_Agent.md`
3. **Adding API endpoints**: Read `Backend_Agent.md`
4. **Understanding requirements**: Read `Product_Context.md`

## Keeping Docs Updated

When making significant changes:

1. Update relevant documentation
2. Add new patterns/decisions to appropriate file
3. Keep code examples in sync with actual implementation
4. Note any deprecated patterns

## Document Structure

Each document follows a consistent structure:

- **Purpose/Philosophy**: Why things are done this way
- **Specifications**: Concrete details, types, configs
- **Patterns**: Reusable approaches
- **Examples**: Code snippets and visual references
- **Future/Migration**: How to evolve the system

