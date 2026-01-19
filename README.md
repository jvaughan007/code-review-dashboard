# Code Review Dashboard

> Real-time collaborative code review tool for GitHub pull requests

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/jvaughan007/code-review-dashboard)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-275%20passing-success)](package.json)

**Live Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)

## Overview

Code Review Dashboard enables teams to review GitHub pull requests together in real-time. Built to solve the pain of asynchronous PR reviews across distributed teams, it features live cursors, presence indicators, synchronized comments, and intelligent code analysis - all running on a zero-cost infrastructure.

## Key Features

### Real-time Collaboration
- **Live Cursors**: See teammates' cursor positions with smooth 60fps animations and user labels
- **Presence Indicators**: Avatar stack showing who's viewing each PR with join/leave notifications
- **Activity Feed**: Real-time timeline of all collaboration events with filtering options
- **Synchronized Comments**: Threaded discussions with optimistic updates and conflict resolution

### Intelligent Code Review
- **Pattern Analysis Engine**: 14-rule static analyzer detecting security issues, performance problems, and best practice violations across TypeScript, JavaScript, Python, and Go
- **Review Progress Tracking**: Mark files as reviewed with team-visible progress bars
- **Line-Level Comments**: Click any line to add contextual feedback with keyboard navigation

### Gamification System
- **Points & Badges**: Earn points for reviews (5 pts/file, 10 pts/comment, 50 pts/PR completion)
- **Streak Tracking**: Maintain daily review streaks with personal bests
- **Weekly Leaderboard**: Top 5 reviewers with avatars and badge tiers (Bronze/Silver/Gold)

### User Experience
- **Dark Mode**: System preference detection with manual toggle
- **Mobile Responsive**: Touch-friendly interface with 44px tap targets
- **Large Diff Virtualization**: Smooth scrolling for 500+ line diffs using virtual rendering
- **Skeleton Loading**: Polished loading states throughout the app
- **Keyboard Shortcuts**: 12 customizable shortcuts with conflict detection

### Settings & Preferences
- **Notification Controls**: Toggle 6 notification types (comments, mentions, PR updates, etc.)
- **Shortcut Customization**: Record custom key bindings with real-time conflict warnings
- **Cross-Device Sync**: Settings persist locally, collaborative data syncs via database

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.1 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | 5.7.2 (strict) |
| Styling | Tailwind CSS | 4.1.0 |
| State Management | Zustand | 5.0.2 (9 stores) |
| Database | Supabase (PostgreSQL) | 16 |
| Animation | Framer Motion | 11.16.0 |
| Virtualization | @tanstack/react-virtual | Latest |
| Theme | next-themes | Latest |
| Testing | Vitest + Playwright | Latest |

## Architecture

### Zero-Cost Design

This project runs entirely on free tiers:
- **Supabase Free**: PostgreSQL database with Row Level Security
- **Vercel Free**: Next.js hosting with serverless functions
- **GitHub API**: OAuth authentication and PR data

