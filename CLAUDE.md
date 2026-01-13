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
- **TDD-influenced development** with full specialist team

---

## 🏗️ AGILE DEVELOPMENT METHODOLOGY

**CRITICAL**: This project uses **TDD-influenced development** with AGILE methodology. Features are implemented using the AGILE team structure, Sprint Planning, and testing practices documented below.

### Why TDD-Influenced Development?

**Goals**:
1. **Specialist-driven development** - Every tech in stack has dedicated expert
2. **Test-informed implementation** - Write tests alongside or after implementation, focusing on business logic
3. **Quality over speed** - Zero hallucinations, zero TypeScript errors, production-ready code
4. **Pragmatic testing** - Test Zustand stores (pure functions) rather than heavily-mocked hooks

**Current Test Coverage** (55 tests):
- `presence-store.ts`: 76.66% statements, 73.07% lines (13 tests)
- `cursor-store.ts`: 100% statements, 100% lines (15 tests)
- `comments-store.ts`: 87.93% statements, 87.27% lines (15 tests)
- `diff-viewer.tsx`: 75% statements, 73.33% lines (12 tests)

**Evidence from SESSION_TRACKER.md**:
- Implementing features without proper planning leads to bugs
- Skipping specialists leads to incomplete solutions
- Testing business logic in stores provides high value with low complexity

**This AGILE system with pragmatic testing prevents issues proven in Sessions #1-8.**

---

## 👥 AGILE TEAM STRUCTURE

### Foundation Roles (Workflow Coordination)

#### Product Owner
**Location**: `~/.claude/agents/agile-team/product-owner.md`
**Grounded in**: "Agile Product Management with Scrum" (Pichler), "User Story Mapping" (Patton)

**Responsibilities**:
- Manages product backlog
- Writes user stories (As a... I want... So that...)
- Defines acceptance criteria
- Accepts/rejects completed work

**Output**: `user_stories_sprint_{N}.md`

#### Business Analyst
**Location**: `~/.claude/agents/agile-team/business-analyst.md`
**Grounded in**: "Agile Extension to the BABOK Guide" (IIBA), "Business Analysis for Practitioners" (PMI)

**Responsibilities**:
- Refines user stories into detailed requirements
- Identifies functional/non-functional requirements
- Documents constraints, dependencies, risks
- Formulates questions for Lead Engineer

**Output**: `refined_requirements_sprint_{N}.md`

#### Lead Engineer
**Location**: `~/.claude/agents/agile-team/lead-engineer.md`
**Grounded in**: "Clean Architecture" (Martin), "Software Architecture in Practice" (Bass)

**Responsibilities**:
- Technical architecture design
- Multi-domain detection (identifies ALL specialists needed)
- Assigns specialists to tasks
- Code review & refactoring guidance

**Output**: `technical_design_sprint_{N}.md`

#### Scrum Master
**Location**: `~/.claude/agents/agile-team/scrum-master.md`
**Grounded in**: "Scrum: The Art of Doing Twice the Work" (Sutherland), Scrum Guide

**Responsibilities**:
- Facilitates Sprint Planning, Daily Standup, Sprint Review, Retrospective
- Removes blockers
- Consolidates sprint artifacts
- Ensures AGILE process adherence

**Output**: `sprint_plan_sprint_{N}.md`, `consolidated_retrospective_sprint_{N}.md`

### QA/Testing Team

#### QA Lead
**Location**: `~/.claude/agents/agile-team/qa-lead.md`
**Grounded in**: "Agile Testing" (Crispin & Gregory), "Test Driven Development" (Beck)

**Responsibilities**:
- **Writes test strategy** (Test Pyramid: unit, integration, E2E)
- **Identifies testable business logic** (prioritizes stores over hooks)
- Monitors test coverage
- Validates acceptance criteria

**Output**: `test_strategy_sprint_{N}.md`, `{feature}.test.ts`

#### Test Automation Engineer
**Location**: `~/.claude/agents/agile-team/test-automation-engineer.md`

**Responsibilities**:
- Executes automated test suites
- CI/CD integration
- Test reporting & metrics
- Flaky test detection

#### Manual QA Tester
**Location**: `~/.claude/agents/agile-team/manual-qa-tester.md`

**Responsibilities**:
- Exploratory testing
- Acceptance criteria validation
- Usability testing
- Bug reporting

#### Jest Specialist
**Location**: `~/.claude/agents/agile-team/jest-specialist.md`

**Responsibilities**:
- Unit testing (JavaScript/TypeScript)
- Mocking & test doubles
- Coverage analysis

