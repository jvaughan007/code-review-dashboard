# Sprint 2: MVP Completion - Sprint Plan

**Sprint Duration**: January 11-13, 2026 (3 days, 18 hours total)

**Sprint Goal**: Complete MVP features (diff rendering, comments, tests) to make dashboard production-ready for demo and handoff

**Team**: 8 specialists assigned (Frontend Developer, Full-Stack Developer, PostgreSQL Specialist, Tailwind CSS Specialist, Jest Specialist, React Testing Library Specialist, TypeScript Specialist, QA Lead)

**Status**: READY FOR EXECUTION

---

## Executive Summary

This sprint consolidates all planning artifacts from the Agile Team (Product Owner, Business Analyst, Lead Engineer, QA Lead) into a single, actionable execution plan. The team will use **Test-Driven Development (TDD)** with strict RED → GREEN → REFACTOR cycles to implement 5 user stories over 3 days.

**Key Deliverables**:
- Syntax-highlighted diff rendering component (replaces raw patch display)
- Real-time comment threading system (with database polling)
- Comprehensive test coverage (>= 80%, 92 total tests)
- Robust error handling and accessibility
- Complete documentation for handoff

**Current State**: 70% complete (infrastructure done, features incomplete)
**Target State**: 100% MVP complete (production-ready, demo-ready)

---

## 📋 Sprint Backlog

### User Story #1: Syntax-Highlighted Diff Rendering

**Priority**: P0 (Critical)
**Story Points**: 4
**Assigned To**: Frontend Developer, Tailwind CSS Specialist, Jest Specialist
**Estimated Time**: 4 hours

**User Story**:
> As a code reviewer, I want to see syntax-highlighted diffs with line numbers and color-coded changes, so that I can easily review code changes without reading raw patch text.

**Acceptance Criteria**:
- [ ] Diff component renders file patches from GitHub API
- [ ] Line numbers displayed on both sides (old/new)
- [ ] Added lines have green background with `+` indicator
- [ ] Deleted lines have red background with `-` indicator
- [ ] Context lines have neutral background (unchanged code)
- [ ] Syntax highlighting works for 10 languages (JS, TS, Python, Go, Java, CSS, HTML, JSON, Markdown, YAML)
- [ ] Component handles edge cases (binary files, large diffs, no changes)
- [ ] Diff rendering is responsive (works on mobile, tablet, desktop)
- [ ] Performance tested with large diffs (500-line diff < 500ms)

**Technical Tasks**:
- [x] Install `react-diff-viewer-continued` library - Frontend Developer
- [x] Install Prism.js for syntax highlighting - Frontend Developer
- [x] Create `src/components/diff-viewer.tsx` component - Frontend Developer
- [x] Style diff with Tailwind CSS (green/red/neutral colors) - Tailwind CSS Specialist
- [x] Add dark mode support - Tailwind CSS Specialist
- [x] Create `src/components/diff-viewer.test.tsx` - Jest Specialist
- [x] Update PR detail page to use DiffViewer - Frontend Developer
- [x] Test performance with 500-line diff - QA Lead

**TDD Workflow**:
- **RED Phase** (Day 1, 9-10 AM): Write 15 failing tests
  - Test line numbers, color coding, syntax highlighting, edge cases, responsive design
  - Run `npm test diff-viewer.test.tsx` → Expected: ❌ 15 failed, 0 passed
- **GREEN Phase** (Day 1, 10 AM-12 PM): Implement DiffViewer component
  - Use `react-diff-viewer-continued` library
  - Parse GitHub patch format, apply Prism.js highlighting
  - Run tests → Expected: ✅ 0 failed, 15 passed
- **REFACTOR Phase** (Day 1, 1-2 PM): Optimize and extract utilities
  - Extract `parsePatch()` to `src/lib/utils/diff-parser.ts`
  - Extract `detectLanguage()` to `src/lib/utils/language-detector.ts`
  - Add memoization with `useMemo`
  - Run tests → Expected: ✅ 0 failed, 15 passed (still passing)

**Definition of Done**:
- [ ] All acceptance criteria met
- [ ] TDD RED-GREEN-REFACTOR complete
- [ ] Tests pass (>= 95% coverage for DiffViewer)
- [ ] Code reviewed by Lead Engineer
- [ ] Zero TypeScript errors
- [ ] Documentation updated (JSDoc comments)

---

