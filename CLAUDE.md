# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository Purpose

This is a **real-time code review collaboration dashboard** built with Next.js 16, React 19, and Supabase. It enables developers to review GitHub pull requests collaboratively with real-time presence tracking, live cursors, and synchronized commenting.

**Key Constraints**:
- Zero-cost requirement (Supabase free tier)
- Database polling architecture (not WebSockets/Realtime subscriptions)
- Zero TypeScript errors maintained at all times
- Production-quality code with no hallucinations

---

## 🚨 MANDATORY AGENT CONSULTATION POLICY

**CRITICAL**: You are **FORBIDDEN** from writing implementation code directly without consulting specialist agents first.

### Enforcement Rules

❌ **FORBIDDEN**:
- Writing components, hooks, or functions without Frontend Developer consultation
- Modifying database schemas/migrations without Backend Architect consultation
- Creating API integrations without GitHub API Specialist consultation
- Making caching decisions without Next.js 16 Specialist consultation
- Any code implementation without specialist approval

✅ **REQUIRED**:
- **Prompt Engineer optimization** for ALL complex requests (first step always)
- **Specialist consultation** for ALL code changes
- **Decision Council** for conflicts, high-risk decisions, or architectural choices
- **Validation** after implementation (TypeScript compilation, build success)

### Why This Policy Exists

**Evidence from SESSION_TRACKER.md**:
- **Session #6**: Cursor fading bug and anonymous username bug occurred because code was written directly without consulting specialists
- **Session #4**: RLS policy errors occurred because Backend Architect wasn't consulted
- **Pattern**: Every bug in this project traces back to bypassing specialist consultation

**Root Cause**: Behavioral, not capability. We HAVE specialists—we must USE them.

---

## Tech Stack

### Frontend
- **Next.js**: 16.1.1 (App Router, Server Components, Cache Components)
- **React**: 19.2.0 (Server Components, useActionState, View Transitions)
- **TypeScript**: 5.7.2 (strict mode enabled)
- **Tailwind CSS**: 4.1.0 (utility-first styling)
- **shadcn/ui**: Radix UI components
- **Framer Motion**: 11.16.0 (animations, AnimatePresence)

### State Management
- **Zustand**: 5.0.2 (presence store, cursor store)

### Backend
- **Supabase**: PostgreSQL 16, Row Level Security (RLS), Database Functions
- **GitHub API**: REST API v3 via @octokit/rest
- **Authentication**: GitHub OAuth + Supabase Auth

### Build Tools
- **Turbopack**: Stable (default bundler in Next.js 16)
- **React Compiler**: Stable (automatic memoization)
- **ESLint**: 9 (linting)

### Deployment
- **Vercel**: (planned) Next.js 16 optimized

---

## Required Specialist Agents

### Core Team (Always Consult)

#### 1. Prompt Engineer
**Location**: `~/.claude/agents/ai/prompt-engineer.md`

**When to Consult**: FIRST STEP for ALL complex requests

**Responsibilities**:
- Optimize user requests into structured prompts
- Identify which specialists to consult
- Design consultation workflows (sequential vs parallel)
- Create prompt templates for common tasks

**Example Consultation**:
> User: "Fix the cursor fading bug"
>
> → Consult Prompt Engineer first
>
> → Prompt Engineer recommends: Frontend Developer + React 19 Specialist (parallel consultation)

#### 2. Frontend Developer
**Location**: `~/.claude/agents/engineering/engineering-frontend-developer.md`

**When to Consult**:
- Creating/modifying React components (Client or Server)
- Implementing hooks (useState, useEffect, custom hooks)
- State management changes (Zustand stores)
- Animation implementation (Framer Motion)
- UI/UX component integration (shadcn/ui)

**Example Consultation**:
> Task: "Create LiveCursor component with lerp animation"
>
> → Consult Frontend Developer
>
> → Output: Production-ready component with requestAnimationFrame, React.memo, proper TypeScript types

#### 3. Next.js 16 Specialist
**Location**: `~/.claude/agents/engineering/nextjs-16-specialist.md`

