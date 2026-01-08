# Optimized Prompts for Agent Ecosystem Establishment

**Purpose**: Ready-to-use prompts for executing the Agent Ecosystem Strategy
**Date**: 2026-01-07
**Status**: Execution-Ready

---

## Phase 1: Agent Quality Audit

### Prompt 1A: Audit Existing Frontend Developer Agent

```
I need you to audit the existing Frontend Developer agent against our quality standards.

**Agent Location**: ~/.claude/agents/engineering/engineering-frontend-developer.md

**Quality Criteria**:
1. ✅ References official documentation with URLs
2. ✅ Cites best literature (books, experts with attribution)
3. ✅ Grounded in latest versions (React 19, Next.js 15+)
4. ✅ No deprecated patterns or hallucinated features
5. ✅ Includes code examples matching official docs
6. ✅ Specifies when to consult other agents

**Deliverable**: Create audit report file:
- Filename: audit_reports/frontend_developer_audit.md
- Format:
  - Overall Score: PASS / NEEDS IMPROVEMENT / FAIL
  - Criteria Checklist (✅ / ⚠️ / ❌ for each)
  - Strengths (what it does well)
  - Gaps (what's missing or outdated)
  - Recommendations (specific improvements)
  - Action Items (if any)

Read the agent file and provide detailed audit report.
```

### Prompt 1B: Audit Backend and Database Agents

```
Audit the following agents for the code-review-dashboard project:

**Agents to Audit**:
1. ~/.claude/agents/engineering/engineering-backend-architect.md
2. ~/.claude/agents/database/supabase-specialist.md
3. ~/.claude/agents/backend/nodejs-hono-specialist.md (check if RELEVANT - we use Next.js API routes)
4. ~/.claude/agents/backend/redis-specialist.md (check if RELEVANT - we use Supabase)
5. ~/.claude/agents/backend/socketio-specialist.md (check if RELEVANT - we use Supabase Realtime)

**Context**: code-review-dashboard tech stack:
- Next.js 16.1.1 (API routes via route handlers)
- Supabase (database, auth, realtime)
- No Redis, no Socket.io, no Hono

**Quality Criteria**:
1. Relevance to our stack
2. Official documentation references
3. Latest version patterns
4. Collaboration guidance

**Deliverable**: Create audit_reports/backend_database_audit.md with:
- Each agent: RELEVANT / NOT RELEVANT
- Quality scores for relevant agents
- Recommendations for irrelevant agents (archive, delete, or repurpose)
```

---

## Phase 2: Generate Missing Specialist Agents

### Prompt 2A: Generate React 19 Specialist

```
Generate a new specialist agent for React 19 using the Agent Generation Template.

**Specialist**: React 19 Expert
**Focus**: Server Components, use() hook, React Compiler, Actions, useActionState
**Primary Use Case**: code-review-dashboard (Next.js 16 + React 19 project)

**Requirements**:
1. **Official Documentation**: https://react.dev
   - Reference Server Components docs
   - Reference use() hook docs
   - Reference React Compiler docs
   - Reference Actions/useActionState docs

2. **Books & Resources**:
   - "Learning React" by Eve Porcello & Alex Banks (O'Reilly)
   - React.dev official guides
   - Dan Abramov's blog posts on Server Components

3. **Experts**:
   - Dan Abramov (@dan_abramov) - React core team
   - Andrew Clark (@acdlite) - React core team
   - Sebastian Markbåge (@sebmarkbage) - React creator

4. **Code Examples**: Include patterns for:
   - Server Component vs Client Component decision
   - Async Server Components with data fetching
   - use() hook for unwrapping promises
   - Server Actions with useActionState
   - React Compiler optimization (automatic memo)

5. **Collaboration**:
   - Works with: Next.js 16 Specialist, TypeScript Specialist, Frontend Developer
   - Consult before: Component architecture decisions, state management choices

**Deliverable**: Create file ~/.claude/agents/engineering/react-19-specialist.md

Use the Agent Generation Template from AGENT_ECOSYSTEM_STRATEGY.md as the structure.
Ground ALL recommendations in official React 19 documentation.
Include version-specific callouts (e.g., "In React 19, not 18...").
```

### Prompt 2B: Generate Next.js 16 Specialist