#### React Testing Library Specialist
**Location**: `~/.claude/agents/agile-team/react-testing-library-specialist.md`

**Responsibilities**:
- Component testing (React)
- User behavior testing
- Accessibility testing

### Core Tech Specialists (Language & Runtime)

#### TypeScript Specialist
**Location**: `~/.claude/agents/agile-team/typescript-specialist.md`

**Responsibilities**:
- Type definitions & type safety
- Advanced type patterns (generics, discriminated unions)
- TypeScript configuration (strict mode)
- Zero TypeScript errors enforcement

#### JavaScript Specialist
**Location**: `~/.claude/agents/agile-team/javascript-specialist.md`

**Responsibilities**:
- ECMAScript 2024+ features
- Async/await patterns
- Closures & scope
- Event loop optimization

#### React 19 Specialist
**Location**: `~/.claude/agents/agile-team/react-19-specialist.md`

**Responsibilities**:
- Server Components vs Client Components
- `use` hook (promises, context)
- Actions (Server Actions, Client Actions)
- React Compiler optimization

#### Playwright Specialist
**Location**: `~/.claude/agents/agile-team/playwright-specialist.md`

**Responsibilities**:
- End-to-end testing
- Cross-browser testing
- Multi-user testing
- Visual regression

#### Vitest Specialist
**Location**: `~/.claude/agents/agile-team/vitest-specialist.md`

**Responsibilities**:
- Fast unit/integration testing
- Vite integration
- Snapshot testing
- Benchmarking

#### Full-Stack Developer
**Location**: `~/.claude/agents/agile-team/full-stack-developer.md`

**Responsibilities**:
- Frontend-backend integration
- API design & implementation
- End-to-end functionality
- Multi-domain coordination

### Framework Specialists (Libraries & Tooling)

#### Zustand Specialist
**Location**: `~/.claude/agents/agile-team/zustand-specialist.md`

**Responsibilities**:
- State management (Zustand stores)
- Selectors & performance optimization
- Middleware (devtools, persist, immer)

#### Tailwind CSS Specialist
**Location**: `~/.claude/agents/agile-team/tailwind-css-specialist.md`

**Responsibilities**:
- Utility-first styling
- Responsive design (mobile-first)
- Dark mode implementation
- Custom configuration

#### Framer Motion Specialist
**Location**: `~/.claude/agents/agile-team/framer-motion-specialist.md`

**Responsibilities**:
- Declarative animations
- Gesture handling (drag, hover, tap)
- Layout animations
- AnimatePresence (enter/exit)

#### PostgreSQL Specialist
**Location**: `~/.claude/agents/agile-team/postgresql-specialist.md`

**Responsibilities**:
- Database schema design
- Query optimization & indexes
- Row Level Security (RLS)
- Migrations & functions

#### REST API Specialist
**Location**: `~/.claude/agents/agile-team/rest-api-specialist.md`

**Responsibilities**:
- RESTful API design
- HTTP methods & status codes
- GitHub API integration (Octokit)
- Rate limiting & error handling

---

## 📋 HOW TO IMPLEMENT FEATURES USING AGILE TDD

**CRITICAL**: This section is the **implementation manual** for all future features. Follow this process EXACTLY.

### Step 1: Sprint Planning (Product Owner → BA → Lead Engineer → QA Lead → Scrum Master)

#### 1.1 Product Owner Writes User Stories

**File to Create**: `user_stories_sprint_{N}.md`

**Template**:
```markdown
# Sprint {N}: {Sprint Goal} - User Stories

**Sprint Goal**: {Clear, measurable objective}
**Sprint Duration**: {1-2 weeks}
**Created By**: Product Owner

---

## User Story #{X}: {Title}

**As a** {user type}
**I want** {capability}
**So that** {benefit/value}

### Acceptance Criteria
- [ ] {Testable criterion 1}
- [ ] {Testable criterion 2}
- [ ] {Testable criterion 3}

### Priority
**P0** (Critical) / **P1** (High) / **P2** (Medium) / **P3** (Low)

### Dependencies
- {Other user stories, technical prerequisites}
```

**Example**:
```markdown
## User Story #1: Live Cursor Tracking

**As a** code reviewer
**I want** to see where my teammates are looking in real-time
**So that** we can coordinate our review efforts

### Acceptance Criteria
- [ ] Cursor position updates in real-time (<150ms latency)
- [ ] Each user has unique cursor color
- [ ] Cursor shows username label
- [ ] Own cursor is NOT visible to user (only see others)
- [ ] Works on Supabase free tier (zero-cost requirement)

### Priority: P0 (Critical)
```