### User Story #2: Basic Comment Threading System

**Priority**: P1 (High)
**Story Points**: 6
**Assigned To**: Full-Stack Developer, PostgreSQL Specialist, React Testing Library Specialist
**Estimated Time**: 6 hours

**User Story**:
> As a team member reviewing a pull request, I want to add comments to PRs and reply to others' comments, so that we can discuss code changes, ask questions, and collaborate in context.

**Acceptance Criteria**:
- [ ] Comment input box appears on PR detail page
- [ ] Users can submit comments with markdown support
- [ ] Comments display below PR description
- [ ] Each comment shows avatar, username, timestamp
- [ ] Users can reply to existing comments (nested threading, max depth 3)
- [ ] Comments sync in real-time (2s polling, matching presence/cursor architecture)
- [ ] Comment count badge shows total comments on PR
- [ ] Empty state message when no comments exist
- [ ] Comment submission validates (non-empty, max 10,000 characters)
- [ ] Comment timestamps use relative format ("2 minutes ago")

**Technical Tasks**:
- [x] Create database migration `004_create_comments_table.sql` - PostgreSQL Specialist
- [x] Add RLS policies (SELECT, INSERT, UPDATE, DELETE) - PostgreSQL Specialist
- [x] Create `src/lib/supabase/comments.ts` (database queries) - Full-Stack Developer
- [x] Create `src/lib/hooks/use-comments.ts` (polling hook) - Full-Stack Developer
- [x] Create `src/components/comment-input.tsx` - Full-Stack Developer
- [x] Create `src/components/comment-item.tsx` - Full-Stack Developer
- [x] Create `src/components/comment-thread.tsx` - Full-Stack Developer
- [x] Add comment section to PR detail page - Full-Stack Developer
- [x] Write hook tests `use-comments.test.ts` - Jest Specialist
- [x] Write component tests (3 files) - React Testing Library Specialist
- [x] Test RLS policies with multi-user accounts - PostgreSQL Specialist

**TDD Workflow**:
- **RED Phase** (Day 2, 9-10:30 AM): Write 42 failing tests
  - Hook tests: 12 tests (fetch, create, delete, polling, optimistic updates)
  - Component tests: 30 tests (input validation, rendering, interactions)
  - Run `npm test comment-*.test.*` → Expected: ❌ 42 failed, 0 passed
- **GREEN Phase** (Day 2, 10:30 AM-4 PM): Implement comment system
  - Database migration (30 min)
  - Backend implementation: hooks + API (1.5 hours)
  - Frontend implementation: components (1.5 hours)
  - Integration with PR page (30 min)
  - Run tests → Expected: ✅ 0 failed, 42 passed
- **REFACTOR Phase** (Day 2, 4-5 PM): Optimize
  - Extract `buildCommentTree()` to `src/lib/utils/comment-threading.ts`
  - Extract `formatRelativeTime()` to `src/lib/utils/date-formatter.ts`
  - Add memoization for comment tree and markdown rendering
  - Run tests → Expected: ✅ 0 failed, 42 passed (still passing)

**Definition of Done**:
- [ ] All acceptance criteria met
- [ ] TDD RED-GREEN-REFACTOR complete
- [ ] Tests pass (>= 90% coverage for hooks, >= 85% for components)
- [ ] Code reviewed by Lead Engineer
- [ ] Zero TypeScript errors
- [ ] Database migration tested (up/down)
- [ ] RLS policies verified (users can only edit/delete own comments)
- [ ] Real-time sync tested with 2+ browser windows
- [ ] Documentation updated (JSDoc comments)

---

### User Story #3: Core Test Coverage for Production Readiness

**Priority**: P2 (Medium)
**Story Points**: 4
**Assigned To**: Jest Specialist, React Testing Library Specialist, QA Lead
**Estimated Time**: 4 hours

**User Story**:
> As a developer, I want core features tested with >= 80% coverage, so that we can confidently deploy to production and prevent regressions.

**Acceptance Criteria**:
- [ ] All custom hooks have unit tests (>= 90% coverage)
- [ ] All React components have component tests (>= 85% coverage)
- [ ] Integration tests cover real-time flows (presence, cursors, comments)
- [ ] Overall coverage >= 80% for core features
- [ ] Tests run in CI/CD pipeline (if configured)
- [ ] All tests pass on `npm test`
- [ ] Coverage report generated (`npm run test:coverage`)
- [ ] Test documentation added to README

