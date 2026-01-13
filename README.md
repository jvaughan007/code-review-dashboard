# Code Review Dashboard

> Real-time collaborative code review tool for GitHub pull requests

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/jvaughan007/code-review-dashboard)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-55%20passing-success)](package.json)

**Live Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)

## Overview

Code Review Dashboard enables teams to review GitHub pull requests together in real-time with live cursors, presence indicators, and synchronized comments. Built to solve the pain of asynchronous PR reviews across distributed teams.

## Features

### Real-time Collaboration
- **Live Cursors**: See teammates' cursor positions in real-time with smooth animations
- **Presence Indicators**: Avatar stack showing who's viewing each PR
- **Activity Feed**: Real-time timeline of all collaboration events

### Code Review Tools
- **Syntax-Highlighted Diffs**: Side-by-side diff viewer with color-coded changes
- **Threaded Comments**: Add, reply to, and delete comments with real-time sync
- **GitHub Integration**: OAuth authentication and seamless PR fetching

### Technical Excellence
- **Zero-cost Architecture**: Runs entirely on Supabase free tier
- **Database Polling**: Efficient 2-second polling for real-time updates
- **Type-Safe**: Full TypeScript with strict mode (zero errors)
- **Test Coverage**: 55 passing tests with comprehensive store coverage

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router, Server Components)
- **Language**: TypeScript 5.7.2 (strict mode)
- **UI**: React 19.2.0 + Tailwind CSS 4.1.0
- **State**: Zustand 5.0.2
- **Animations**: Framer Motion 11.16.0
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: GitHub OAuth via Supabase Auth
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel (zero-cost)

## Project Structure

```
code-review-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── repositories/       # Repository & PR pages
│   │   └── auth/               # Authentication routes
│   ├── components/             # React components
│   │   ├── activity-feed/      # Real-time activity timeline
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── diff-viewer.tsx     # Syntax-highlighted diffs
│   │   ├── live-cursor.tsx     # Animated cursor component
│   │   ├── cursors-layer.tsx   # Cursor overlay manager
│   │   ├── comment-*.tsx       # Comment system components
│   │   └── presence-*.tsx      # Presence indicator
│   ├── lib/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   ├── supabase/           # Database queries
│   │   └── utils/              # Utility functions
│   └── test/                   # Test setup and mocks
├── supabase/
│   └── migrations/             # Database migrations
└── docs/                       # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- GitHub account
- Supabase account (free tier)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and GitHub credentials

# Run database migrations
# (Apply migrations in Supabase dashboard)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# GitHub OAuth (configured in Supabase dashboard)
# No additional env vars needed - handled by Supabase Auth
```

## Testing

This project uses Vitest with React Testing Library for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

| File | Statements | Lines | Tests |
|------|------------|-------|-------|
| cursor-store.ts | 100% | 100% | 15 |
| comments-store.ts | 87.93% | 87.27% | 15 |
| presence-store.ts | 76.66% | 73.07% | 13 |
| diff-viewer.tsx | 75% | 73.33% | 12 |
| **Total** | - | - | **55** |

### Test Philosophy

We use a **TDD-influenced approach** focusing on:
- **Zustand stores** (pure functions with business logic)
- **Component rendering** (structure and edge cases)
- **Minimal mocking** (avoid complex Supabase mocks)

See [TESTING.md](./TESTING.md) for detailed test strategy.

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Architecture

### Real-time Sync (Database Polling)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App Router                    │
│                         (TypeScript 5.7.2)                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
        ┌───────────▼──────────┐   ┌─────────▼──────────┐
        │   GitHub API         │   │   Supabase         │
        │   (OAuth + REST)     │   │   (PostgreSQL)     │
        └──────────────────────┘   └────────────────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                ┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
                │   presence     │  │    cursors     │  │  comments   │
                │   (2s poll)    │  │   (2s poll)    │  │  (2s poll)  │
                └────────────────┘  └────────────────┘  └─────────────┘
```

### Key Design Decisions

1. **Database Polling** over WebSockets (Supabase free tier compatibility)
2. **Optimistic Updates** for instant user feedback
3. **Zustand Stores** for client-side state management
4. **Server Components** for initial data fetching
5. **Client Components** for real-time features

## Development Roadmap

### Sprint 1 (Complete)
- [x] Next.js 16 + TypeScript setup
- [x] Supabase + GitHub OAuth integration
- [x] Repository and PR listing pages
- [x] Real-time presence tracking
- [x] Live cursor synchronization

### Sprint 2 (Complete)
- [x] Syntax-highlighted diff viewer (diff2html)
- [x] Threaded comment system
- [x] Activity feed with real-time updates
- [x] Test infrastructure (55 tests)
- [x] Store testing (presence, cursor, comments)

### Future Enhancements
- [ ] Line-specific comments on diffs
- [ ] Markdown preview in comments
- [ ] Keyboard shortcuts
- [ ] Mobile responsive improvements
- [ ] E2E tests with Playwright

## Performance

| Metric | Target | Current |
|--------|--------|---------|
| Diff Render (500 lines) | <500ms | ~120ms |
| Comment Sync Latency | <2s | ~2s |
| Build Time | <2min | ~15s |
| Test Suite | <30s | ~1s |

## License

MIT

## Links

- **GitHub Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)
- **Test Strategy**: [TESTING.md](./TESTING.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Status**: MVP Complete
**Last Updated**: 2026-01-13