#### 1.2 Business Analyst Refines Requirements

**Read**: `user_stories_sprint_{N}.md`
**Write**: `refined_requirements_sprint_{N}.md`

**What Business Analyst Adds**:
- **Functional Requirements** (FR1.1, FR1.2, etc.) - Detailed, testable requirements
- **Non-Functional Requirements** (NFR1: Performance, NFR2: Cost, etc.)
- **Constraints** (C1: Supabase free tier limits)
- **Dependencies** (D1: GitHub OAuth, D2: Supabase Realtime)
- **Questions for Lead Engineer** (technical clarifications needed)

**Example**:
```markdown
### FR1: Cursor Position Broadcasting
- **FR1.1**: System captures mouse coordinates (x, y) on PR page
- **FR1.2**: System broadcasts coordinates to Supabase Realtime channel
- **FR1.3**: Broadcast throttled to max 20 updates/second (50ms intervals)
- **FR1.4**: Broadcast includes user_id, pr_id, x, y, timestamp

### NFR1: Performance
- Latency: <150ms end-to-end
- Frame rate: 60fps smooth rendering
- Network: Max 20 messages/second per user

### C1: Supabase Free Tier
- Cannot exceed 2GB bandwidth/month
- Cannot exceed 500MB database storage
- Cannot exceed 200 concurrent Realtime connections
```

#### 1.3 Lead Engineer Creates Technical Design

**Read**: `refined_requirements_sprint_{N}.md`
**Write**: `technical_design_sprint_{N}.md`

**What Lead Engineer Provides**:
- **Architecture** (high-level system design)
- **Multi-Domain Detection** (identifies ALL domains: frontend, backend, database, etc.)
- **Specialist Assignments** (hierarchical: Lead → Team Leads → Specialists)
- **Implementation Plan** (phased approach with clear deliverables)
- **Technical Risks** (with mitigation strategies)

**Example**:
```markdown
## Multi-Domain Detection

**Domains Involved**:
- ✅ Frontend (cursor rendering, animation, hooks)
- ✅ Backend (Realtime channel setup, broadcasting)
- ✅ Database (cursors table, RLS policies)

**Specialist Assignments**:

**Frontend Team** (parallel work):
- React 19 Specialist: Server/Client Component split
- TypeScript Specialist: Type definitions for Cursor
- Framer Motion Specialist: Enter/exit animations
- Zustand Specialist: Cursor state management

**Backend Team** (parallel work):
- Full-Stack Developer: Realtime integration
- PostgreSQL Specialist: Database schema & RLS

**QA Team** (after implementation):
- QA Lead: Test strategy & failing tests
- Jest Specialist: Unit tests
- React Testing Library Specialist: Component tests
- Playwright Specialist: E2E multi-user tests
```

#### 1.4 QA Lead Writes Test Strategy

**Read**: `technical_design_sprint_{N}.md`
**Write**: `test_strategy_sprint_{N}.md`

**What QA Lead Provides**:
- **Test Pyramid Strategy** (70% unit, 20% integration, 10% E2E)
- **TDD RED-GREEN-REFACTOR Plan** (who writes what, when)
- **Test Coverage Requirements** (80% minimum)
- **Acceptance Criteria Validation** (how to test each criterion)

**Example**:
```markdown
## TDD RED-GREEN-REFACTOR Plan

**RED Phase** (QA Lead writes failing tests):
- `use-cursors.test.ts` - Unit tests for cursor filtering logic
- `live-cursor.test.tsx` - Component tests for cursor rendering
- `cursors.e2e.spec.ts` - E2E tests for multi-user scenarios
- **Deliverable**: All tests FAIL (no implementation yet)

**GREEN Phase** (Specialists implement):
- Specialists write minimal code to pass tests
- Tests turn GREEN one by one
- **Deliverable**: All tests PASS

**REFACTOR Phase** (Lead Engineer guides):
- Improve code quality without changing behavior
- Tests remain GREEN throughout
- **Deliverable**: Clean code + GREEN tests
```

#### 1.5 Scrum Master Consolidates Sprint Plan

**Read**: All above files
**Write**: `sprint_plan_sprint_{N}.md`

**What Scrum Master Provides**:
- Consolidated view of entire sprint
- Sprint backlog with assignments
- Definition of Done
- Daily standup schedule
- Risk summary

### Step 2: TDD RED Phase (Write Failing Tests FIRST)

**CRITICAL**: No implementation code until tests are written and FAILING.

#### 2.1 QA Lead Writes All Tests

