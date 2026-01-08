# Agent Ecosystem Strategy for Code-Review-Dashboard

**Date**: 2026-01-07
**Status**: Execution Plan
**Goal**: Establish comprehensive, high-quality agent ecosystem with mandatory consultation workflow

---

## Executive Summary

This document provides an optimized strategy for:
1. Auditing existing agents against quality standards
2. Generating missing technology-specific specialists
3. Enforcing mandatory SME consultation before implementation
4. Establishing collaborative implementation workflows

**Time Estimate**: 3-4 hours total
**Success Criteria**: 100% tech stack coverage with grounded, expert agents + enforced consultation workflow

---

## Current State Analysis

### Tech Stack (from package.json)

**Frontend Framework & Core:**
- Next.js 16.1.1 (App Router, React Server Components, Server Actions)
- React 19.2.3 (RSC, use() hook, Compiler, Actions)
- TypeScript 5.9.3

**UI & Styling:**
- Tailwind CSS 4.1.18 (v4 major release)
- Radix UI (Avatar, Tooltip)
- Framer Motion 12.24.0
- Lucide React 0.562.0 (icons)
- class-variance-authority, clsx, tailwind-merge (utility libraries)

**State Management:**
- Zustand 5.0.9

**Backend & Database:**
- Supabase (@supabase/supabase-js 2.89.0, @supabase/ssr 0.8.0)
- PostgreSQL (via Supabase)
- Row Level Security (RLS)

**API Integration:**
- GitHub API (Octokit - implied by project description)

**Build & Dev Tools:**
- ESLint 9.39.2
- PostCSS 8.5.6
- Autoprefixer 10.4.23

### Existing Agents Audit

**Engineering Team** (`~/.claude/agents/engineering/`):
- ✅ `engineering-frontend-developer.md` - **EXCELLENT**: React 19, Next.js 15, TypeScript 5.7, modern patterns, official docs
- ✅ `engineering-backend-architect.md` - Needs review for relevance
- ⚠️ `engineering-senior-developer.md` - Needs review (may be too general)
- ❌ Missing: React 19 specialist, Next.js 16 specialist, TypeScript 5.9 specialist

**Backend Team** (`~/.claude/agents/backend/`):
- ❌ `nodejs-hono-specialist.md` - NOT RELEVANT (we use Next.js API routes)
- ❌ `redis-specialist.md` - NOT RELEVANT (we use Supabase)
- ❌ `socketio-specialist.md` - NOT RELEVANT (we use Supabase Realtime)

**Database Team** (`~/.claude/agents/database/`):
- ✅ `supabase-specialist.md` - **EXCELLENT**: Comprehensive Supabase + PostgreSQL expertise, RLS, Realtime

**AI Team** (`~/.claude/agents/ai/`):
- ✅ `prompt-engineer.md` - **EXCELLENT**: OpenAI best practices, Claude 3.7 techniques, prompt caching

**Testing Team** (`~/.claude/agents/testing/`):
- ⚠️ Needs review for relevance to React 19/Next.js 16

**Missing Critical Specialists:**
1. React 19 Specialist (Server Components, use() hook, Compiler, Actions)
2. Next.js 16 Specialist (App Router patterns, Server Actions, Partial Prerendering)
3. TypeScript 5.9 Specialist (Latest type system features)
4. Tailwind CSS 4 Specialist (v4 new features and patterns)
5. Zustand 5 Specialist (State management patterns)
6. Framer Motion Specialist (Animation patterns)
7. GitHub API/Octokit Specialist (PR data fetching)
8. PostgreSQL/SQL Specialist (Complex queries, performance optimization)
9. Radix UI Specialist (Accessible component patterns)

---

## Optimal Execution Strategy

### Phase 1: Quality Audit (30 minutes)

**Objective**: Evaluate existing agents against quality standards

**Audit Criteria**:
- ✅ References official documentation (with URLs)
- ✅ Cites best literature (books, experts)
- ✅ Grounded in latest versions
- ✅ Includes code examples with modern patterns
- ✅ Specifies when to consult other agents
- ❌ No hallucinated patterns or outdated advice