**Technical Tasks**:
- [x] Update `jest.config.js` with coverage thresholds - Jest Specialist
- [x] Create `setupTests.ts` (test environment setup) - Jest Specialist
- [x] Write hook tests (3 files): use-presence, use-cursors, use-comments - Jest Specialist
- [x] Write component tests (7 files): LiveCursor, CursorsLayer, PresenceIndicator, DiffViewer, CommentInput, CommentItem, CommentThread - React Testing Library Specialist
- [x] Write integration tests (2 files): cursor-tracking, comment-sync - React Testing Library Specialist
- [x] Generate coverage report and validate >= 80% - QA Lead
- [x] Update README with testing instructions - QA Lead

**TDD Workflow**:
- **RED Phase** (Day 2, 6-7 PM): Write 30 tests for existing features
  - Hooks: use-presence (10), use-cursors (10)
  - Components: LiveCursor (4), CursorsLayer (3), PresenceIndicator (3)
  - Run tests → Expected: ✅ 0 failed, 30 passed (already implemented)
- **GREEN Phase** (Day 2, 7-8:30 PM): Tests already pass (existing features)
  - No new implementation needed
  - Verify all tests pass
- **REFACTOR Phase** (Day 2, 8:30-9 PM): Improve existing code
  - Optimize presence/cursor hooks if needed
  - Run tests → Expected: ✅ 0 failed, 30 passed
- **Integration Tests** (Day 3, 9-10 AM): Write and run 5 integration tests
  - Cursor tracking flow (3 tests)
  - Comment sync flow (2 tests)
  - Run tests → Expected: ✅ 0 failed, 5 passed

**Definition of Done**:
- [ ] All test files created and passing (92 total tests)
- [ ] Coverage >= 80% for core features (global), >= 90% for hooks, >= 85% for components
- [ ] Zero TypeScript errors
- [ ] Tests run on `npm test` without failures
- [ ] Coverage report reviewed by QA Lead
- [ ] Test documentation added to README
- [ ] CI/CD integration documented (even if not configured yet)

---

### User Story #4: Error Handling and Edge Cases

**Priority**: P2 (Medium)
**Story Points**: 2
**Assigned To**: Frontend Developer, Full-Stack Developer
**Estimated Time**: 2 hours

**User Story**:
> As a user, I want clear error messages and graceful degradation, so that I understand what went wrong and the app doesn't crash.

**Acceptance Criteria**:
- [ ] API errors display user-friendly messages (not raw error text)
- [ ] Network failures show "Connection lost" toast with retry button
- [ ] Invalid PR IDs show 404 page with navigation back
- [ ] Rate limit errors show "Rate limited, try again in X minutes"
- [ ] Loading states displayed for all async operations (spinners, skeletons)
- [ ] Error boundaries catch React errors and show fallback UI
- [ ] Console errors logged for debugging (but not shown to users)

**Technical Tasks**:
- [x] Create `src/components/error-boundary.tsx` - Frontend Developer
- [x] Add error boundaries to PR detail page (3 sections: diffs, comments, presence) - Frontend Developer
- [x] Add toast notifications for errors - Frontend Developer
- [x] Add loading skeletons for async content - Frontend Developer
- [x] Test error scenarios (network throttle, invalid data) - QA Lead

**Definition of Done**:
- [ ] All acceptance criteria met
- [ ] Error scenarios tested manually
- [ ] Error boundary implemented
- [ ] Toast notifications for transient errors
- [ ] 404 page for invalid routes

---

### User Story #5: Documentation for Handoff

**Priority**: P2 (Medium)
**Story Points**: 2
**Assigned To**: QA Lead, Lead Engineer
**Estimated Time**: 2 hours

**User Story**:
> As a developer taking over this project, I want clear documentation of architecture, setup, and deployment, so that I can onboard quickly and maintain the dashboard.

**Acceptance Criteria**:
- [ ] README updated with detailed setup instructions
- [ ] ARCHITECTURE.md created with system design diagrams
- [ ] DEPLOYMENT.md created with deployment steps
- [ ] API.md created with Supabase schema and queries
- [ ] CONTRIBUTING.md created with development workflow
- [ ] All environment variables documented
- [ ] Screenshots added to README for visual reference