**File Naming Convention**:
- Unit tests: `{feature}.test.ts` or `{feature}.test.tsx`
- Integration tests: `{feature}.integration.test.ts`
- E2E tests: `{feature}.e2e.spec.ts`

**Example**:
```typescript
// File: use-cursors.test.ts (QA Lead writes this FIRST)

import { renderHook } from '@testing-library/react';
import { useCursors } from './use-cursors';

describe('useCursors hook', () => {
  it('should filter out own cursor from cursor list', () => {
    // Arrange
    const mockCursors = [
      { user_id: 'user1', x: 100, y: 200 },
      { user_id: 'user2', x: 150, y: 250 }
    ];
    const currentUserId = 'user1';

    // Act
    const { result } = renderHook(() => useCursors(mockCursors, currentUserId));

    // Assert
    expect(result.current).toHaveLength(1);
    expect(result.current[0].user_id).toBe('user2');
  });
});

// Expected: ❌ FAIL (use-cursors.ts doesn't exist yet)
```

#### 2.2 Verify Tests Fail

```bash
npm run test

# Expected output:
# ❌ FAIL src/lib/hooks/use-cursors.test.ts
#   ● Test suite failed to run
#   Cannot find module './use-cursors'
```

**This is CORRECT behavior in RED phase.**

### Step 3: TDD GREEN Phase (Minimal Implementation)

#### 3.1 Specialists Implement Code

**Rule**: Write the **minimum code** needed to make tests pass.

**Example**:
```typescript
// File: lib/hooks/use-cursors.ts (React 19 Specialist implements)

export function useCursors(cursors: Cursor[], currentUserId: string): Cursor[] {
  return cursors.filter(c => c.user_id !== currentUserId);
}
```

#### 3.2 Run Tests Until Green

```bash
npm run test

# Expected output:
# ✅ PASS src/lib/hooks/use-cursors.test.ts
#   ✓ should filter out own cursor from cursor list
```

#### 3.3 Verify All Tests Pass

**All tests must be GREEN before proceeding to REFACTOR phase.**

### Step 4: TDD REFACTOR Phase (Improve Quality)

**Rule**: Improve code quality WITHOUT changing behavior. Tests remain GREEN.

#### 4.1 Lead Engineer Reviews Code

**Read**: Implementation code from specialists
**Write**: `refactor_recommendations_{feature}.md`

**Example**:
```markdown
## Refactoring Recommendations

### Performance Optimization
**Current**:
```typescript
return cursors.filter(c => c.user_id !== currentUserId);
```

**Recommended**:
```typescript
// Use React.useMemo to prevent unnecessary re-filtering
const filteredCursors = useMemo(
  () => cursors.filter(c => c.user_id !== currentUserId),
  [cursors, currentUserId]
);
return filteredCursors;
```

**Rationale**: Prevent re-filtering on every render (performance)
```

#### 4.2 Specialists Refactor

Specialists improve code based on Lead Engineer recommendations.

#### 4.3 Verify Tests Still Pass

```bash
npm run test

# Must still be GREEN after refactoring
# ✅ All tests pass
```

### Step 5: Integration & Manual Testing

#### 5.1 Test Automation Engineer Runs Full Suite

```bash
npm run test:all
npm run test:coverage
```

#### 5.2 Manual QA Tester Validates Acceptance Criteria

**File**: `acceptance_validation_sprint_{N}.md`

**Template**:
```markdown
## User Story #1: Live Cursor Tracking

### Criterion 1: Cursor position updates in real-time (<150ms)
**Test Steps**:
1. Open PR page in 2 windows
2. Move cursor in window 1
3. Measure latency in window 2

**Result**: ✅ PASS (measured 120ms average latency)
**Evidence**: Screen recording shows cursor following with <150ms delay
```

### Step 6: Sprint Review & Acceptance

#### 6.1 Product Owner Reviews Deliverables

**Read**: All test reports, implementation code
**Write**: `acceptance_review_sprint_{N}.md`

**Product Owner Decision**:
- ✅ **ACCEPTED** - All acceptance criteria met, ship to production
- ❌ **REJECTED** - Some criteria failed, move to next sprint
- ⚠️ **ACCEPTED WITH RESERVATIONS** - Minor issues, document as tech debt

### Step 7: Sprint Retrospective

**Write**: `consolidated_retrospective_sprint_{N}.md`