```
Generate a new specialist agent for Next.js 16 using the Agent Generation Template.

**Specialist**: Next.js 16 Expert
**Focus**: App Router, Server Actions, Partial Prerendering (PPR), Route Handlers, Metadata API
**Primary Use Case**: code-review-dashboard

**Requirements**:
1. **Official Documentation**: https://nextjs.org/docs
   - App Router file conventions
   - Server Actions guide
   - Partial Prerendering (PPR) experimental
   - Route Handlers (app/api)
   - Metadata API for SEO

2. **Books & Resources**:
   - "Next.js in Action" (Manning)
   - Next.js official examples: https://github.com/vercel/next.js/tree/canary/examples
   - Vercel deployment best practices

3. **Experts**:
   - Lee Robinson (@leeerob) - Vercel VP of DevRel
   - Tim Neutkens (@timneutkens) - Next.js lead
   - Sebastian Markbåge (@sebmarkbage) - React/Next.js

4. **Code Examples**: Include patterns for:
   - File-based routing structure (layout.tsx, page.tsx, loading.tsx, error.tsx)
   - Server Actions for form handling
   - Route Handlers for API endpoints
   - Partial Prerendering (static + dynamic content)
   - Metadata API for SEO (generateMetadata)
   - revalidatePath and revalidateTag for cache invalidation

5. **Collaboration**:
   - Works with: React 19 Specialist, TypeScript Specialist, Supabase Specialist
   - Consult before: Route architecture, data fetching strategy, caching decisions

**Deliverable**: Create file ~/.claude/agents/engineering/nextjs-16-specialist.md

Key distinction: Next.js 16 builds on React 19 Server Components. This agent focuses on Next.js-specific patterns (routing, caching, deployment), while React 19 Specialist focuses on component patterns.
```

### Prompt 2C: Generate GitHub API/Octokit Specialist

```
Generate a new specialist agent for GitHub API/Octokit using the Agent Generation Template.

**Specialist**: GitHub API Expert
**Focus**: Pull Requests API, Code Review data, Rate Limiting, Webhooks, Octokit REST client
**Primary Use Case**: code-review-dashboard (fetch PR data, comments, reviews, commits)

**Requirements**:
1. **Official Documentation**:
   - GitHub REST API: https://docs.github.com/en/rest
   - Octokit.js: https://octokit.github.io/rest.js/
   - GitHub Webhooks: https://docs.github.com/en/webhooks
   - Rate Limiting: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting

2. **Books & Resources**:
   - "Building Tools with GitHub" by Chris Dawson & Ben Straub
   - GitHub API changelog and migration guides
   - Octokit plugins ecosystem

3. **Experts**:
   - GitHub API team (@github)
   - Octokit maintainers (@octokit)

4. **Code Examples**: Include patterns for:
   - Fetching PR data (pulls.get, pulls.listFiles)
   - Fetching code reviews and comments (pulls.listReviews, pulls.listReviewComments)
   - Pagination for large datasets
   - Rate limiting handling (check headers, exponential backoff)
   - Webhooks setup for real-time PR updates
   - Authentication (Personal Access Token, GitHub App)
   - TypeScript types from @octokit/types

5. **Collaboration**:
   - Works with: Next.js Specialist (Route Handlers), TypeScript Specialist (API types), Supabase Specialist (caching PR data)
   - Consult before: API architecture, caching strategy, webhook vs polling decision

**Deliverable**: Create file ~/.claude/agents/backend/github-api-specialist.md

Focus on production patterns: rate limiting, error handling, pagination, caching strategies.
```

### Prompt 2D: Generate TypeScript 5.9 Specialist

```
Generate a new specialist agent for TypeScript 5.9 using the Agent Generation Template.

**Specialist**: TypeScript 5.9 Expert
**Focus**: Type inference, Generics, Strict mode, React 19 type patterns, Utility types
**Primary Use Case**: code-review-dashboard (type-safe React components, API responses, Supabase queries)

**Requirements**:
1. **Official Documentation**: https://www.typescriptlang.org/docs/
   - Handbook (basics)
   - Advanced Types
   - TypeScript 5.9 release notes
   - React type patterns

2. **Books & Resources**:
   - "Programming TypeScript" by Boris Cherny (O'Reilly)
   - "Effective TypeScript" by Dan Vanderkam (O'Reilly)
   - Matt Pocock's Total TypeScript resources

3. **Experts**:
   - Anders Hejlsberg (@ahejlsberg) - TypeScript creator
   - Matt Pocock (@mattpocockuk) - TypeScript educator
   - Dan Vanderkam (@danvdk) - Effective TypeScript author

4. **Code Examples**: Include patterns for:
   - React component props typing (with generics)
   - Server Component async return types
   - API response type inference
   - Supabase query type safety (Database type generation)
   - Utility types (Pick, Omit, Partial, Required)
   - Discriminated unions for state management
   - Type guards and narrowing
   - const assertions and as const

5. **Collaboration**:
   - Works with: React Specialist (component types), Next.js Specialist (server action types), Supabase Specialist (database types), GitHub API Specialist (API response types)
   - Consult before: Complex type definitions, generic utilities, API contract design

**Deliverable**: Create file ~/.claude/agents/engineering/typescript-59-specialist.md

Emphasize practical patterns for React 19 + Next.js 16 + Supabase stack.
Include strict mode recommendations and type safety best practices.
```

