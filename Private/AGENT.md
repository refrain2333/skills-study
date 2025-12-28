# Private Directory - DO NOT PUSH TO PUBLIC REPO

This directory contains proprietary code that must ONLY be pushed to the private repository.

## Repository Rules

**PUBLIC REPO (origin):** `https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering`
- DO NOT push this `Private/` directory
- This repo has 3.9k+ stars and is publicly visible

**PRIVATE REPO (private):** `https://github.com/muratcankoylan/-agent-skills-dashboard-`
- Push changes from this directory here
- Contains investor-facing content and proprietary dashboard

## Contents

- `dashboard/` - Skills management dashboard (internal product)
- `website/` - Investor preview site for butterpath.com (password protected)

## Push Commands

```bash
# Push to private repo only
git push private main

# NEVER run this for Private/ contents:
# git push origin main
```

## Environment Variables (for Vercel deployment)

Set these in Vercel dashboard for the website:
- `SITE_PASSWORD` - Password for investor access (default: butterpath2024)