**Template**:
```markdown
# Sprint {N}: Retrospective

## What Went Well ✅
- TDD process caught edge cases early
- Multi-domain detection identified all specialists needed
- Zero bugs in production

## What Could Be Improved ⚠️
- Test writing took longer than expected
- Need more E2E test coverage

## Action Items for Next Sprint
1. **Action**: Create E2E test templates to speed up test writing
   - **Owner**: QA Lead
   - **Due**: Sprint {N+1} planning
```

---

## 🔄 WORKAROUND PATTERN (Agent Collaboration)

**CRITICAL**: Agents cannot communicate directly. Use file-based handoffs.

### How It Works

1. **Agent A** performs task and writes results to file (e.g., `user_stories_sprint_1.md`)
2. **Agent B** is instructed to **read that file**
3. **Agent B** uses the information to complete subsequent work

**Think of it as**: "Leaving sticky notes in a shared folder for teammates"

### File Naming Conventions

| File Type | Naming Pattern | Example |
|-----------|---------------|---------|
| User Stories | `user_stories_sprint_{N}.md` | `user_stories_sprint_1.md` |
| Requirements | `refined_requirements_sprint_{N}.md` | `refined_requirements_sprint_1.md` |
| Technical Design | `technical_design_sprint_{N}.md` | `technical_design_sprint_1.md` |
| Test Strategy | `test_strategy_sprint_{N}.md` | `test_strategy_sprint_1.md` |
| Sprint Plan | `sprint_plan_sprint_{N}.md` | `sprint_plan_sprint_1.md` |
| Tests (Unit) | `{feature}.test.ts` or `.tsx` | `use-cursors.test.ts` |
| Tests (Integration) | `{feature}.integration.test.ts` | `cursor-api.integration.test.ts` |
| Tests (E2E) | `{feature}.e2e.spec.ts` | `live-cursors.e2e.spec.ts` |
| Acceptance Review | `acceptance_review_sprint_{N}.md` | `acceptance_review_sprint_1.md` |
| Retrospective | `consolidated_retrospective_sprint_{N}.md` | `consolidated_retrospective_sprint_1.md` |

### Example Workaround Handoff

**User Instruction**:
> "Product Owner, create user stories for Sprint 1. Then, Business Analyst, read those user stories and refine requirements."

**Execution**:
```
Step 1: Product Owner writes user_stories_sprint_1.md
Step 2: Verify file exists
Step 3: Business Analyst reads user_stories_sprint_1.md
Step 4: Business Analyst writes refined_requirements_sprint_1.md
```

---

## 🚦 RISK-BASED CHECKPOINT FRAMEWORK

**Approved by Decision Council**: Option D-A (HIGH risk checkpoints only)

### Checkpoint Strategy

**HIGH Risk Phases** → Pause for user approval before proceeding:
- Business Analyst requirements (complex, foundational)
- Lead Engineer architecture (hard to reverse)
- CLAUDE.md redesign (affects all future work)

**MEDIUM/LOW Risk Phases** → Autonomous execution:
- Product Owner user stories (can iterate easily)
- QA Lead test strategy (testable, verifiable)
- Specialist implementation (validated by tests)

### Why This Framework?

**Problem**: Too many checkpoints = decision fatigue
**Solution**: User approves HIGH-leverage decisions only

**Benefits**:
- Efficiency: 9/10 (minimal user interruption)
- Quality: 10/10 (HIGH-risk phases still require approval)
- Best Practice: 10/10 (aligned with AGILE principles)

---

## 📚 COMPLETE REAL-WORLD EXAMPLE: Live Cursors Feature

### Sprint 0 Context

**What Happened**: Live cursors were initially implemented without AGILE process, resulting in bugs:
- Cursor fading when it shouldn't
- Own cursor visible to user (should only show others)
- Clunky movement (not smooth 60fps)

**Root Cause**: No TDD, no multi-domain detection, no specialist coordination

**Solution**: Re-implement using full AGILE TDD process

### Sprint 1 Planning

#### Product Owner: User Story

```markdown
# Sprint 1: Live Cursors Rebuild - User Stories

## User Story #1: Smooth Cursor Tracking

**As a** code reviewer
**I want** to see teammates' cursors moving smoothly in real-time
**So that** I can coordinate review focus and avoid duplicate work

### Acceptance Criteria
- [ ] Own cursor is NOT visible to me (only see others)
- [ ] Other users' cursors visible with smooth 60fps animation
- [ ] Cursor position updates <150ms latency
- [ ] Cursor shows username label above icon
- [ ] Works on Supabase free tier (zero-cost)

### Priority: P0 (Critical)
```

#### Business Analyst: Refined Requirements