**Agents to Audit**:
1. `engineering-frontend-developer.md` - Already excellent (React 19, Next.js 15 patterns)
2. `engineering-backend-architect.md` - Check relevance to Next.js API routes
3. `engineering-senior-developer.md` - Check if too general vs specific
4. `supabase-specialist.md` - Already excellent
5. `prompt-engineer.md` - Already excellent
6. Testing agents - Check React 19/Next.js 16 relevance

**Deliverable**: `AGENT_AUDIT_REPORT.md` with pass/fail ratings and improvement recommendations

### Phase 2: Generate Missing Specialists (90 minutes)

**Priority Order** (based on project criticality):

**CRITICAL (Tier 1 - Generate First):**
1. **React 19 Specialist** (30 min)
   - Official docs: https://react.dev
   - Book: "Learning React" by Eve Porcello & Alex Banks (O'Reilly, 2023+)
   - Focus: Server Components, use() hook, React Compiler, Actions, useActionState
   - Expert: Dan Abramov (@dan_abramov), React core team

2. **Next.js 16 Specialist** (30 min)
   - Official docs: https://nextjs.org/docs
   - Book: "Next.js in Action" (Manning, latest edition)
   - Focus: App Router, Server Actions, Partial Prerendering (PPR), route handlers
   - Expert: Lee Robinson (@leeerob), Vercel VP of DevRel

3. **GitHub API/Octokit Specialist** (20 min)
   - Official docs: https://docs.github.com/en/rest, https://octokit.github.io/rest.js/
   - Book: "Building Tools with GitHub" by Chris Dawson & Ben Straub
   - Focus: Pull requests API, code review data, rate limiting, webhooks
   - Expert: GitHub API team, Octokit maintainers

**HIGH PRIORITY (Tier 2):**
4. **TypeScript 5.9 Specialist** (20 min)
   - Official docs: https://www.typescriptlang.org/docs/
   - Book: "Programming TypeScript" by Boris Cherny (O'Reilly)
   - Focus: Type inference, generics, strict mode, React type patterns
   - Expert: Anders Hejlsberg (TS creator), Matt Pocock (@mattpocockuk)

5. **Supabase Realtime Specialist** (15 min) - *Specialized from existing Supabase agent*
   - Official docs: https://supabase.com/docs/guides/realtime
   - Focus: Presence tracking, broadcast, PostgreSQL changes, WebSocket optimization
   - Expert: Supabase Realtime team

6. **Tailwind CSS 4 Specialist** (15 min)
   - Official docs: https://tailwindcss.com/docs
   - Book: "Tailwind CSS in Practice" (practical examples)
   - Focus: v4 new features, utility-first patterns, responsive design
   - Expert: Adam Wathan (@adamwathan), Tailwind creator

**NICE TO HAVE (Tier 3):**
7. **Zustand 5 Specialist** (15 min)
8. **Framer Motion Specialist** (15 min)
9. **Radix UI Specialist** (15 min)
10. **PostgreSQL Query Specialist** (15 min) - *Specialized from Supabase agent*

**Template for New Agents**: See "Agent Generation Template" section below

**Deliverable**: 6-10 new agent files in `~/.claude/agents/` organized by team

### Phase 3: Establish Mandatory Consultation Workflow (30 minutes)

**Objective**: Create enforcement mechanism for SME consultation before implementation

**3.1 Update CLAUDE.md** (15 min)

Add new section:

```markdown
## Code-Review-Dashboard Project Rules

### MANDATORY Agent Consultation Policy

When working on the **code-review-dashboard** project, ALL coding tasks MUST follow this workflow:

#### Step 1: Identify Relevant Specialists
Before ANY code implementation, identify which specialist agents are needed:

**Technology Mapping:**
- React components → React 19 Specialist + Frontend Developer
- Next.js routes/layouts → Next.js 16 Specialist + Frontend Developer
- TypeScript types → TypeScript 5.9 Specialist
- Tailwind styling → Tailwind CSS 4 Specialist
- Zustand state → Zustand 5 Specialist
- Animations → Framer Motion Specialist
- Database queries → Supabase Specialist
- GitHub API calls → GitHub API Specialist
- RLS policies → Supabase Specialist
- Realtime features → Supabase Realtime Specialist

#### Step 2: Collaborative Planning Phase
1. **User** creates handoff file: `planning/[feature_name]_plan.md`
2. **Relevant specialists** are consulted to write implementation approach
3. **Specialists collaborate** via workaround pattern (shared planning file)
4. **Decision Council** reviews if complex architectural decision

#### Step 3: Implementation Phase
1. **Specialists implement** their portions (e.g., React specialist writes components)
2. **Each specialist** creates implementation file: `implementation/[feature_name]_[technology].md`
3. **Integration** happens after all specialist portions complete

#### Step 4: Review Phase
1. **Testing agents** review implementation
2. **Specialist agents** cross-review (e.g., TypeScript specialist reviews type safety)
3. **Final integration** and testing

#### Enforcement
- ❌ NEVER implement code directly without specialist consultation
- ❌ NEVER skip planning phase for non-trivial features
- ✅ ALWAYS create handoff files for multi-agent workflows
- ✅ ALWAYS document which specialists were consulted

### Pre-Implementation Checklist

Before writing ANY code for code-review-dashboard, verify:
- [ ] I identified all relevant specialist agents for this task
- [ ] I created a planning handoff file if multi-agent workflow
- [ ] I consulted specialists for their implementation approach
- [ ] I have official documentation references from specialists
- [ ] I know which patterns/best practices apply (from specialists)
```

**3.2 Create Workflow Templates** (10 min)

Create template files:
- `planning_template.md` - Template for collaborative planning
- `implementation_template.md` - Template for specialist implementation
- `consultation_checklist.md` - Checklist for identifying relevant agents

**3.3 Update SESSION_TRACKER.md** (5 min)

Add reminder at top:
```markdown
## ⚠️ MANDATORY: Agent Consultation Policy

Before implementing ANYTHING in code-review-dashboard:
1. Check CLAUDE.md for mandatory consultation workflow
2. Identify relevant specialist agents
3. Create planning handoff file if needed
4. Consult specialists BEFORE coding
```

**Deliverable**: Updated CLAUDE.md, new workflow templates, updated SESSION_TRACKER.md

### Phase 4: Create Agent Coordination Guide (20 minutes)

**Objective**: Document how agents should collaborate on common tasks

**Examples**:

**Task: Implement new React component with Zustand state**
```
Consultation order:
1. React 19 Specialist - Component architecture, Server vs Client Component
2. TypeScript 5.9 Specialist - Type definitions for props and state
3. Zustand 5 Specialist - State management patterns
4. Tailwind CSS 4 Specialist - Styling approach
5. Frontend Developer - Integration and best practices
```

**Task: Add GitHub API endpoint**
```
Consultation order:
1. GitHub API Specialist - API patterns, rate limiting, data structure
2. Next.js 16 Specialist - Server Action vs Route Handler decision
3. TypeScript 5.9 Specialist - Type safety for API responses
4. Supabase Specialist - If caching in database
5. Backend Architect - Security and error handling
```

**Deliverable**: `AGENT_COLLABORATION_PATTERNS.md`

### Phase 5: Test Workflow with Real Example (30 minutes)

**Objective**: Validate the workflow works in practice

**Test Case**: Implement a new feature (e.g., "Add live cursor collaboration")

**Steps**:
1. Create planning file: `planning/live_cursors_plan.md`
2. Consult Supabase Realtime Specialist for presence strategy
3. Consult React 19 Specialist for component design
4. Consult Frontend Developer for integration
5. Document consultation in planning file
6. Implement with specialist guidance
7. Review workflow effectiveness

**Deliverable**: Completed test implementation + workflow refinement notes

---

## Agent Generation Template

Use this template for all new specialist agents:

```markdown
---
name: [Technology] Specialist
description: Expert in [Technology] with focus on [project-specific use cases]
tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch
model: sonnet
version: 1.0.0
updated: 2026-01-07
---

# [Technology] Specialist

You are a **[Technology] Expert**, specializing in [specific domain] for production applications.

## 📚 Official Documentation & Resources

### Official Documentation
- **[Technology]**: [URL]
- **Related Docs**: [URLs]

### Essential Books & Resources
1. **"[Book Title]" by [Author]** ([Publisher], [Year]) - [Key focus]
2. **"[Book Title]" by [Author]** ([Publisher], [Year]) - [Key focus]
3. **[Online Resource]**: [URL]

### Notable Experts
- **[Name]** (@[twitter]) - [Role/Contribution]
- **[Name]** (@[twitter]) - [Role/Contribution]

---

## 🎯 Your Responsibilities in Code-Review-Dashboard

### 1. [Primary Responsibility]
- [Specific task]
- [Specific task]
- [Specific task]

### 2. [Secondary Responsibility]
- [Specific task]
- [Specific task]

### 3. Best Practices You Enforce
- [Best practice with example]
- [Best practice with example]

---

## 🔧 Technical Expertise

### Core Capabilities
**[Technology] Version**: [X.Y.Z]
**Key Features You Master**:
- [Feature 1]: [Description]
- [Feature 2]: [Description]
- [Feature 3]: [Description]

### Code Examples

**[Common Pattern 1]:**
```[language]
// Example with explanation
// Based on official docs: [URL]
[code example]
```

**[Common Pattern 2]:**
```[language]
// Example with explanation
// Based on [Book/Expert]: [Citation]
[code example]
```

**[Common Pitfall to Avoid]:**
```[language]
// ❌ AVOID (Common mistake)
[bad example]

// ✅ CORRECT (Best practice)
[good example]
```

---

## ⚖️ When You Collaborate

### Works With:
- **[Agent 1]**: [When and how you collaborate]
- **[Agent 2]**: [When and how you collaborate]

### Consult Before:
- [Specific scenario requiring consultation]
- [Specific scenario requiring consultation]

### Handoff Files (Workaround Pattern):
- **[filename]**: [What it contains, who reads it]
- **[filename]**: [What it contains, who reads it]

---

## 🗣️ Your Communication Style

- **Grounded in docs**: Always reference official documentation
- **Version-aware**: Specify exact versions (e.g., "In React 19.2, not 18...")
- **Best practice focused**: Cite expert sources for recommendations
- **Collaborative**: Suggest when to consult other specialists

---

## 🚀 Your Development Workflow

1. **Read Requirements**: Review planning files and feature specs
2. **Reference Official Docs**: Check latest patterns for this version
3. **Design Approach**: Create implementation plan grounded in best practices
4. **Consult Peers**: Identify when other specialists needed
5. **Implement**: Write code following official patterns
6. **Document**: Explain decisions and cite sources
7. **Review**: Check against quality standards

---

## 📋 Quality Standards You Enforce

**Code Quality**:
- [ ] Follows official [Technology] patterns
- [ ] Uses latest version features correctly
- [ ] Matches examples from documentation
- [ ] No deprecated patterns

**Documentation**:
- [ ] References official docs with URLs
- [ ] Cites version-specific features
- [ ] Explains "why" not just "what"
- [ ] Links to expert resources

**Collaboration**:
- [ ] Identifies when other specialists needed
- [ ] Creates clear handoff files
- [ ] Documents assumptions
- [ ] Provides review feedback

---

**Instructions Reference**: Your expertise comes from official [Technology] documentation ([URL]) and industry best practices. Always ground recommendations in authoritative sources. When patterns are not in official docs, cite expert blogs, books, or community consensus with attribution.
```

---

## Success Metrics

### Agent Quality Metrics
- ✅ 100% of agents reference official documentation with URLs
- ✅ 100% of agents cite 2-3 authoritative books or expert sources
- ✅ 100% of agents specify exact version numbers
- ✅ 100% of agents include collaboration section
- ✅ 0% deprecated patterns or hallucinated features

### Consultation Workflow Metrics
- ✅ CLAUDE.md includes mandatory consultation policy
- ✅ Pre-implementation checklist exists and is enforced
- ✅ Workflow templates created for planning/implementation
- ✅ SESSION_TRACKER.md references consultation requirement
- ✅ Test case validates workflow effectiveness

### Coverage Metrics
- ✅ All tech stack technologies have specialist agents
- ✅ Specialist mapping documented (tech → agent)
- ✅ Collaboration patterns documented for common tasks
- ✅ No orphaned/irrelevant agents in directories

---

## Execution Timeline

**Total Time**: 3-4 hours

**Phase 1: Audit** (30 min)
- 09:00-09:30 - Audit existing agents against quality criteria

**Phase 2: Generate Specialists** (90 min)
- 09:30-10:00 - React 19 Specialist
- 10:00-10:30 - Next.js 16 Specialist
- 10:30-10:50 - GitHub API Specialist
- 10:50-11:10 - TypeScript 5.9 Specialist
- 11:10-11:25 - Supabase Realtime Specialist
- 11:25-11:40 - Tailwind CSS 4 Specialist
- 11:40-12:00 - (Optional) Tier 3 specialists

**Phase 3: Workflow Enforcement** (30 min)
- 12:00-12:15 - Update CLAUDE.md
- 12:15-12:25 - Create workflow templates
- 12:25-12:30 - Update SESSION_TRACKER.md

**Phase 4: Collaboration Guide** (20 min)
- 12:30-12:50 - Document collaboration patterns

**Phase 5: Test Workflow** (30 min)
- 12:50-13:20 - Real-world test case implementation

---

## Next Steps

### Immediate Actions
1. **Review this strategy** - Confirm approach before execution
2. **Prioritize agents** - Confirm Tier 1 specialists are correct priorities
3. **Validate template** - Ensure agent generation template meets quality standards

### Implementation Questions
- **Q**: Should I generate all Tier 1 agents first, or mix with workflow setup?
  - **Recommendation**: Generate Tier 1 agents first (Phase 2), then workflow (Phase 3)

- **Q**: Should agents live in existing teams or create new `specialists/` team?
  - **Recommendation**:
    - React 19, Next.js 16, TypeScript → `engineering/`
    - GitHub API → `backend/`
    - Tailwind, Framer Motion, Radix UI → `design/`
    - Zustand → `engineering/`
    - Supabase Realtime → `database/`

- **Q**: Who should generate the agents? You (Prompt Engineer) or a dedicated builder agent?
  - **Recommendation**: You (Prompt Engineer) should generate them using the template, as you understand documentation grounding and best practice citation requirements

### Risk Mitigation
- **Risk**: Agents become outdated as tech versions change
  - **Mitigation**: Include version numbers in agent frontmatter, create update checklist

- **Risk**: Consultation workflow is ignored/skipped
  - **Mitigation**: Enforce in SESSION_TRACKER.md, create pre-implementation checklist as blocker

- **Risk**: Too many agents causes decision paralysis
  - **Mitigation**: Create AGENT_COLLABORATION_PATTERNS.md with clear "when to consult" decision tree

---

## Appendix: Technology → Agent Mapping

**Complete mapping for code-review-dashboard:**

| Technology | Specialist Agent | Location | Status |
|------------|-----------------|----------|--------|
| React 19.2.3 | React 19 Specialist | `engineering/` | ❌ TO CREATE |
| Next.js 16.1.1 | Next.js 16 Specialist | `engineering/` | ❌ TO CREATE |
| TypeScript 5.9.3 | TypeScript 5.9 Specialist | `engineering/` | ❌ TO CREATE |
| Tailwind CSS 4.1.18 | Tailwind CSS 4 Specialist | `design/` | ❌ TO CREATE |
| Zustand 5.0.9 | Zustand 5 Specialist | `engineering/` | 🔶 OPTIONAL |
| Framer Motion 12.24 | Framer Motion Specialist | `design/` | 🔶 OPTIONAL |
| Radix UI | Radix UI Specialist | `design/` | 🔶 OPTIONAL |
| Supabase | Supabase Specialist | `database/` | ✅ EXISTS |
| Supabase Realtime | Supabase Realtime Specialist | `database/` | ❌ TO CREATE |
| PostgreSQL | PostgreSQL Specialist | `database/` | 🔶 OPTIONAL |
| GitHub API | GitHub API Specialist | `backend/` | ❌ TO CREATE |
| Frontend (general) | Frontend Developer | `engineering/` | ✅ EXISTS |
| Backend (general) | Backend Architect | `engineering/` | ⚠️ AUDIT |
| Prompting | Prompt Engineer | `ai/` | ✅ EXISTS |

**Legend:**
- ✅ EXISTS - Agent exists and meets quality standards
- ❌ TO CREATE - Critical agent missing
- 🔶 OPTIONAL - Nice to have, lower priority
- ⚠️ AUDIT - Exists but needs quality review

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Owner**: Prompt Engineer Agent
**Status**: Ready for Execution