### Prompt 2E: Generate Supabase Realtime Specialist

```
Generate a new specialist agent for Supabase Realtime using the Agent Generation Template.

**Specialist**: Supabase Realtime Expert
**Focus**: Presence (live cursors), Broadcast (ephemeral events), PostgreSQL Changes, WebSocket optimization
**Primary Use Case**: code-review-dashboard (live cursor tracking, real-time PR updates)

**Requirements**:
1. **Official Documentation**:
   - Supabase Realtime: https://supabase.com/docs/guides/realtime
   - Realtime Presence: https://supabase.com/docs/guides/realtime/presence
   - Realtime Broadcast: https://supabase.com/docs/guides/realtime/broadcast
   - PostgreSQL Changes: https://supabase.com/docs/guides/realtime/postgres-changes

2. **Books & Resources**:
   - Supabase official guides
   - WebSocket optimization patterns
   - PostgreSQL logical replication docs

3. **Experts**:
   - Supabase Realtime team
   - Paul Copplestone (@kiwicopple) - Supabase CEO

4. **Code Examples**: Include patterns for:
   - Presence tracking (live cursors, online users)
   - Broadcast for ephemeral events (typing indicators, selections)
   - PostgreSQL Changes subscription (new PR comments, reviews)
   - Channel configuration and cleanup
   - React hooks for Realtime subscriptions
   - Performance optimization (filter subscriptions, throttle updates)
   - Cleanup on unmount (prevent memory leaks)

5. **Collaboration**:
   - Works with: Supabase Specialist (RLS policies), React Specialist (hooks patterns), Frontend Developer (UI integration)
   - Consult before: Realtime architecture, channel strategy, performance optimization

**Deliverable**: Create file ~/.claude/agents/database/supabase-realtime-specialist.md

This is SPECIALIZED from the general Supabase Specialist. Focus exclusively on Realtime features.
Include live cursor implementation examples for code-review-dashboard.
```

### Prompt 2F: Generate Tailwind CSS 4 Specialist

```
Generate a new specialist agent for Tailwind CSS 4 using the Agent Generation Template.

**Specialist**: Tailwind CSS 4 Expert
**Focus**: v4 new features, utility-first patterns, responsive design, dark mode, component composition
**Primary Use Case**: code-review-dashboard styling

**Requirements**:
1. **Official Documentation**: https://tailwindcss.com/docs
   - Tailwind CSS v4 changelog
   - Utility classes reference
   - Responsive design guide
   - Dark mode guide
   - Plugin system

2. **Books & Resources**:
   - Tailwind CSS official examples
   - "Refactoring UI" by Adam Wathan & Steve Schoger
   - Tailwind UI components

3. **Experts**:
   - Adam Wathan (@adamwathan) - Tailwind creator
   - Steve Schoger (@steveschoger) - Design

4. **Code Examples**: Include patterns for:
   - Utility-first component styling
   - Responsive design (mobile-first breakpoints)
   - Dark mode with class strategy
   - Custom theme configuration
   - Composition patterns (extracting components vs @apply)
   - Arbitrary values for one-offs
   - Container queries (if v4 supports)
   - Animation utilities with Framer Motion integration

5. **Collaboration**:
   - Works with: React Specialist (component styling), Framer Motion Specialist (animations), Radix UI Specialist (accessible components)
   - Consult before: Design system architecture, theme configuration, responsive strategy

**Deliverable**: Create file ~/.claude/agents/design/tailwind-css-4-specialist.md

Emphasize v4-specific features and differences from v3.
Include patterns for shadcn/ui compatibility (we use class-variance-authority, clsx, tailwind-merge).
```

---

## Phase 3: Establish Mandatory Consultation Workflow

### Prompt 3A: Update CLAUDE.md with Consultation Policy