```markdown
## Functional Requirements

### FR1: Cursor Filtering
- **FR1.1**: System filters cursors array to exclude current user's cursor
- **FR1.2**: Filtering happens client-side before rendering
- **FR1.3**: Filter uses user_id comparison (not username)

### FR2: Smooth Animation
- **FR2.1**: Cursor movement uses lerp (linear interpolation) for smoothness
- **FR2.2**: Animation runs at 60fps via requestAnimationFrame
- **FR2.3**: Framer Motion handles enter/exit animations

## Non-Functional Requirements

### NFR1: Performance
- 60fps rendering (16ms per frame)
- <150ms cursor position update latency
- Smooth animation even with 10 concurrent cursors

### NFR2: Cost
- Zero-cost (Supabase free tier)
- Max 20 cursor updates/second per user (throttling)
```

#### Lead Engineer: Technical Design

```markdown
## Multi-Domain Analysis

**Domains**:
- ✅ Frontend (cursor rendering, filtering, animation)
- ✅ State Management (Zustand for cursor store)
- ✅ Backend (Supabase Realtime for broadcasting)

**Specialist Assignments**:

**Frontend Team** (parallel):
- React 19 Specialist: Client Component for cursors
- TypeScript Specialist: Cursor type definitions
- Framer Motion Specialist: Enter/exit animations
- Zustand Specialist: Cursor state store

**Backend Team** (parallel):
- Full-Stack Developer: Realtime integration
- PostgreSQL Specialist: Database schema (if needed)

**QA Team** (after implementation):
- QA Lead: Test strategy
- Jest Specialist: Unit tests for filtering
- React Testing Library Specialist: Component tests
- Playwright Specialist: Multi-user E2E tests
```

#### QA Lead: Test Strategy

```markdown
## TDD RED Phase Plan

**Unit Tests** (`use-cursors.test.ts`):
```typescript
describe('useCursors', () => {
  it('should filter out own cursor');
  it('should return empty array when only own cursor exists');
  it('should handle empty cursor array');
});
```

**Component Tests** (`live-cursor.test.tsx`):
```typescript
describe('LiveCursor', () => {
  it('should render cursor at correct position');
  it('should display username label');
  it('should NOT render when cursor is undefined');
});
```

**E2E Tests** (`live-cursors.e2e.spec.ts`):
```typescript
describe('Live Cursors E2E', () => {
  it('should show other users cursors');
  it('should NOT show own cursor');
  it('should remove cursor when user leaves');
});
```

**All tests written BEFORE implementation.**
```

### TDD RED Phase

**Jest Specialist writes**:
```typescript
// use-cursors.test.ts
describe('useCursors', () => {
  it('should filter out own cursor from cursor list', () => {
    const cursors = [
      { user_id: 'user1', x: 100, y: 200 },
      { user_id: 'user2', x: 150, y: 250 }
    ];
    const result = filterOwnCursor(cursors, 'user1');
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe('user2');
  });
});
```

**Run tests**:
```bash
npm run test
# ❌ FAIL - filterOwnCursor is not defined (EXPECTED)
```

### TDD GREEN Phase

**React 19 Specialist implements**:
```typescript
// lib/hooks/use-cursors.ts
export function filterOwnCursor(cursors: Cursor[], userId: string): Cursor[] {
  return cursors.filter(c => c.user_id !== userId);
}
```

**Run tests**:
```bash
npm run test
# ✅ PASS - Test now passes
```

**Repeat for all tests until all GREEN.**

### TDD REFACTOR Phase

**Lead Engineer reviews**:
```markdown
## Refactoring: Performance Optimization

**Recommendation**: Add React.useMemo to prevent unnecessary re-filtering

**Before**:
```typescript
const filteredCursors = filterOwnCursor(cursors, currentUserId);
```

**After**:
```typescript
const filteredCursors = useMemo(
  () => filterOwnCursor(cursors, currentUserId),
  [cursors, currentUserId]
);
```
```

**React 19 Specialist refactors**, tests remain GREEN.

### Sprint Review

**Product Owner validates**:
```markdown
## Acceptance Criteria Review

- [x] Own cursor NOT visible ✅ PASS
- [x] 60fps smooth animation ✅ PASS (measured with React Profiler)
- [x] <150ms latency ✅ PASS (measured at 120ms average)
- [x] Username label visible ✅ PASS
- [x] Zero-cost ✅ PASS (Supabase free tier usage at 45%)

**Decision**: ✅ ACCEPTED - Ship to production
```

### Sprint Retrospective