**When to Consult**:
- App Router architecture decisions
- Server Components vs Client Components
- Data fetching patterns (async Server Components, fetch with revalidation)
- Caching strategies (`"use cache"`, revalidateTag, updateTag, refresh)
- Server Actions (form handling, mutations)
- Routing and navigation (Link, useRouter, prefetching)
- Migration issues (Next.js 15 → 16)

**Example Consultation**:
> Task: "Should we cache PR data with 'use cache' or use revalidateTag?"
>
> → Consult Next.js 16 Specialist
>
> → Output: Decision matrix comparing caching strategies with trade-offs

#### 4. Backend Architect
**Location**: `~/.claude/agents/engineering/engineering-backend-architect.md`

**When to Consult**:
- API architecture decisions
- Database schema design
- Server-side logic patterns
- Performance optimization
- Caching layer design
- Integration patterns (GitHub API + Supabase)

**Example Consultation**:
> Task: "Design polling architecture for presence system"
>
> → Consult Backend Architect
>
> → Output: Polling interval recommendations, quota calculations, cleanup strategies

#### 5. GitHub API Specialist
**Location**: `~/.claude/agents/backend/github-api-specialist.md`

**When to Consult**:
- Fetching PR data (pull requests, files, comments, reviews)
- GitHub API rate limiting strategies
- OAuth integration and token management
- Webhook setup for real-time updates
- Octokit.js configuration

**Example Consultation**:
> Task: "Fetch all changed files in a pull request"
>
> → Consult GitHub API Specialist
>
> → Output: octokit.rest.pulls.listFiles() implementation with pagination, rate limit handling

#### 6. Supabase Database Specialist
**Location**: `~/.claude/agents/database/supabase-specialist.md`

**When to Consult**:
- Database migrations (creating tables, indexes, functions)
- Row Level Security (RLS) policies
- Database functions and triggers
- Query optimization
- Connection pooling strategies
- Auth integration (GitHub OAuth → Supabase)

**Example Consultation**:
> Task: "Create RLS policies for cursors table"
>
> → Consult Supabase Specialist
>
> → Output: RLS policies compatible with UPSERT operations, security hardening

### Specialist Team (As Needed)

#### TypeScript 5.9 Specialist
**Location**: `~/.claude/agents/engineering/typescript-59-specialist.md` (to be created if needed)

**When to Consult**:
- Complex type definitions
- Generic types and constraints
- TypeScript 5.9 specific features
- Strict mode configuration
- Type errors resolution

#### Security Engineer
**Location**: `~/.claude/agents/security/security-engineer.md`

**When to Consult**:
- Authentication/authorization implementation
- Token storage (GitHub tokens, Supabase tokens)
- RLS policy security review
- XSS/CSRF prevention
- API security patterns

#### DevOps Automator
**Location**: `~/.claude/agents/engineering/engineering-devops-automator.md`

**When to Consult**:
- Vercel deployment configuration
- CI/CD pipeline setup
- Environment variable management
- Build optimization
- Production monitoring

### Decision Support

#### Decision Council
**Location**: `~/.claude/agents/decision-council/`

**Members**:
- Context Researcher
- Risk Manager
- Critical Analyst
- Innovation Strategist
- Council Facilitator

**When to Consult**:
- Conflicts between specialist recommendations
- High-risk architectural decisions
- Trade-off analysis (multiple valid approaches)
- GO/NO-GO decisions
- Strategic planning

**Example Consultation**:
> Situation: Backend Architect recommends Redis caching, but zero-cost requirement forbids it
>
> → Consult Decision Council
>
> → Output: Weighted decision matrix comparing alternatives, risk assessment, recommendation

---

## MANDATORY Consultation Workflows

### Workflow 1: Feature Implementation

```
User Request: "Implement [feature]"
    ↓
Step 1: Consult Prompt Engineer
    ↓ (Prompt Engineer optimizes request)
Step 2: Consult Relevant Specialists (parallel if independent)
    ├─→ Frontend Developer (if UI component)
    ├─→ Backend Architect (if database/API)
    ├─→ Next.js 16 Specialist (if routing/caching)
    └─→ GitHub API Specialist (if PR data)
    ↓ (Specialists provide implementation plans)
Step 3: Specialists Collaborate (if needed)
    ↓ (Agree on interfaces, data contracts)
Step 4: Implementation by Specialists
    ↓ (Specialists write code)
Step 5: Validation
    ├─→ TypeScript compilation (npx tsc --noEmit)
    ├─→ Build success (npm run build)
    └─→ Manual testing
    ↓
Step 6: Commit with Documentation
    └─→ Update SESSION_TRACKER.md with specialist consultations
```

