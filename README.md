# Code Review Dashboard

> Real-time collaborative code review tool for GitHub pull requests

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/jvaughan007/code-review-dashboard)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)

**Live Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)

## 🎯 Overview

Code Review Dashboard enables teams to review GitHub pull requests together in real-time with live cursors, presence indicators, and synchronized comments. Built to solve the pain of asynchronous PR reviews across distributed teams.

## ✨ Features (Planned)

- **Real-time Collaboration**: See teammates' cursors and review PRs together
- **GitHub Integration**: OAuth authentication and seamless PR fetching
- **Live Updates**: WebSocket-powered real-time updates
- **Performance Optimized**: Built with Next.js 15 Server Components
- **Type-Safe**: Full TypeScript with strict mode
- **Beautiful UI**: Tailwind CSS 4 + shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: GitHub OAuth via Supabase Auth
- **Deployment**: Vercel (zero-cost)

## 📦 Project Structure

```
code-review-dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utilities and helpers
├── public/              # Static assets
└── portfolio-planning/  # Project planning docs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- Supabase account (free tier)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📊 Performance Benchmarks (Target)

- **Page Load**: <2s for 1000-line diff
- **Cursor Latency**: <100ms for real-time updates
- **Concurrent Users**: 100+ without degradation
- **Lighthouse Score**: 95+

## 🗺️ Development Roadmap

### Week 1 ✅ COMPLETE
- [x] Next.js 15 + TypeScript setup
- [x] Tailwind CSS 4 configuration
- [x] shadcn/ui integration
- [x] Supabase client setup
- [x] GitHub OAuth integration
- [x] Login/logout flow with Server Actions
- [x] Auth middleware for protected routes
- [x] GitHub API client for repositories and PRs
- [x] Repositories listing page
- [x] Pull requests listing page
- [x] PR detail page with file diffs
- [x] Navigation and UI layout
- [x] TypeScript strict mode - zero errors

### Week 2
- [ ] PR fetching from GitHub API
- [ ] Diff rendering
- [ ] Real-time collaboration layer

### Week 3
- [ ] Comments system
- [ ] Optimistic UI updates
- [ ] Live cursors & presence

### Week 4
- [ ] Performance optimization
- [ ] Load testing
- [ ] Documentation
- [ ] Deployment

## 📝 License

MIT

## 🔗 Links

- **GitHub Repository**: [github.com/jvaughan007/code-review-dashboard](https://github.com/jvaughan007/code-review-dashboard)
- **Portfolio Planning**: `../portfolio-planning/`
- **Architecture Docs**: Coming soon
- **Live Demo**: Coming soon (deploy to Vercel in Week 2)

---

**Status**: 🚧 In Development (Week 1)
**Last Updated**: 2026-01-05