```markdown
## What Went Well
- TDD caught edge case: empty cursor array
- Multi-domain detection ensured all specialists consulted
- Zero bugs in production

## What Could Improve
- Need faster test writing (create templates)

## Lessons Learned
- Filtering client-side is more performant than server-side
- Lerp animation provides smoother UX than direct position updates
```

---

## 🚀 AGILE EXPRESS LANE (Simple Tasks)

**For simple, single-domain tasks**, you can use a lightweight workflow:

### When to Use Express Lane

✅ **USE when**:
- Single domain only (e.g., just frontend, just backend)
- Low complexity (< 3 files changed)
- No architectural changes
- Clear, unambiguous requirements

❌ **DON'T USE when**:
- Multi-domain task
- Architectural changes
- High complexity
- Unclear requirements

### Express Lane Workflow

```
User Request: "Fix typo in README"
    ↓
Step 1: Identify Specialist (e.g., Frontend Developer for UI typo)
    ↓
Step 2: Specialist writes failing test (if applicable)
    ↓
Step 3: Specialist implements fix
    ↓
Step 4: Verify tests pass (if applicable)
    ↓
Step 5: Commit
```

**No Sprint Planning needed for trivial tasks.**

---

## 🛠️ AGILE CEREMONIES (Simulated)

### Sprint Planning

**When**: Start of each sprint (Sprint 1, Sprint 2, etc.)

**Who**: Product Owner, Business Analyst, Lead Engineer, QA Lead, Scrum Master

**Artifacts Created**:
1. `user_stories_sprint_{N}.md` (Product Owner)
2. `refined_requirements_sprint_{N}.md` (Business Analyst)
3. `technical_design_sprint_{N}.md` (Lead Engineer)
4. `test_strategy_sprint_{N}.md` (QA Lead)
5. `sprint_plan_sprint_{N}.md` (Scrum Master)

**Output**: Sprint backlog with clear assignments

### Daily Standup (Simulated)

**When**: Each day during sprint

**Format**: Each agent reports:
- What I completed yesterday
- What I'm working on today
- Blockers (if any)

**File**: `standup_{agent_name}_{date}.md`

**Scrum Master consolidates**: `daily_standup_{date}.md`

### Sprint Review

**When**: End of sprint

**Who**: Product Owner (leads), QA Lead (presents test results), Specialists (demo features)

**Artifacts**:
- `acceptance_review_sprint_{N}.md` (Product Owner accepts/rejects)

**Outcome**: Features accepted or moved to next sprint

### Sprint Retrospective

**When**: After Sprint Review

**Who**: All team members

**Artifacts**:
- `consolidated_retrospective_sprint_{N}.md` (Scrum Master)
- `action_items_sprint_{N}.md` (Scrum Master)

**Outcome**: Process improvements for next sprint

---

## ✅ PRE-SPRINT INFRASTRUCTURE CHECKLIST

Before starting ANY sprint, verify infrastructure is ready:

**Testing Infrastructure**:
- [ ] Test runner installed (Vitest)
- [ ] Coverage reporting configured (@vitest/coverage-v8)
- [ ] Test setup file created (src/test/setup.ts)
- [ ] Common mocks available (src/test/mocks.ts)

**Development Environment**:
- [ ] All dependencies installed (npm install)
- [ ] Environment variables configured (.env.local)
- [ ] Database migrations applied
- [ ] Build passes (npm run build)

**CI/CD** (if applicable):
- [ ] Test command runs in CI
- [ ] Coverage thresholds set
- [ ] Lint checks pass

---

## ✅ PRE-IMPLEMENTATION CHECKLIST

Before writing ANY code, verify:

**AGILE Workflow**:
- [ ] Sprint Planning completed (if new feature)
- [ ] User stories written (Product Owner)
- [ ] Requirements refined (Business Analyst)
- [ ] Technical design created (Lead Engineer)
- [ ] Test strategy defined (QA Lead)

**TDD-Influenced Workflow**:
- [ ] Test targets identified (prioritize stores over hooks)
- [ ] Store tests for business logic
- [ ] Component tests for rendering edge cases
- [ ] Defer hook tests if they require extensive mocking

**Multi-Domain Detection**:
- [ ] All domains identified (frontend, backend, database, etc.)
- [ ] All specialists assigned for each domain
- [ ] Integration points defined

**Specialist Consultation**:
- [ ] ALL relevant specialists consulted (none skipped)
- [ ] Specialist recommendations documented
- [ ] Conflicts resolved (Decision Council if needed)

**Decision Council Usage**:
- [ ] Use for decisions with 3+ viable options
- [ ] Document decision rationale
- [ ] Record unanimous vs majority votes