```
Update the CLAUDE.md file in the code-review-dashboard project to add a mandatory agent consultation policy.

**File**: /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/CLAUDE.md

**Action**: CREATE NEW FILE (this is the code-review-dashboard project, not the AIclaudecode docs repo)

**Content to Add**:

Create a new CLAUDE.md file with the following sections:

1. **Repository Purpose** - Describe code-review-dashboard
2. **Tech Stack** - List from package.json
3. **MANDATORY Agent Consultation Policy** (PRIMARY FOCUS)
   - Technology mapping (React → React 19 Specialist, etc.)
   - 4-step workflow (Identify, Plan, Implement, Review)
   - Workaround pattern for multi-agent collaboration
   - Enforcement rules (NEVER skip consultation)
4. **Pre-Implementation Checklist**
5. **Agent Directory** - Map technologies to agent locations
6. **Session Tracking** - Reference SESSION_TRACKER.md

Use the template from AGENT_ECOSYSTEM_STRATEGY.md section "3.1 Update CLAUDE.md".

**Key Requirement**: Make the consultation policy PROMINENT and MANDATORY (use warning symbols, bold text).
```

### Prompt 3B: Create Workflow Templates

```
Create workflow template files for agent collaboration in code-review-dashboard.

**Templates to Create**:

1. **planning/TEMPLATE_feature_plan.md**
   - Purpose: Collaborative planning phase template
   - Sections:
     - Feature Overview
     - Relevant Specialists Identified
     - Specialist Consultations (one section per specialist)
     - Implementation Approach (synthesized from consultations)
     - Integration Plan
     - Testing Strategy
     - Success Criteria

2. **implementation/TEMPLATE_implementation.md**
   - Purpose: Specialist implementation documentation
   - Sections:
     - Specialist Name
     - Technology/Domain
     - Implementation Details
     - Code Snippets
     - Documentation References
     - Integration Notes
     - Handoff to Next Specialist

3. **CONSULTATION_CHECKLIST.md**
   - Purpose: Decision tree for identifying relevant specialists
   - Format: Flowchart/checklist
   - Example:
     ```
     Are you implementing UI components?
     └─ Yes → Consult React 19 Specialist
        └─ Does it use state?
           └─ Yes → Consult Zustand 5 Specialist
        └─ Does it have animations?
           └─ Yes → Consult Framer Motion Specialist
     ```

Create these three template files in the code-review-dashboard project.
```

### Prompt 3C: Update SESSION_TRACKER.md

```
Update SESSION_TRACKER.md in code-review-dashboard to add a prominent reminder about mandatory agent consultation.

**File**: /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/SESSION_TRACKER.md

**Action**: Add a new section at the VERY TOP (above existing content)

**Content**:
```markdown
# ⚠️ MANDATORY: Agent Consultation Policy

**BEFORE implementing ANYTHING in code-review-dashboard:**

1. ✅ Check CLAUDE.md for mandatory consultation workflow
2. ✅ Identify relevant specialist agents for this task
3. ✅ Create planning handoff file if multi-agent workflow needed
4. ✅ Consult specialists BEFORE writing code
5. ✅ Document which specialists were consulted

**Technology → Specialist Mapping**: See CLAUDE.md for full directory

**Common Violations to AVOID**:
- ❌ Writing React components without consulting React 19 Specialist
- ❌ Adding database queries without consulting Supabase Specialist
- ❌ Creating API routes without consulting Next.js 16 Specialist
- ❌ Implementing features "quickly" without planning phase

**Enforcement**: This is NOT optional. All code-review-dashboard work MUST follow the consultation workflow.

---

[Existing SESSION_TRACKER.md content continues below...]
```

Add this section and preserve all existing content below it.
```

---

## Phase 4: Create Agent Collaboration Guide

### Prompt 4: Create Collaboration Patterns Guide

```
Create a comprehensive agent collaboration patterns guide for common code-review-dashboard tasks.

**File**: AGENT_COLLABORATION_PATTERNS.md

**Content**:

Document collaboration workflows for these common scenarios:

1. **Implementing New React Component with State**
   - Consultation order
   - Handoff files
   - Integration steps

2. **Adding GitHub API Endpoint**
   - Consultation order
   - Handoff files
   - Integration steps

3. **Implementing Realtime Feature (Live Cursors)**
   - Consultation order
   - Handoff files
   - Integration steps

4. **Adding Database Table/RLS Policy**
   - Consultation order
   - Handoff files
   - Integration steps

5. **Styling New UI Component**
   - Consultation order
   - Handoff files
   - Integration steps

For each scenario, provide:
- **Task Description**
- **Relevant Specialists** (in consultation order)
- **Step-by-Step Workflow**
- **Handoff Files** (what each specialist creates/reads)
- **Integration Points** (how pieces come together)
- **Common Pitfalls** (what to avoid)

Use the examples from AGENT_ECOSYSTEM_STRATEGY.md as a starting point, but expand with more detail.

Format as a practical guide with real code-review-dashboard examples.
```