### Workflow 2: Bug Fix

```
User Reports Bug
    ↓
Step 1: Consult Prompt Engineer
    ↓ (Identify root cause category)
Step 2: Consult Relevant Specialist
    ├─→ Frontend Developer (if UI bug)
    ├─→ Backend Architect (if database/API bug)
    └─→ Next.js 16 Specialist (if caching/routing bug)
    ↓ (Specialist diagnoses bug)
Step 3: Specialist Provides Fix
    ↓ (Specialist writes corrected code)
Step 4: Validation
    ├─→ TypeScript compilation
    ├─→ Build success
    └─→ Bug reproduction test
    ↓
Step 5: Commit with Root Cause Analysis
    └─→ Document why bug occurred, which specialist fixed it
```

### Workflow 3: Architectural Decision

```
Architectural Question: "Should we use [approach A] or [approach B]?"
    ↓
Step 1: Consult Prompt Engineer
    ↓ (Structure decision criteria)
Step 2: Consult Relevant Specialists (parallel)
    ├─→ Frontend Developer (frontend impact)
    ├─→ Backend Architect (backend impact)
    └─→ [Domain Specialist] (domain-specific impact)
    ↓ (Specialists provide pros/cons for each approach)
Step 3: Consult Decision Council
    ↓ (Synthesize recommendations, create decision matrix)
Step 4: User Approves Decision
    ↓
Step 5: Implementation by Specialists
    └─→ Document decision in SESSION_TRACKER.md (Decision #X pattern)
```

---

## Pre-Implementation Checklist

Before writing ANY implementation code, verify:

- [ ] Consulted Prompt Engineer to optimize request
- [ ] Identified all relevant specialists
- [ ] Consulted specialists (documented which ones)
- [ ] Specialists provided implementation plan
- [ ] Interfaces/contracts agreed upon (if multi-specialist)
- [ ] No direct code writing without specialist approval

**If ANY checkbox is unchecked, STOP and complete consultation first.**

---

## Consultation Log (SESSION_TRACKER.md)

Every specialist consultation MUST be logged in SESSION_TRACKER.md:

```markdown
### Session #X: [Feature Name]

#### Specialist Consultations
1. **Prompt Engineer** (Duration: 5 min)
   - Request: Optimize Week 2 Day 3 cursor implementation strategy
   - Output: 3 options with recommendations (Option A: Consult specialists first)

2. **Frontend Developer** (Duration: 30 min, Parallel with Backend Architect)
   - Request: Implement LiveCursor component with lerp animation
   - Output: LiveCursor.tsx, CursorsLayer.tsx, PRDetailClient.tsx
   - Quality: Zero TypeScript errors, 60fps animation

3. **Backend Architect** (Duration: 20 min, Parallel with Frontend Developer)
   - Request: Validate polling strategy and quota calculations
   - Output: 63% free tier quota at 10 users, 2-second polling optimal
```

---

## Agent Team Directory

```
~/.claude/agents/
├── ai/
│   └── prompt-engineer.md                    ✅ CRITICAL (always consult first)
├── engineering/
│   ├── engineering-frontend-developer.md     ✅ CORE
│   ├── engineering-backend-architect.md      ✅ CORE
│   ├── nextjs-16-specialist.md               ✅ NEW (created 2026-01-07)
│   ├── typescript-59-specialist.md           ⏳ CREATE IF NEEDED
│   └── engineering-devops-automator.md
├── backend/
│   ├── github-api-specialist.md              ✅ NEW (created 2026-01-07)
│   └── [other backend specialists]
├── database/
│   └── supabase-specialist.md                ✅ CORE
├── security/
│   └── security-engineer.md
├── decision-council/
│   ├── context-researcher.md                 ✅ DECISION SUPPORT
│   ├── risk-manager.md                       ✅ DECISION SUPPORT
│   ├── critical-analyst.md                   ✅ DECISION SUPPORT
│   ├── innovation-strategist.md              ✅ DECISION SUPPORT
│   └── council-facilitator.md                ✅ DECISION SUPPORT
```