**Technical Tasks**:
- [x] Update README with features, setup, testing - QA Lead
- [x] Create TESTING.md with test strategy - QA Lead
- [x] Update API.md with comments schema - Lead Engineer
- [x] Add screenshots to README - QA Lead

**Definition of Done**:
- [ ] All documentation files created
- [ ] README includes screenshots
- [ ] Architecture diagrams added (Mermaid or images)
- [ ] Deployment tested following new guide
- [ ] Reviewed by Product Owner

---

## 🛠️ Technical Approach

### Architecture Overview

**Current Architecture**:
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
                │   (polling)    │  │   (polling)    │  │  (polling)  │
                └────────────────┘  └────────────────┘  └─────────────┘
                                                              NEW!
```

**Key Decisions** (from Lead Engineer):
1. **Diff Library**: Use `react-diff-viewer-continued` (React-native, easy integration, 50KB bundle)
2. **Comment Polling**: 2s interval (consistent with presence/cursors)
3. **Threading Depth**: Max 3 levels (UI complexity constraint)
4. **Optimistic Updates**: Yes, for comments (instant feedback for author)
5. **Comment Edit/Delete**: Include delete (30 min), defer edit to post-MVP
6. **Markdown Preview**: Defer to post-MVP (not critical, 2-3 hour addition)
7. **Virtual Scrolling**: Defer to post-MVP (most PRs < 20 files)

### New Components

**Diff Rendering**:
- `src/components/diff-viewer.tsx` - Main diff component
- `src/lib/utils/diff-parser.ts` - Patch parsing utility
- `src/lib/utils/language-detector.ts` - File extension → language mapping
- `src/types/diff.ts` - TypeScript interfaces

**Comment System**:
- `supabase/migrations/004_create_comments_table.sql` - Database schema
- `src/lib/supabase/comments.ts` - Database queries
- `src/lib/hooks/use-comments.ts` - Real-time polling hook
- `src/components/comment-input.tsx` - Input with validation
- `src/components/comment-item.tsx` - Individual comment display
- `src/components/comment-thread.tsx` - Threaded comment list
- `src/lib/utils/comment-threading.ts` - Threading logic utility
- `src/types/comments.ts` - TypeScript interfaces

**Testing Infrastructure**:
- `jest.config.js` - Coverage thresholds (80% global, 90% hooks, 85% components)
- `setupTests.ts` - Test environment setup (mocks for window.matchMedia, IntersectionObserver, etc.)
- 12 test files (3 hooks + 7 components + 2 integration)

### Database Schema

**Comments Table** (`supabase/migrations/004_create_comments_table.sql`):
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,  -- Format: "owner/repo/123"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_pr_id ON comments(pr_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_pr_created ON comments(pr_id, created_at DESC);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by all authenticated users"
  ON comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Library Choices

**Diff Rendering**:
- `react-diff-viewer-continued` (50KB) - Actively maintained React component
- `prismjs` - Syntax highlighting (10 languages: JS, TS, Python, Go, Java, CSS, HTML, JSON, Markdown, YAML)

**Markdown Rendering**:
- `react-markdown` with `remark-gfm` - Sanitized markdown rendering for comments

**Testing**:
- `jest` - Test runner
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation

---

## 🧪 Test Strategy

### Test Pyramid

```
                  /\
                 /  \
                / E2E \          5% (2 tests) - Full user flows
               /______.\
              /        \
             / Integr.  \        15% (5 tests) - Component + database
            /____________\
           /              \
          /   Unit Tests   \     80% (85 tests) - Hooks, components
         /__________________\