---

## 📋 SPRINT PLANNING GUIDELINES

**Lessons learned from Sprint 2 Retrospective:**

### Realistic Sizing
- Include **20% buffer** in all estimates for unexpected issues
- Story points based on actual complexity, not optimistic estimates
- Test counts based on code analysis, not aspirational targets

### Sprint Plan Structure
- **Cap sprint plans at 200 lines** (avoid over-detailed hour-by-hour schedules)
- Clearly separate **must-haves** vs **stretch goals**
- Mark stretch goals explicitly: `[STRETCH]`

### Test Target Guidelines
| Target | Priority | Complexity | Notes |
|--------|----------|------------|-------|
| Zustand stores | HIGH | LOW | Pure functions, easy to test |
| Component rendering | MEDIUM | LOW | Structure and edge cases |
| Hooks with Supabase | LOW | HIGH | Require extensive mocking - defer or use E2E |

### Decision Council Usage
Use Decision Council when:
- 3+ viable options exist
- Significant impact on project direction
- Trade-offs need explicit evaluation

Format:
```
Options: [A, B, C]
Criteria: efficiency (25%), quality (25%), best practices (25%), risk (25%)
Vote: [Unanimous/Majority] for Option X
Rationale: [Brief justification]
```

---

## 📊 SUCCESS CRITERIA

### AGILE Process Quality
- ✅ Sprint Planning artifacts complete before implementation
- ✅ TDD-influenced approach followed (stores first, then components)
- ✅ All specialists consulted (multi-domain detection)
- ✅ Sprint Review acceptance documented
- ✅ Retrospective action items tracked and applied

### Code Quality
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ Store coverage >= 75%
- ✅ Build succeeds
- ✅ Production-ready (no hallucinations)

### Documentation Quality
- ✅ README updated with current features
- ✅ TESTING.md maintained with test patterns
- ✅ Sprint artifacts committed to repo
- ✅ Retrospective lessons applied to CLAUDE.md

---

## 🔴 ANTI-PATTERNS (FORBIDDEN)

### ❌ ANTI-PATTERN 1: Skipping Tests Entirely

```
# BAD
User: "Implement live cursors"
Me: *Writes implementation code without ANY tests*

# GOOD
User: "Implement live cursors"
Me: *Implement feature → Write store tests for business logic → Component tests for edge cases*
```

### ❌ ANTI-PATTERN 2: Single Specialist for Multi-Domain Task

```
# BAD
Task: "Rebuild live cursors with WebSocket"
Me: *Only consults Frontend Developer*

# GOOD
Task: "Rebuild live cursors with WebSocket"
Me: *Consults Frontend + Backend + Database specialists*
```

### ❌ ANTI-PATTERN 3: Implementing Before Planning

```
# BAD
User: "Add authentication"
Me: *Starts coding immediately*

# GOOD
User: "Add authentication"
Me: *Sprint Planning → User Stories → Requirements → Technical Design → Tests → Implementation*
```

---

## Tech Stack

### Frontend
- **Next.js**: 16.1.1 (App Router, Server Components)
- **React**: 19.2.0 (Server Components, use hook, Actions)
- **TypeScript**: 5.7.2 (strict mode)
- **Tailwind CSS**: 4.1.0 (utility-first)
- **Framer Motion**: 11.16.0 (animations)

### State Management
- **Zustand**: 5.0.2 (client state)

### Backend
- **Supabase**: PostgreSQL 16, RLS, Realtime
- **GitHub API**: REST API v3 (Octokit)

### Testing
- **Jest**: Unit tests
- **React Testing Library**: Component tests
- **Playwright**: E2E tests
- **Vitest**: Fast unit/integration tests

### Build Tools
- **Turbopack**: Stable
- **React Compiler**: Stable (auto memoization)

---

## Important Notes

- **TDD-influenced development** - Test business logic in stores, defer complex mocking
- **Store-first testing** - Zustand stores are pure functions, easy to test with high value
- **Specialist-driven** - Every tech has dedicated expert
- **Quality over speed** - Zero hallucinations, production-ready code
- **Learn from mistakes** - Retrospectives capture lessons learned and apply to CLAUDE.md
- **Decision Council** - Use for strategic decisions with 3+ options

---

**Last Updated**: 2026-01-13 (Sprint 2 Complete - Applied Retrospective Learnings)
**Maintained By**: Claude Code (Opus 4.5) + User collaboration
**Enforcement**: AGILE process with pragmatic testing prevents bugs proven in Sessions #1-9