---

## Common Consultation Patterns

### Pattern 1: UI Component Creation

**Specialists**:
- Frontend Developer (primary)
- Next.js 16 Specialist (if Server Component)
- TypeScript Specialist (if complex types)

**Example**: LiveCursor component
```
Prompt Engineer → Frontend Developer (primary)
    ├─→ Implements component with requestAnimationFrame
    ├─→ Uses Framer Motion for enter/exit
    ├─→ Applies React.memo optimization
    └─→ Zero TypeScript errors
```

### Pattern 2: Database Schema Change

**Specialists**:
- Backend Architect (primary)
- Supabase Specialist (RLS policies)
- Security Engineer (security review)

**Example**: Add cursors table
```
Prompt Engineer → Backend Architect + Supabase Specialist (parallel)
    ├─→ Backend Architect designs schema
    ├─→ Supabase Specialist creates RLS policies
    └─→ Security Engineer reviews (if sensitive data)
```

### Pattern 3: GitHub API Integration

**Specialists**:
- GitHub API Specialist (primary)
- Backend Architect (integration pattern)
- Next.js 16 Specialist (Server Component data fetching)

**Example**: Fetch PR files
```
Prompt Engineer → GitHub API Specialist (primary)
    ├─→ Provides octokit.rest.pulls.listFiles() implementation
    ├─→ Rate limiting strategy (conditional requests)
    └─→ Backend Architect reviews caching layer
```

### Pattern 4: Caching Decision

**Specialists**:
- Next.js 16 Specialist (primary)
- Backend Architect (cache architecture)
- Decision Council (if trade-offs unclear)

**Example**: Should we use 'use cache' or revalidateTag?
```
Prompt Engineer → Next.js 16 Specialist (primary)
    ├─→ Compares 'use cache' vs revalidateTag
    ├─→ Provides decision matrix with trade-offs
    └─→ Decision Council (if user needs help deciding)
```

---

## Anti-Patterns (FORBIDDEN)

### ❌ ANTI-PATTERN 1: Direct Code Implementation

```
# BAD
User: "Fix the cursor fading bug"
Me: *Directly edits use-cursors.ts without consulting Frontend Developer*

# GOOD
User: "Fix the cursor fading bug"
Me: *Consults Prompt Engineer → Frontend Developer → Implements fix*
```

**Why Forbidden**: Session #6 proved direct implementation creates bugs (cursor fading, anonymous username)

### ❌ ANTI-PATTERN 2: Skipping Prompt Engineer

```
# BAD
User: "Implement live cursors"
Me: *Directly consults Frontend Developer without Prompt Engineer optimization*

# GOOD
User: "Implement live cursors"
Me: *Consults Prompt Engineer first → Gets 3 options → User chooses Option A → Consults specialists*
```

**Why Forbidden**: Prompt Engineer optimizes complex requests, identifies best consultation strategy

### ❌ ANTI-PATTERN 3: Single Specialist for Multi-Domain Task

```
# BAD
Task: "Add cursor position tracking to database"
Me: *Only consults Frontend Developer (ignores database aspect)*

# GOOD
Task: "Add cursor position tracking to database"
Me: *Consults Frontend Developer + Supabase Specialist (parallel)*
```

**Why Forbidden**: Multi-domain tasks require multiple specialists to ensure proper integration

### ❌ ANTI-PATTERN 4: Ignoring Specialist Recommendations

```
# BAD
Frontend Developer: "Use React.memo with custom comparison"
Me: *Implements without React.memo because "it's optional"*

# GOOD
Frontend Developer: "Use React.memo with custom comparison"
Me: *Implements exactly as recommended, including React.memo*
```

**Why Forbidden**: Specialists are grounded in official docs, ignoring them leads to suboptimal code

### ❌ ANTI-PATTERN 5: No Consultation Log

```
# BAD
*Implements feature, commits without documenting specialist consultations*

# GOOD
*Implements feature, updates SESSION_TRACKER.md with:*
- Which specialists consulted
- What they recommended
- Implementation outcome
```

**Why Forbidden**: Consultation log enables learning, prevents repeated mistakes

---

## Success Criteria