### Real-time Sync via Polling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                        │
│                    (React 19 Server Components)                 │
└─────────────────────────────────────────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               │                                 │
   ┌───────────▼──────────┐         ┌───────────▼──────────┐
   │   GitHub REST API    │         │      Supabase        │
   │   (OAuth + PRs)      │         │    (PostgreSQL)      │
   └──────────────────────┘         └──────────────────────┘
                                              │
              ┌───────────┬───────────┬───────┴───────┬───────────┐
              │           │           │               │           │
      ┌───────▼───┐ ┌─────▼─────┐ ┌───▼────┐ ┌───────▼───┐ ┌─────▼─────┐
      │ presence  │ │  cursors  │ │comments│ │ progress  │ │user_stats │
      │ (3s poll) │ │ (3s poll) │ │(3s poll│ │ (3s poll) │ │ (3s poll) │
      └───────────┘ └───────────┘ └────────┘ └───────────┘ └───────────┘
```

### State Management (9 Zustand Stores)

| Store | Purpose |
|-------|---------|
| `cursor-store` | Live cursor positions |
| `presence-store` | Active users tracking |
| `comments-store` | Threaded discussions |
| `progress-store` | Review completion status |
| `settings-store` | Notification preferences |
| `shortcuts-store` | Keyboard bindings |
| `focus-state-store` | UI focus management |
| `gamification-store` | Points, badges, streaks |
| `activities-store` | Activity feed events |

## Project Structure

```
code-review-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout + ThemeProvider
│   │   ├── page.tsx                  # Home page
│   │   ├── login/                    # Authentication
│   │   └── repositories/             # Repository & PR pages
│   │       └── [owner]/[repo]/pr/[number]/
│   ├── components/
│   │   ├── ui/                       # Base UI (Avatar, Tooltip, Skeleton)
│   │   ├── activity-feed/            # Real-time activity timeline
│   │   ├── gamification/             # Leaderboard, stats cards
│   │   ├── skeletons/                # Loading state components
│   │   ├── diff-viewer.tsx           # Standard diff renderer
│   │   ├── virtualized-diff-viewer.tsx  # Large diff renderer
│   │   ├── smart-diff-viewer.tsx     # Auto-selecting wrapper
│   │   ├── live-cursor.tsx           # Animated cursor
│   │   ├── cursors-layer.tsx         # Cursor overlay
│   │   ├── comment-*.tsx             # Comment system (5 components)
│   │   ├── presence-*.tsx            # Presence indicators
│   │   ├── suggestion-badge.tsx      # Pattern analysis badges
│   │   ├── file-suggestions-summary.tsx  # Per-file analysis
│   │   ├── file-progress-checkbox.tsx    # Review status toggle
│   │   ├── pr-progress-bar.tsx       # Progress indicator
│   │   ├── settings-dropdown.tsx     # Settings panel
│   │   ├── notification-settings.tsx # Notification prefs
│   │   ├── keyboard-shortcuts-*.tsx  # Shortcut management
│   │   └── theme-toggle.tsx          # Dark mode control
│   └── lib/
│       ├── hooks/                    # Custom React hooks (8+)
│       ├── stores/                   # Zustand stores (9)
│       ├── patterns/                 # Pattern analysis engine
│       │   └── engine.ts             # 14-rule static analyzer
│       ├── utils/                    # Utility functions
│       │   ├── diff-parser.ts        # GitHub diff parsing
│       │   ├── activity-filter.ts    # Feed filtering
│       │   └── scroll-utils.ts       # Virtualization helpers
│       ├── supabase/                 # Database clients & queries
│       └── github/                   # GitHub API client
├── supabase/
│   └── migrations/                   # 9 database migrations
│       ├── 001_create_realtime_schema.sql
│       ├── 002_fix_rls_upsert_policies.sql
│       ├── 003_add_cursor_cleanup_cron.sql
│       ├── 004_create_comments_table_v2.sql
│       ├── 005_create_activities_table.sql
│       ├── 006_add_line_comments_support.sql
│       ├── 007_create_review_progress_table.sql
│       ├── 008_create_user_settings_table.sql
│       └── 009_create_user_stats_table.sql
├── e2e/                              # Playwright E2E tests
└── docs/                             # Additional documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- GitHub account
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/jvaughan007/code-review-dashboard.git
cd code-review-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations (in Supabase SQL Editor)
# Apply migrations 001-009 in order

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

```bash
# Supabase (from project settings)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# GitHub OAuth is configured in Supabase dashboard
# No additional env vars needed
```

## Testing

### Test Suite

```bash
npm test              # Run all tests (275 tests)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E tests
```

### Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| Zustand Stores | 158 | 90%+ |
| React Hooks | 48 | 85%+ |
| Utilities | 43 | 95%+ |
| Components | 26 | 75%+ |
| **Total** | **275** | **82%** |

### Test Philosophy

- **TDD RED-GREEN-REFACTOR**: Tests written before implementation
- **Store-first testing**: Business logic in Zustand stores
- **Minimal mocking**: Real implementations where possible
- **E2E for critical paths**: Auth flows, core user journeys

## Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript strict check
npm test             # Vitest tests
npm run test:e2e     # Playwright E2E
```

## Development Methodology

This project uses **AGILE with TDD**:

1. **Sprint Planning**: Product Owner → Business Analyst → Lead Engineer → QA Lead
2. **TDD RED Phase**: Write failing tests first
3. **TDD GREEN Phase**: Minimal implementation to pass
4. **TDD REFACTOR Phase**: Improve quality, tests stay green
5. **Sprint Review**: Acceptance criteria validation
6. **Sprint Retrospective**: Process improvements

**8 sprints completed** with 120+ story points delivered at 100% velocity.

## Sprint History

| Sprint | Theme | Key Deliverables |
|--------|-------|------------------|
| 1 | Database Foundation | Schema, RLS policies, migrations |
| 2 | Real-time Presence | Live cursors, presence avatars, polling |
| 3 | Commenting System | Threads, optimistic UI, conflict resolution |
| 4 | Line Comments | Line-level feedback, keyboard navigation |
| 5 | Testing & UX | Markdown preview, E2E auth, scroll debounce |
| 6 | Performance | Virtualization, dark mode, mobile, skeletons |
| 7 | Innovation | Pattern engine, progress tracking, settings |
| 8 | Integration | Gamification, activity filtering, migrations |

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Diff Render (500 lines) | <500ms | ~80ms |
| Cursor Sync Latency | <3s | ~2.5s |
| First Contentful Paint | <2s | ~1.2s |
| Test Suite | <30s | ~2.5s |
| Build Time | <2min | ~45s |

## Pattern Analysis Engine

The built-in static analyzer detects 14 patterns across 4 categories:

### Security (4 patterns)
- Hardcoded secrets and API keys
- SQL injection vulnerabilities
- Dangerous `eval()` usage
- Insecure `innerHTML` assignments

### Performance (3 patterns)
- Console.log statements in production
- Missing React dependency arrays
- Expensive operations in render

### TypeScript (4 patterns)
- `any` type usage
- Non-null assertions (`!`)
- Type assertions (`as`)
- Missing return types

### React (3 patterns)
- Array index as key
- Direct state mutation
- Missing error boundaries

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD)
4. Implement the feature
5. Ensure all tests pass (`npm test`)
6. Ensure no TypeScript errors (`npm run type-check`)
7. Commit with conventional commits
8. Push and create a Pull Request

## License

MIT

## Links

- **Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)
- **Issues**: [Report bugs or request features](https://github.com/jvaughan007/code-review-dashboard/issues)

---

**Built with**: Next.js 16 + React 19 + TypeScript + Supabase + Zustand

**Status**: Production Ready | **Tests**: 275 passing | **TypeScript**: Zero errors