---

## Phase 5: Test Workflow with Real Example

### Prompt 5A: Test Workflow - Planning Phase

```
Let's test the agent consultation workflow with a real feature implementation.

**Test Feature**: Implement live cursor collaboration for code-review-dashboard

**Your Task**: Follow the mandatory consultation workflow

**Step 1: Create Planning File**
Create planning/live_cursors_plan.md using the template.

**Step 2: Identify Relevant Specialists**
Based on the feature requirements (live cursors showing where users are hovering/clicking in PR code):
- Which specialists are needed?
- What is the consultation order?

**Step 3: Consult Specialists**
For each identified specialist:
1. Create a section in the planning file
2. Ask the specialist for their implementation approach
3. Document their recommendations

**Specialists to Consult** (you determine if these are correct):
- Supabase Realtime Specialist (presence tracking)
- React 19 Specialist (cursor component, client-side state)
- TypeScript 5.9 Specialist (cursor data types)
- Tailwind CSS 4 Specialist (cursor visual design)
- Frontend Developer (integration)

**Deliverable**: Completed planning/live_cursors_plan.md with all specialist consultations documented.

This is a TEST to validate the workflow. Document any friction points or improvements needed.
```

### Prompt 5B: Test Workflow - Implementation Phase

```
Continue the live cursors test implementation.

**Step 4: Implementation**

Based on the planning/live_cursors_plan.md consultations:

1. Each specialist implements their portion:
   - Supabase Realtime Specialist: Create implementation/live_cursors_realtime.md (presence channel setup, cursor broadcast)
   - React 19 Specialist: Create implementation/live_cursors_component.md (LiveCursor component, useCursor hook)
   - TypeScript 5.9 Specialist: Create implementation/live_cursors_types.md (CursorPosition, UserCursor types)
   - Tailwind CSS 4 Specialist: Create implementation/live_cursors_styles.md (cursor styling, user color assignment)

2. Frontend Developer: Create implementation/live_cursors_integration.md (integrate all pieces)

**Step 5: Review**

Document:
- What worked well in the workflow?
- What was confusing or friction-filled?
- Did the consultation improve code quality?
- Were any specialists redundant or missing?
- How long did the process take vs direct implementation?

**Deliverable**:
- All implementation files
- workflow_test_results.md with retrospective

This validates whether the mandatory consultation policy is practical or needs refinement.
```

---

## Quick Reference: Prompt Execution Order

**Execute in this order for optimal workflow:**

1. **Phase 1 Audits** (30 min)
   - Prompt 1A: Audit Frontend Developer
   - Prompt 1B: Audit Backend/Database agents

2. **Phase 2 Agent Generation** (90 min)
   - Prompt 2A: React 19 Specialist (30 min)
   - Prompt 2B: Next.js 16 Specialist (30 min)
   - Prompt 2C: GitHub API Specialist (20 min)
   - Prompt 2D: TypeScript 5.9 Specialist (20 min)
   - Prompt 2E: Supabase Realtime Specialist (15 min)
   - Prompt 2F: Tailwind CSS 4 Specialist (15 min)

3. **Phase 3 Workflow Enforcement** (30 min)
   - Prompt 3A: Update CLAUDE.md (15 min)
   - Prompt 3B: Create Templates (10 min)
   - Prompt 3C: Update SESSION_TRACKER (5 min)

4. **Phase 4 Collaboration Guide** (20 min)
   - Prompt 4: Create Patterns Guide

5. **Phase 5 Test** (30 min)
   - Prompt 5A: Planning Phase Test
   - Prompt 5B: Implementation Phase Test

**Total**: 3-4 hours

---

## Notes

- Each prompt is self-contained and can be copy-pasted
- Prompts reference the Agent Generation Template from AGENT_ECOSYSTEM_STRATEGY.md
- All prompts emphasize grounding in official documentation
- Deliverables are clearly specified for each prompt
- Test phase validates the workflow before full rollout

**Ready to Execute**: Start with Phase 1 Prompt 1A when ready to begin.