```

**Total Tests**: 92 tests
- **Unit Tests**: 85 tests (15 diff + 42 comments + 28 existing features)
- **Integration Tests**: 5 tests (3 cursor tracking + 2 comment sync)
- **E2E Tests**: 2 tests (manual testing by QA Lead)

### TDD Workflow (RED → GREEN → REFACTOR)

**RED Phase**: Write failing tests FIRST
- All tests fail (implementation doesn't exist)
- Expected: ❌ X failed, 0 passed
- Validates test correctness

**GREEN Phase**: Minimal implementation to pass tests
- Write just enough code to make tests pass
- Expected: ✅ 0 failed, X passed
- Validates feature completeness

**REFACTOR Phase**: Optimize without breaking tests
- Extract utilities, add memoization, improve types
- Expected: ✅ 0 failed, X passed (still passing)
- Validates code quality

### Coverage Targets

**Global**: >= 80% (branches, functions, lines, statements)
**Hooks** (`src/lib/hooks/`): >= 90%
**Components** (`src/components/`): >= 85%
**Utilities** (`src/lib/utils/`): >= 85%

### Test Files

**Diff Rendering** (15 tests):
- `src/components/diff-viewer.test.tsx`

**Comment System** (42 tests):
- `src/lib/hooks/use-comments.test.ts` (12 tests)
- `src/components/comment-input.test.tsx` (10 tests)
- `src/components/comment-item.test.tsx` (10 tests)
- `src/components/comment-thread.test.tsx` (10 tests)

**Existing Features** (30 tests):
- `src/lib/hooks/use-presence.test.ts` (10 tests)
- `src/lib/hooks/use-cursors.test.ts` (10 tests)
- `src/components/live-cursor.test.tsx` (4 tests)
- `src/components/cursors-layer.test.tsx` (3 tests)
- `src/components/presence-indicator.test.tsx` (3 tests)

**Integration** (5 tests):
- `src/__tests__/integration/cursor-tracking.test.tsx` (3 tests)
- `src/__tests__/integration/comment-sync.test.tsx` (2 tests)

---

## ✅ Definition of Done

### Per-Story DoD

For each user story to be considered "done":
- [ ] All acceptance criteria met
- [ ] TDD RED-GREEN-REFACTOR complete
- [ ] Tests pass (>= 80% coverage for new code, >= 90% for hooks, >= 85% for components)
- [ ] Code reviewed by Lead Engineer
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] Zero ESLint errors (`npm run lint`)
- [ ] Documentation updated (if user-facing feature)

### Per-Sprint DoD

For the sprint to be considered "complete":
- [ ] Sprint goal achieved (diff rendering, comments, tests complete)
- [ ] All P0 stories complete (diff rendering, comments)
- [ ] Demo-ready (all features work end-to-end)
- [ ] >= 80% test coverage (92 tests passing)
- [ ] Zero TypeScript errors
- [ ] Zero build errors (`npm run build`)
- [ ] Performance targets met (diff < 500ms, sync < 2s)
- [ ] Accessibility validated (axe DevTools: 0 critical/serious issues)
- [ ] Sprint retrospective conducted

---

## 🚨 Risks & Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Diff library incompatibility** | HIGH - May need custom renderer | LOW - react-diff-viewer-continued is proven | Test library with sample patch before full implementation. Fallback: Use diff2html (more complex). | Frontend Developer |
| **Comment polling overload** | MEDIUM - High server costs | MEDIUM - Possible at scale | Monitor Supabase dashboard for query load. Implement incremental fetching (only new comments). Increase interval to 5s if needed. | Full-Stack Developer |
| **Test coverage gaps** | MEDIUM - May not reach 80% | MEDIUM - 4 hours may not be enough | Prioritize hook tests first (highest value). Defer integration tests if time runs out. Lower threshold to 70% if necessary. | Jest/RTL Specialists |
| **RLS policy bugs** | HIGH - Users could access others' data | LOW - Policies tested in prior migrations | Test RLS with 2+ user accounts. Verify users cannot query others' data. Use Supabase RLS simulator. | PostgreSQL Specialist |
| **Optimistic update race conditions** | MEDIUM - Comment appears twice | MEDIUM - Poll during submit | Use temporary UUIDs for optimistic comments. Deduplicate by ID in local state. | Full-Stack Developer |
| **Performance regression (large PRs)** | MEDIUM - Slow rendering | LOW - Most PRs < 20 files | Implement collapsible diffs (render on expand). Test with 50-file PR. Monitor LCP with Vercel Analytics. | Lead Engineer |

---

## 📅 Daily Standup Schedule

**Time**: 9:00 AM PST daily
**Duration**: 15 minutes max
**Format**: 3 questions (round-robin)
- What did I do yesterday?
- What will I do today?
- Any blockers?

**Attendees**: All 8 specialists + Scrum Master

**Standup Schedule**:
- [ ] Day 1 standup (9 AM) - Status: Diff rendering in progress
- [ ] Day 2 standup (9 AM) - Status: Comments system starts
- [ ] Day 3 standup (9 AM) - Status: Integration & polish

---

## 📊 Day-by-Day Timeline

### Day 1: Diff Rendering (6 hours)

**Goal**: Replace raw patch display with syntax-highlighted diff viewer

| Time | Phase | Activity | Expected Outcome | Assigned To |
|------|-------|----------|------------------|-------------|
| **9:00 AM - 10:00 AM** | RED | Write 15 failing tests for DiffViewer | ❌ 15 failed, 0 passed | Jest Specialist |
| **10:00 AM - 12:00 PM** | GREEN | Implement DiffViewer component | ✅ 0 failed, 15 passed | Frontend Developer + Tailwind CSS Specialist |
| **12:00 PM - 1:00 PM** | **LUNCH** | Break | - | All |
| **1:00 PM - 2:00 PM** | REFACTOR | Extract utilities, optimize, memoize | ✅ 0 failed, 15 passed | Frontend Developer + TypeScript Specialist |
| **2:00 PM - 4:00 PM** | VALIDATE | Integration testing, manual QA | Diff renders in PR page, performance validated | Frontend Developer + QA Lead |
| **4:00 PM - 5:00 PM** | REVIEW | Code review with Lead Engineer | All feedback addressed | Lead Engineer |

**Deliverables**:
- ✅ `src/components/diff-viewer.tsx` (component)
- ✅ `src/components/diff-viewer.test.tsx` (15 tests passing)
- ✅ `src/lib/utils/diff-parser.ts` (utility)
- ✅ `src/lib/utils/language-detector.ts` (utility)
- ✅ Updated PR detail page (DiffViewer integrated)

**Success Metrics**:
- 15/15 tests pass
- Coverage >= 95% for DiffViewer
- 500-line diff renders in < 500ms
- Zero TypeScript errors

---

### Day 2: Comment System (10 hours)

**Goal**: Implement real-time comment threading system

| Time | Phase | Activity | Expected Outcome | Assigned To |
|------|-------|----------|------------------|-------------|
| **9:00 AM - 10:30 AM** | RED | Write 42 failing tests (hooks + components) | ❌ 42 failed, 0 passed | Jest Specialist + React Testing Library Specialist |
| **10:30 AM - 12:00 PM** | GREEN | Database migration + RLS policies | Migration applied, schema validated | PostgreSQL Specialist |
| **12:00 PM - 1:00 PM** | **LUNCH** | Break | - | All |
| **1:00 PM - 4:00 PM** | GREEN | Implement comment components + hooks | ✅ 0 failed, 42 passed | Full-Stack Developer |
| **4:00 PM - 5:00 PM** | REFACTOR | Extract threading utils, optimize | ✅ 0 failed, 42 passed | Full-Stack Developer + TypeScript Specialist |
| **6:00 PM - 9:00 PM** | RED/GREEN | Tests for existing features (presence, cursors) | ✅ 0 failed, 30 passed | Jest Specialist + React Testing Library Specialist |

**Deliverables**:
- ✅ `supabase/migrations/004_create_comments_table.sql` (migration)
- ✅ `src/lib/hooks/use-comments.ts` (hook, 12 tests passing)
- ✅ `src/lib/supabase/comments.ts` (database queries)
- ✅ `src/components/comment-input.tsx` (component, 10 tests passing)
- ✅ `src/components/comment-item.tsx` (component, 10 tests passing)
- ✅ `src/components/comment-thread.tsx` (component, 10 tests passing)
- ✅ `src/lib/utils/comment-threading.ts` (utility)
- ✅ `src/lib/utils/date-formatter.ts` (utility)
- ✅ Updated PR detail page (comment section integrated)
- ✅ Hook tests: `use-presence.test.ts`, `use-cursors.test.ts` (20 tests passing)
- ✅ Component tests: `live-cursor.test.tsx`, `cursors-layer.test.tsx`, `presence-indicator.test.tsx` (10 tests passing)

**Success Metrics**:
- 72/72 tests pass (42 comments + 30 existing)
- Coverage >= 90% for hooks, >= 85% for components
- Real-time sync works (2s latency)
- Zero TypeScript errors

---

### Day 3: Integration & Polish (8 hours)

**Goal**: Finalize MVP with integration tests, error handling, and documentation

| Time | Phase | Activity | Expected Outcome | Assigned To |
|------|-------|----------|------------------|-------------|
| **9:00 AM - 12:00 PM** | INTEGRATION | Integration tests + error handling + accessibility | ✅ 5 integration tests pass, error boundaries work, axe audit passes | React Testing Library Specialist + Frontend Developer + QA Lead |
| **12:00 PM - 1:00 PM** | **LUNCH** | Break | - | All |
| **1:00 PM - 3:00 PM** | DOCS | Documentation updates (README, TESTING.md, API.md) | All docs complete, screenshots added | QA Lead + Lead Engineer |
| **3:00 PM - 5:00 PM** | DEMO | Sprint Review + Demo (show working features) | Product Owner approves, stakeholders see features | All (demo to Product Owner) |
| **5:00 PM - 6:00 PM** | RETRO | Sprint Retrospective (lessons learned) | Action items for next sprint | All (facilitated by Scrum Master) |

**Deliverables**:
- ✅ `src/__tests__/integration/cursor-tracking.test.tsx` (3 tests passing)
- ✅ `src/__tests__/integration/comment-sync.test.tsx` (2 tests passing)
- ✅ `src/components/error-boundary.tsx` (error handling)
- ✅ Error boundaries added to PR detail page (3 sections)
- ✅ Toast notifications for errors
- ✅ Accessibility fixes (WCAG 2.1 AA compliance)
- ✅ Updated README.md (features, setup, testing, screenshots)
- ✅ TESTING.md (test strategy documentation)
- ✅ Updated API.md (comments schema, RLS policies)
- ✅ Coverage report (>= 80% validated)

**Success Metrics**:
- 92/92 tests pass (all tests)
- Coverage >= 80% (global), >= 90% (hooks), >= 85% (components)
- axe DevTools: 0 critical/serious issues
- Lighthouse accessibility >= 90
- Demo-ready (all features work end-to-end)
- Zero TypeScript errors
- Zero build errors

---

## 📆 Sprint Ceremonies

### Sprint Planning (Day 0)

**Status**: COMPLETE

- [x] Product Owner presents user stories → `user_stories_sprint_2_mvp.md`
- [x] Business Analyst refines requirements → `refined_requirements_sprint_2_mvp.md`
- [x] Lead Engineer creates technical design → `technical_design_sprint_2_mvp.md`
- [x] QA Lead creates test strategy → `test_strategy_sprint_2_mvp.md`
- [x] Scrum Master creates this sprint plan → `sprint_plan_sprint_2_mvp.md`

### Daily Standup (Days 1-3)

**Format**: 3 questions (What did I do? What will I do? Blockers?)
**Duration**: 15 minutes max
**Time**: 9:00 AM PST daily

- [ ] Day 1 standup (9 AM) - Status: Starting diff rendering
- [ ] Day 2 standup (9 AM) - Status: Starting comment system
- [ ] Day 3 standup (9 AM) - Status: Integration & polish

### Sprint Review (Day 3, 3 PM)

**Demo Agenda**:
- [ ] Demo diff rendering (syntax highlighting, line numbers, color coding)
  - Show TypeScript file with additions/deletions
  - Show dark mode support
  - Show mobile responsive view
- [ ] Demo comment system (add comment, reply, real-time sync)
  - Add top-level comment (show optimistic update)
  - Add reply (show threading with indent)
  - Open second browser window (show real-time sync)
  - Delete comment (show confirmation modal)
- [ ] Demo presence + cursors (multi-window testing)
  - Open 2 browser windows
  - Move cursor in Window A (show in Window B)
  - Show avatar stack with multiple viewers
- [ ] Show test coverage report (>= 80%)
  - Open `coverage/lcov-report/index.html`
  - Show 92/92 tests passing
  - Show coverage percentages (global 80%, hooks 90%, components 85%)
- [ ] Show performance metrics
  - Lighthouse report (accessibility >= 90)
  - 500-line diff rendering time (< 500ms)

**Attendees**: All 8 specialists + Scrum Master + Product Owner + Stakeholders

### Sprint Retrospective (Day 3, 5 PM)

**Agenda**:
1. **What went well?** (celebrate successes)
2. **What could be improved?** (identify pain points)
3. **Action items for next sprint** (if any)

**Format**: Start-Stop-Continue
- What should we **start** doing?
- What should we **stop** doing?
- What should we **continue** doing?

**Duration**: 60 minutes
**Facilitator**: Scrum Master
**Attendees**: All 8 specialists + Scrum Master

---

## 📈 Success Metrics

### Sprint is SUCCESSFUL when:

**Feature Completion**:
1. ✅ All P0 stories complete (diff rendering, comments)
2. ✅ All acceptance criteria met (100% for P0/P1 stories)
3. ✅ Demo-ready (all features work end-to-end)

**Quality Metrics**:
1. ✅ Test pass rate: 100% (92/92 tests passing)
2. ✅ Coverage: >= 80% (global), >= 90% (hooks), >= 85% (components)
3. ✅ TypeScript errors: 0
4. ✅ Build errors: 0
5. ✅ ESLint errors: 0
6. ✅ axe DevTools: 0 critical/serious accessibility issues
7. ✅ Lighthouse accessibility score: >= 90

**Performance Benchmarks**:
1. ✅ Diff rendering: < 500ms (500-line diff, p95)
2. ✅ Comment sync: < 2s latency (p95)
3. ✅ Initial page load: < 3s TTI (p95)
4. ✅ Database queries: < 100ms (p95)
5. ✅ Build time: < 2 min
6. ✅ Test suite time: < 30s

**Documentation**:
1. ✅ README updated (features, setup, testing, screenshots)
2. ✅ TESTING.md created (test strategy)
3. ✅ API.md updated (comments schema, RLS policies)
4. ✅ All environment variables documented

### Validation Checklist

**Before declaring sprint complete**:

**Tests**:
- [ ] Run `npm test` → Expected: 92 passed, 0 failed
- [ ] Run `npm run test:coverage` → Expected: >= 80% coverage (all thresholds met)
- [ ] Verify coverage report: `open coverage/lcov-report/index.html`

**Build**:
- [ ] Run `tsc --noEmit` → Expected: 0 errors
- [ ] Run `npm run lint` → Expected: 0 errors
- [ ] Run `npm run build` → Expected: Build succeeds in < 2 min

**Performance**:
- [ ] Test 500-line diff rendering → Expected: < 500ms (Chrome DevTools Performance)
- [ ] Test comment sync (2 browsers) → Expected: < 2s latency (stopwatch)
- [ ] Run Lighthouse audit → Expected: Performance >= 90, Accessibility >= 90

**Accessibility**:
- [ ] Run axe DevTools audit → Expected: 0 critical/serious issues
- [ ] Test keyboard navigation → Expected: All interactive elements accessible via Tab
- [ ] Test with screen reader (NVDA) → Expected: Dynamic changes announced

**Manual Testing** (QA Lead Checklist):
- [ ] Diff rendering works for TypeScript file (syntax highlighting)
- [ ] Diff rendering works for Python file (language detection)
- [ ] Diff rendering handles binary file (shows "Binary file" message)
- [ ] Diff rendering handles 1000+ line diff (performance < 500ms)
- [ ] Comment system: Add comment → appears immediately (optimistic update)
- [ ] Comment system: Reply to comment → threading works (indent 40px)
- [ ] Comment system: Delete comment → confirmation modal appears
- [ ] Real-time sync: Open 2 browsers → comment appears in Window B within 2s
- [ ] Cursors: Move cursor in Window A → appears in Window B
- [ ] Presence: Multiple users → avatar stack shows all users

---

## 🎯 Next Steps

**After Sprint Planning Complete** (NOW):
1. [x] Product Owner creates user stories → COMPLETE
2. [x] Business Analyst refines requirements → COMPLETE
3. [x] Lead Engineer creates technical design → COMPLETE
4. [x] QA Lead creates test strategy → COMPLETE
5. [x] Scrum Master creates sprint plan → COMPLETE (this document)

**Ready for Execution**: YES

**First Action** (Day 1, 9:00 AM):
- Jest Specialist: Begin TDD RED Phase
- Create `src/components/diff-viewer.test.tsx`
- Write 15 failing tests for DiffViewer component
- Run `npm test diff-viewer.test.tsx` → Expect: ❌ 15 failed, 0 passed

**Communication**:
- [ ] Share this sprint plan with all team members
- [ ] Schedule Day 1 standup (9 AM PST)
- [ ] Set up Slack/Discord channel for sprint updates
- [ ] Prepare demo environment for Sprint Review

---

**Status**: READY FOR EXECUTION

**Sprint Start Date**: January 11, 2026 (9:00 AM PST)
**Sprint End Date**: January 13, 2026 (6:00 PM PST)

**Total Estimated Hours**: 18 hours (6 hours/day × 3 days)

**Team Ready**: 8 specialists assigned and onboarded

**Let's ship this MVP! 🚀**