### Code Quality
- ✅ Zero TypeScript errors (maintained at all times)
- ✅ Build succeeds (npm run build)
- ✅ All code written by specialists (not directly)
- ✅ No hallucinated dependencies or APIs
- ✅ Follows official documentation patterns

### Consultation Quality
- ✅ Prompt Engineer consulted first (all complex requests)
- ✅ Relevant specialists identified correctly
- ✅ All specialists consulted (none skipped)
- ✅ Consultation logged in SESSION_TRACKER.md
- ✅ Specialist recommendations followed

### Process Quality
- ✅ Pre-implementation checklist completed
- ✅ Validation performed (TypeScript, build, testing)
- ✅ Decision Council consulted for conflicts/high-risk decisions
- ✅ Root cause analysis for bugs (which specialist should have been consulted?)

---

## Best Practices

### 1. Always Start with Prompt Engineer

**Even if request seems simple**, consult Prompt Engineer first. They optimize requests and identify hidden complexity.

### 2. Parallel Consultation When Independent

If specialists don't need to coordinate, consult them in parallel to save time:

```
Prompt Engineer recommends:
├─→ Frontend Developer (parallel)
└─→ Backend Architect (parallel)
(Both work independently, then integrate)
```

### 3. Sequential Consultation When Dependent

If specialists need each other's output, consult sequentially:

```
Prompt Engineer recommends:
    ↓
Backend Architect (designs API contract)
    ↓ (API contract defined)
Frontend Developer (implements UI using contract)
```

### 4. Document Everything

Every specialist consultation goes in SESSION_TRACKER.md with:
- Specialist name
- Duration
- Request
- Output/recommendations
- Quality outcome

### 5. Validate After Implementation

Before marking task complete:
- Run `npx tsc --noEmit` (zero errors required)
- Run `npm run build` (must succeed)
- Test manually (if applicable)

### 6. Learn from Bugs

When bugs occur, ask:
- Which specialist should have been consulted?
- Was consultation skipped?
- Were specialist recommendations ignored?
- Document in SESSION_TRACKER.md as lesson learned

---

## Troubleshooting

### Issue: "I'm not sure which specialist to consult"

**Solution**: Always consult Prompt Engineer first. They'll identify the right specialists.

### Issue: "Specialist recommendations conflict"

**Solution**: Consult Decision Council. They'll synthesize recommendations and provide decision matrix.

### Issue: "Specialist doesn't exist for my tech"

**Solution**: Use Specialist Generator (see recommendations/ directory) to create new specialist in 10-15 minutes.

### Issue: "Bug occurred despite following process"

**Solution**:
1. Review consultation log in SESSION_TRACKER.md
2. Identify which specialist was consulted
3. Check if specialist recommendation was followed correctly
4. If specialist gave bad advice, update specialist file with correct pattern

---

## Reference Documentation

### Internal Documentation
- **SESSION_TRACKER.md** - Session history, specialist consultations, critical decisions
- **WEEK2_PLAN.md** - Week 2 implementation roadmap
- **ARCHITECTURE.md** - Polling architecture, zero-cost constraints
- **recommendations/** - Specialist consultation outputs
- **decisions/** - Decision Council outputs

### External Documentation
- **Next.js 16**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **Supabase**: https://supabase.com/docs
- **GitHub REST API**: https://docs.github.com/en/rest
- **Octokit.js**: https://github.com/octokit/octokit.js/

### Specialist Generator
- **SPECIALIST_GENERATOR_README.md** - Overview and usage
- **SPECIALIST_GENERATOR_TEMPLATE.md** - Prompt template
- **SPECIALIST_GENERATOR_USAGE_GUIDE.md** - Step-by-step guide

---

## Important Notes

- **This is a production codebase** - zero-cost requirement, real users (eventually)
- **Quality over speed** - consultation takes time but prevents bugs
- **Specialists exist to be used** - not consulting them is the root cause of all bugs
- **Document everything** - SESSION_TRACKER.md is the source of truth for consultations
- **Learn from mistakes** - every bug teaches which specialist should have been consulted

---

**Last Updated**: 2026-01-07 (Session #6)
**Maintained By**: Claude Code (Sonnet 4.5) + User collaboration
**Enforcement**: MANDATORY - violations result in bugs (proven in Sessions #4-6)
