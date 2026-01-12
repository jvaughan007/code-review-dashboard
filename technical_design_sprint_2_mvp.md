# Sprint 2: MVP Completion - Technical Design

**Sprint Goal**: Complete MVP features (diff rendering, comments, tests) to make dashboard production-ready for demo and handoff

**Designed For**: `user_stories_sprint_2_mvp.md` (5 user stories)

**Created By**: Lead Engineer (agile-team)
**Date**: 2026-01-11
**Sprint Duration**: 2-3 days (18 hours estimated)

---

## Architecture Overview

### Current Architecture

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

### Key Architectural Principles

1. **Server-Side Rendering (SSR)**: PR detail page uses Next.js SSR for initial load
2. **Polling-Based Real-Time**: All real-time features use 2-second polling (no WebSockets)
3. **Client-Side State**: React hooks manage local state, Supabase for persistence
4. **GitHub as Source of Truth**: PR data comes from GitHub API, not cached locally
5. **Row-Level Security (RLS)**: All Supabase tables enforce user-level access control

### New Components for Sprint 2

```
Sprint 2 Additions:
├── DiffViewer Component (replaces raw <pre> patch display)
├── Comment System (CommentInput, CommentThread, CommentItem)
├── Comments Database Table (with RLS policies)
└── Test Infrastructure (Jest + React Testing Library)
```

### Integration Points

1. **PR Detail Page** (`src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`)
   - Integrates DiffViewer (lines 153-159)
   - Integrates Comment System (below Files Changed section)

2. **Supabase Database**
   - New migration: `004_create_comments_table.sql`
   - New hook: `use-comments.ts`

3. **Existing Real-Time Features**
   - Presence polling (2s interval) - NO CHANGES
   - Cursor polling (2s interval) - NO CHANGES
   - Comments will use same polling pattern for consistency

---

## Multi-Domain Detection ⭐ CRITICAL

### Domains Involved

Based on analysis of 5 user stories, the following technical domains are involved:

- ✅ **Frontend/React Development** → Frontend Developer
  - Diff rendering component (Story #1)
  - Comment UI components (Story #2)
  - Error boundaries (Story #4)

- ✅ **Backend/Database** → PostgreSQL Specialist
  - Comments table schema (Story #2)
  - RLS policies (Story #2)
  - Database indexes (Story #2)
  - Migration idempotency (Story #2)

- ✅ **Full-Stack Integration** → Full-Stack Developer
  - End-to-end comment flow (database → API → UI)
  - Real-time polling hook (Story #2)
  - Optimistic updates (Story #2)

- ✅ **Testing & TDD** → Jest Specialist + React Testing Library Specialist
  - Hook unit tests (Story #3)
  - Component tests (Story #3)
  - Integration tests (Story #3)
  - Coverage configuration (Story #3)

- ✅ **UI/Accessibility & Styling** → Tailwind CSS Specialist
  - Diff color-coding (green/red/neutral) (Story #1)
  - Comment styling (Story #2)
  - WCAG 2.1 AA compliance (NFR-2)
  - Responsive design (Story #1)

- ✅ **TypeScript Type Safety** → TypeScript Specialist
  - DiffViewer props interface (Story #1)
  - Comment type definitions (Story #2)
  - Strict mode compliance (NFR-3.1)

- ✅ **State Management** → Frontend Developer
  - Comment local state (Story #2)
  - Polling cleanup (Story #2)

- ✅ **Performance Optimization** → Lead Engineer (code review)
  - Diff rendering performance (NFR-1.1)
  - Virtual scrolling decisions (Q12)
  - Database query optimization (NFR-1.4)

---

## Specialist Assignments

### Frontend Developer

**Responsibilities**:
1. Implement `DiffViewer` component (Story #1)
   - Integrate diff rendering library (react-diff-viewer-continued or diff2html)
   - Syntax highlighting setup
   - Line number display
   - Color-coded change indicators
   - Responsive layout (side-by-side vs unified)
2. Implement Comment UI components (Story #2)
   - `CommentInput` with validation and markdown support
   - `CommentItem` with avatar, timestamp, actions
   - Empty states and loading states
3. Error boundary implementation (Story #4)
4. Component accessibility (keyboard navigation, ARIA labels)

**Deliverables**:
- `src/components/diff-viewer.tsx`
- `src/components/comment-input.tsx`
- `src/components/comment-item.tsx`
- `src/components/error-boundary.tsx`

**Estimated Time**: 8 hours

---

### Full-Stack Developer

**Responsibilities**:
1. End-to-end comment system integration (Story #2)
   - Database queries (`src/lib/supabase/comments.ts`)
   - Real-time polling hook (`src/lib/hooks/use-comments.ts`)
   - Optimistic updates logic
   - Comment threading logic (parent-child relationships)
2. PR detail page integration
   - Wire up DiffViewer to file.patch data
   - Wire up Comment system to PR page
   - Error handling and retry logic
3. Integration with existing presence/cursor architecture

**Deliverables**:
- `src/lib/hooks/use-comments.ts`
- `src/lib/supabase/comments.ts`
- Updated `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`
- `src/components/comment-thread.tsx`

**Estimated Time**: 6 hours

---

### PostgreSQL Specialist

**Responsibilities**:
1. Design comments table schema (Story #2)
   - Table structure with proper constraints
   - Foreign keys and cascade behavior
   - Check constraints for data validation
2. Create indexes for query performance (NFR-1.4)
   - Index on pr_id (most common WHERE clause)
   - Index on parent_comment_id (threading queries)
   - Index on created_at (chronological sorting)
   - Index on user_id (user's comments)
3. Implement RLS policies (NFR-5.1)
   - SELECT policy (all authenticated users can view)
   - INSERT policy (users can only create with their own user_id)
   - UPDATE policy (users can only edit own comments)
   - DELETE policy (users can only delete own comments)
4. Ensure migration idempotency (can run multiple times safely)
5. Test RLS policies with multiple user accounts

**Deliverables**:
- `supabase/migrations/004_create_comments_table.sql`
- Down migration (rollback script)
- RLS policy tests (manual verification checklist)

**Estimated Time**: 2 hours

---

### Tailwind CSS Specialist

**Responsibilities**:
1. Style DiffViewer component (Story #1)
   - Color scheme: green (additions), red (deletions), neutral (context)
   - Dark mode support for all colors
   - WCAG 2.1 AA contrast compliance (4.5:1 minimum)
   - Line number styling (distinct background, monospaced)
   - Syntax highlighting theme integration
2. Style Comment components (Story #2)
   - Comment thread indentation (40px per level)
   - Avatar styling (40x40px, rounded)
   - Timestamp styling (relative format)
   - Comment actions (edit/delete buttons)
   - Reply button styling
3. Responsive design
   - Side-by-side diff (desktop >= 1024px)
   - Unified diff (tablet/mobile < 1024px)
   - Comment threading on mobile

**Deliverables**:
- Tailwind classes for DiffViewer
- Tailwind classes for Comment components
- WCAG compliance verification (axe DevTools audit)

**Estimated Time**: 3 hours

---

### Jest Specialist

**Responsibilities**:
1. Configure Jest for React hooks testing (Story #3)
   - Update `jest.config.js` with coverage thresholds
   - Setup `setupTests.ts` with matchers
   - Configure TypeScript support for tests
2. Write hook unit tests
   - `src/lib/hooks/use-presence.test.ts`
   - `src/lib/hooks/use-cursors.test.ts`
   - `src/lib/hooks/use-comments.test.ts`
3. Mock Supabase client for isolated testing
4. Test polling behavior (intervals, cleanup)
5. Test optimistic updates (comments)
6. Ensure >= 90% coverage for hooks

**Deliverables**:
- `jest.config.js` with coverage thresholds
- `setupTests.ts`
- Hook test files (3 files)
- Supabase mock utilities

**Estimated Time**: 3 hours

---

### React Testing Library Specialist

**Responsibilities**:
1. Write component tests (Story #3)
   - `src/components/live-cursor.test.tsx`
   - `src/components/cursors-layer.test.tsx`
   - `src/components/presence-indicator.test.tsx`
   - `src/components/diff-viewer.test.tsx`
   - `src/components/comment-input.test.tsx`
   - `src/components/comment-thread.test.tsx`
   - `src/components/comment-item.test.tsx`
2. Test user interactions (clicks, keyboard, typing)
3. Test accessibility (ARIA labels, keyboard navigation)
4. Test conditional rendering (show/hide elements)
5. Ensure >= 85% coverage for components

**Deliverables**:
- Component test files (7 files)
- User interaction tests (userEvent)
- Accessibility tests

**Estimated Time**: 4 hours

---

### TypeScript Specialist

**Responsibilities**:
1. Define type-safe interfaces for new components
   - `DiffViewerProps` interface
   - `CommentProps` interface
   - `CommentInputProps` interface
   - `CommentThreadProps` interface
2. Define database types
   - `Comment` type (matching Supabase schema)
   - `CommentWithUser` type (joined with auth.users)
3. Ensure strict mode compliance (no `any` types)
4. Export all interfaces for reusability
5. Validate type coverage >= 95%

**Deliverables**:
- Type definitions in component files
- `src/types/comments.ts` (shared types)
- Zero TypeScript errors (`tsc --noEmit`)

**Estimated Time**: 1 hour

---

### QA Lead

**Responsibilities**:
1. Create TDD test strategy document (Story #3)
   - Test case templates
   - Coverage goals by domain
   - Integration test scenarios
2. Manual testing checklist
   - Diff rendering edge cases (binary files, large diffs)
   - Comment system flows (add, reply, edit, delete)
   - Real-time sync verification (2+ browsers)
   - Error handling scenarios (network failures, rate limits)
3. Accessibility audit
   - WCAG 2.1 AA compliance (axe DevTools)
   - Keyboard navigation testing
   - Screen reader testing (NVDA/JAWS)
4. Performance testing
   - Diff rendering (500-line, 5000-line)
   - Comment polling load
   - Page load times (Lighthouse)

**Deliverables**:
- Test strategy document
- Manual testing checklist
- Accessibility audit report
- Performance test results

**Estimated Time**: 2 hours

---

### Lead Engineer (Code Review & Architecture)

**Responsibilities**:
1. Answer 15 Business Analyst questions (see "Answers to BA Questions" section)
2. Review all code for:
   - Architecture alignment
   - Performance implications
   - Security vulnerabilities
   - TypeScript strict mode compliance
3. Code review checklist enforcement
   - Zero TypeScript errors
   - Zero lint errors
   - Tests pass with >= 80% coverage
   - No performance regressions
   - WCAG 2.1 AA compliance
4. Technical risk mitigation
5. Final integration testing
6. Documentation review

**Deliverables**:
- This technical design document
- Answers to 15 BA questions
- Code review approvals
- Risk mitigation plan

**Estimated Time**: 4 hours

---

## Answers to Business Analyst Questions

### Q1: Diff Rendering Library Choice

**Question**: Should we use `react-diff-viewer-continued` or `diff2html`?

**Answer**: Use **`react-diff-viewer-continued`**

**Rationale**:
- **React-Native**: Direct React component, no wrapper needed
- **Actively Maintained**: Forked from abandoned react-diff-viewer, currently maintained
- **Bundle Size**: ~50KB (acceptable), smaller than diff2html (~120KB)
- **Customization**: Supports custom styles via Tailwind (meets NFR-2.1)
- **Integration Speed**: 2 hours vs 4 hours for diff2html wrapper

**Trade-offs**:
- Less feature-rich than diff2html (no word-level diff highlighting)
- Acceptable for MVP: Word-level diff is "nice-to-have", not critical

**Action Items**:
- Install: `npm install react-diff-viewer-continued`
- Verify TypeScript definitions included
- Test with 500-line diff for performance validation

---

### Q2: Comment Polling Interval

**Question**: Should comments use 2s polling interval (like presence/cursors) or longer?

**Answer**: Use **2s polling interval** (same as presence/cursors)

**Rationale**:
- **Consistency**: Uniform polling strategy simplifies architecture
- **User Expectation**: Comments should sync as fast as presence/cursors
- **Server Load**: Acceptable (comments less frequent than cursor updates)
- **Implementation**: Reuse existing polling patterns from `use-presence.ts`

**Optimization**:
- Only fetch comments newer than last fetch timestamp (reduce payload)
- Index on `created_at DESC` for efficient queries
- Monitor server load; increase interval to 5s if issues arise

**Action Items**:
- Use same `setInterval(2000)` pattern as existing hooks
- Add timestamp-based incremental fetching
- Monitor Supabase dashboard for query performance

---

### Q3: Comment Threading Depth Limit

**Question**: What should be the maximum nesting depth for comment replies?

**Answer**: **3 levels** (top → reply → reply to reply)

**Rationale**:
- **UI Complexity**: Deep nesting (4+ levels) requires horizontal scrolling on mobile
- **User Behavior**: Most discussions resolve within 2-3 reply levels
- **Database Queries**: Recursive queries get complex beyond 3 levels
- **GitHub Pattern**: GitHub uses unlimited depth but UX suffers

**Implementation**:
- Hide "Reply" button when `depth >= 3`
- Display "Reply to top-level comment" message instead
- Database schema supports unlimited depth (no constraint), but UI enforces limit

**Action Items**:
- Track depth in component state (calculate from parent chain)
- Conditionally render Reply button: `{depth < 3 && <ReplyButton />}`
- Document depth limit in user-facing UI ("Max 3 reply levels")

---

### Q4: Test Priority Order

**Question**: What order should we write tests in (if time is limited)?

**Answer**: Priority order:
1. **Hook tests** (Highest value, easiest to write)
2. **Component tests** (Medium value, medium difficulty)
3. **Integration tests** (High value, time-consuming)

**Rationale**:
- **Hook Tests (Priority 1)**:
  - Hooks contain complex logic (polling, optimistic updates)
  - Easiest to test in isolation (no UI dependencies)
  - Highest bug risk (stateful logic)
  - Target: >= 90% coverage
  - Time: 3 hours

- **Component Tests (Priority 2)**:
  - Components contain presentation logic
  - Medium complexity (user interactions, conditional rendering)
  - Target: >= 85% coverage
  - Time: 4 hours

- **Integration Tests (Priority 3)**:
  - End-to-end flows validate user scenarios
  - Time-consuming (setup multi-user simulation)
  - Target: 2-3 critical flows (cursor tracking, comment sync)
  - Time: 1 hour (basic coverage)

**Fallback Plan** (if time runs out):
- Minimum: Hook tests + critical component tests (DiffViewer, CommentInput)
- Defer: Integration tests to post-MVP (not blocking for demo)

**Action Items**:
- Start with `use-comments.test.ts` (most complex hook)
- Then `use-cursors.test.ts` and `use-presence.test.ts`
- Then component tests in priority: DiffViewer, CommentInput, CommentThread

---

### Q5: Error Boundary Placement

**Question**: Where should we place error boundaries (how granular)?

**Answer**: **Option 2** - Boundaries for each section (diffs, comments, presence)

**Rationale**:
- **Isolated Failures**: One section failure doesn't crash entire page
- **User Experience**: User can still view diffs if comments fail
- **Recovery**: Easier to provide section-specific retry buttons
- **Complexity**: Acceptable (3 boundaries vs 1)

**Implementation**:
```tsx
<ErrorBoundary fallback={<DiffErrorFallback />}>
  <DiffViewer />
</ErrorBoundary>

<ErrorBoundary fallback={<CommentsErrorFallback />}>
  <CommentThread />
</ErrorBoundary>

<ErrorBoundary fallback={<PresenceErrorFallback />}>
  <PresenceIndicator />
  <CursorsLayer />
</ErrorBoundary>
```

**Fallback UI Components**:
- `DiffErrorFallback`: Show raw patch as fallback
- `CommentsErrorFallback`: Show "Comments unavailable" with retry button
- `PresenceErrorFallback`: Hide presence/cursors (graceful degradation)

**Action Items**:
- Create `src/components/error-boundary.tsx` (reusable component)
- Create fallback components for each section
- Log errors to console (and optionally Sentry if configured)

---

### Q6: Syntax Highlighting Languages

**Question**: Which programming languages should we support?

**Answer**: Support **10 core languages** (listed below)

**Supported Languages**:
1. JavaScript (.js, .jsx)
2. TypeScript (.ts, .tsx)
3. Python (.py)
4. Go (.go)
5. Java (.java)
6. CSS (.css, .scss)
7. HTML (.html)
8. JSON (.json)
9. Markdown (.md)
10. YAML (.yml, .yaml)

**Rationale**:
- **Coverage**: These 10 languages cover 90% of GitHub repositories
- **Bundle Size**: ~60KB total (acceptable for MVP)
- **Fallback**: Plain text rendering for unsupported languages (no errors)

**Implementation**:
- `react-diff-viewer-continued` uses Prism.js internally
- Import only needed languages (tree-shaking):
  ```typescript
  import Prism from 'prismjs';
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-typescript';
  // ... (8 more imports)
  ```

**Future Enhancements** (post-MVP):
- Auto-detect most common languages in team's repos
- Lazy-load languages on demand (code splitting)

**Action Items**:
- Import 10 Prism.js language modules
- Test syntax highlighting for each language
- Document supported languages in README

---

### Q7: Optimistic Updates for Comments

**Question**: Should we use optimistic updates for comments?

**Answer**: **Yes**, use optimistic updates

**Rationale**:
- **User Experience**: Instant feedback (comment appears immediately for author)
- **Perceived Performance**: Feels faster than 2s polling delay
- **Error Handling**: Rollback logic is simple (remove comment on error)
- **Proven Pattern**: Used in GitHub, Slack, Discord, Linear

**Implementation**:
1. **On Comment Submit**:
   - Generate temporary UUID for comment
   - Add comment to local state immediately (optimistic)
   - Send INSERT to Supabase
2. **On Success**:
   - Replace temporary UUID with real UUID from database
   - Next poll will fetch comment (validation)
3. **On Error**:
   - Remove comment from local state
   - Show error toast: "Failed to post comment. [Retry]"

**Error Handling**:
- Network errors: Retry with exponential backoff (1s, 2s, 4s)
- Validation errors: Show inline error message (don't retry)
- RLS errors: Show "Permission denied" (user logged out)

**Action Items**:
- Implement optimistic update in `use-comments.ts` hook
- Add rollback logic for failures
- Test with simulated network errors (throttle in DevTools)

---

### Q8: Comment Edit/Delete Features

**Question**: Should MVP include comment editing and deletion?

**Answer**: **Include basic delete, defer edit** to post-MVP

**Rationale for DELETE**:
- **User Expectation**: Users expect to delete their own comments
- **Low Complexity**: 1 SQL query (`DELETE FROM comments WHERE id = $1`)
- **RLS Policy**: Already designed (users can only delete own comments)
- **Implementation Time**: 30 minutes

**Rationale for DEFER EDIT**:
- **Complexity**: Editing requires:
  - "Edit" UI state (replace body with textarea)
  - "edited" indicator (show timestamp of edit)
  - Optional: Edit history (track changes over time)
- **Time Constraint**: 2-3 hour addition (not critical for MVP)
- **Workaround**: Users can delete and re-post (acceptable for MVP)

**MVP Implementation**:
- **Delete**: Show delete button (trash icon) for comment author
- **Edit**: Hide edit button (defer to post-MVP)

**Post-MVP Enhancement**:
- Add `updated_at` timestamp indicator: "(edited 2 minutes ago)"
- Add edit UI (textarea with Save/Cancel)
- Optional: Edit history table (track all revisions)

**Action Items**:
- Implement delete button with confirmation modal ("Are you sure?")
- Add RLS policy for DELETE (already in schema)
- Document edit feature as "planned post-MVP" in README

---

### Q9: Performance Monitoring

**Question**: Should we add performance monitoring (Vercel Analytics, Sentry)?

**Answer**: **Add Vercel Analytics** (free tier), **defer Sentry** to post-MVP

**Rationale for Vercel Analytics**:
- **Free Tier**: Included with Vercel hosting (no cost)
- **Web Vitals**: Tracks FCP, LCP, CLS, TTI (matches NFR-1.3)
- **Zero Config**: Enable in Vercel dashboard (no code changes)
- **Privacy**: First-party analytics (no third-party tracking)

**Rationale for DEFER Sentry**:
- **Cost**: Free tier limited (5,000 events/month)
- **Complexity**: Requires SDK integration and configuration
- **Value**: Low for MVP demo (console logs sufficient for debugging)
- **Privacy Concerns**: Sends stack traces to third party

**MVP Monitoring Strategy**:
1. **Vercel Analytics**: Enable for Web Vitals (NFR-1.3)
2. **Console Logging**: Log errors to console (browser DevTools)
3. **Supabase Dashboard**: Monitor query performance and RLS violations

**Post-MVP Enhancement**:
- Add Sentry for production error tracking
- Add custom performance metrics (diff rendering time, polling latency)

**Action Items**:
- Enable Vercel Analytics in Vercel dashboard (1-click)
- Add console.error() for all error boundaries
- Document Vercel Analytics setup in DEPLOYMENT.md

---

### Q10: Accessibility Audit Tool

**Question**: Which accessibility audit tool should we use?

**Answer**: Use **axe DevTools** (primary) + **Lighthouse** (secondary)

**Rationale**:
- **axe DevTools**:
  - Most comprehensive (WCAG 2.1 Level AA coverage)
  - Browser extension (Chrome/Firefox)
  - Manual testing (run on each page)
  - Free tier sufficient for MVP
  - Provides actionable recommendations

- **Lighthouse**:
  - Automated (can run in CI)
  - Scores accessibility 0-100
  - Built into Chrome DevTools (no install)
  - Catches common issues (contrast, ARIA labels)

**Testing Workflow**:
1. **Development**: Run axe DevTools after each feature
2. **Pre-Commit**: Run Lighthouse audit (target >= 90 score)
3. **Manual Testing**: Keyboard navigation, screen reader (NVDA)

**CI Integration** (post-MVP):
- Add Lighthouse CI to GitHub Actions
- Fail build if accessibility score < 90

**Action Items**:
- Install axe DevTools extension (Chrome/Firefox)
- Run axe audit on PR detail page (before/after Sprint 2)
- Fix all critical and serious issues (blocking for MVP)
- Document audit results in README

---

### Q11: Comment Markdown Preview

**Question**: Should comment input include live markdown preview?

**Answer**: **Defer to post-MVP** (not critical for MVP)

**Rationale for DEFER**:
- **Time Constraint**: 2-3 hours for split-pane layout (tabs or side-by-side)
- **User Workaround**: Users can post and see rendered markdown (then edit if needed)
- **Complexity**: Requires:
  - Tab UI (Write | Preview) or split-pane layout
  - Real-time markdown rendering (on every keystroke)
  - Responsive layout (tabs on mobile, split on desktop)
- **Lower Priority**: Diff rendering and tests are higher priority

**MVP Implementation**:
- **Write-Only Mode**: Single textarea, no preview
- **Markdown Hint**: Show hint text: "Supports **bold**, *italic*, `code`, [links](url)"

**Post-MVP Enhancement**:
- Add "Preview" tab (switch between Write and Preview)
- Or add side-by-side layout (Write | Preview, desktop only)
- Or add live preview below textarea (simple option)

**Action Items**:
- Show markdown syntax hint below textarea
- Document markdown support in placeholder text
- Add markdown preview to post-MVP roadmap

---

### Q12: Virtual Scrolling for Large PRs

**Question**: Should we implement virtual scrolling for PRs with many files?

**Answer**: **Defer to post-MVP** (not critical for MVP)

**Rationale for DEFER**:
- **Expected PR Size**: Most PRs have < 20 files (virtual scrolling overkill)
- **Performance**: Current implementation renders all files (acceptable up to 100 files)
- **Complexity**: Requires `react-window` or `react-virtualized` (2-3 hours integration)
- **Testing Burden**: Virtual scrolling adds test complexity

**MVP Implementation**:
- **Render All Files**: No virtual scrolling (simple implementation)
- **Lazy Rendering**: Optionally collapse diffs by default (expand on click)

**Performance Mitigation** (without virtual scrolling):
- Collapse all diffs by default (show file header + expand button)
- User expands individual files to view diffs
- Only render visible diffs (lazy rendering)

**Post-MVP Enhancement**:
- Add virtual scrolling if users encounter large PRs (100+ files)
- Monitor performance with Vercel Analytics (LCP metric)

**Action Items**:
- Implement collapsible diffs (show/hide on click)
- Test with 50-file PR for performance
- Document limitation in README: "Optimized for PRs < 100 files"

---

### Q13: Database Indexing Strategy

**Question**: Which columns should be indexed for optimal query performance?

**Answer**: Index **4 columns** (pr_id, parent_comment_id, created_at, user_id)

**Rationale**:

**Index #1: pr_id** (Most Important)
- **Query**: `SELECT * FROM comments WHERE pr_id = $1`
- **Frequency**: Every page load + every 2s poll
- **Cardinality**: High (thousands of unique PRs)
- **Performance Impact**: 10x faster queries (100ms → 10ms)

**Index #2: parent_comment_id**
- **Query**: `SELECT * FROM comments WHERE parent_comment_id = $1`
- **Frequency**: Threading queries (fetch replies)
- **Cardinality**: Medium (some comments have replies)
- **Performance Impact**: 5x faster threading queries

**Index #3: created_at DESC**
- **Query**: `ORDER BY created_at DESC`
- **Frequency**: Chronological sorting (every query)
- **Cardinality**: High (unique timestamps)
- **Performance Impact**: Avoids full table scan for sorting

**Index #4: user_id**
- **Query**: `SELECT * FROM comments WHERE user_id = $1` (user's comments)
- **Frequency**: Less common (user profile views)
- **Cardinality**: Medium (hundreds of users)
- **Performance Impact**: 3x faster user queries

**Trade-offs**:
- **Write Performance**: Indexes slow down INSERT (acceptable, reads >> writes)
- **Storage**: ~1MB per 10,000 comments (negligible)
- **Maintenance**: Minimal (PostgreSQL auto-maintains)

**Action Items**:
- Add all 4 indexes in migration `004_create_comments_table.sql`
- Test query performance with `EXPLAIN ANALYZE`
- Monitor index usage in Supabase dashboard

---

### Q14: Error Logging Service

**Question**: Should we integrate error logging service (Sentry, LogRocket)?

**Answer**: **Defer to post-MVP** (console logging sufficient for MVP)

**Rationale for DEFER**:
- **Time Constraint**: Sentry integration requires SDK setup (1-2 hours)
- **Cost**: Free tier limited (5,000 events/month)
- **MVP Needs**: Console logs sufficient for demo and debugging
- **Privacy**: Sentry sends stack traces to third party (requires privacy review)

**MVP Error Logging Strategy**:
1. **Console Logging**: All errors logged to console (browser DevTools)
2. **Error Boundaries**: Catch React errors, log to console
3. **Network Errors**: Log fetch failures to console
4. **Manual Testing**: QA Lead monitors console during testing

**Console Logging Pattern**:
```typescript
try {
  await createComment(comment);
} catch (error) {
  console.error('Failed to create comment:', error);
  // Show user-friendly toast
  toast.error('Failed to post comment. Please try again.');
}
```

**Post-MVP Enhancement**:
- Add Sentry for production error tracking
- Configure source maps for stack traces
- Set up alerts for critical errors

**Action Items**:
- Add `console.error()` for all try-catch blocks
- Document console logging in CONTRIBUTING.md
- Add Sentry to post-MVP roadmap

---

### Q15: CI/CD Pipeline

**Question**: Should we set up CI/CD pipeline for automated testing?

**Answer**: **Set up basic CI** (GitHub Actions for tests + lint)

**Rationale for INCLUDE**:
- **Time Investment**: 1 hour to configure GitHub Actions
- **Value**: Prevents regressions (catches TypeScript errors, test failures)
- **Zero Maintenance**: Runs automatically on every PR
- **Free Tier**: GitHub Actions free for public repos (2,000 minutes/month for private)

**Basic CI Workflow** (`.github/workflows/ci.yml`):
```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run type-check  # TypeScript errors
      - run: npm run lint         # ESLint errors
      - run: npm test             # Jest tests (with coverage)
      - uses: codecov/codecov-action@v3  # Upload coverage
```

**CI Checks**:
1. TypeScript type checking (`tsc --noEmit`)
2. ESLint linting (`npm run lint`)
3. Jest tests with coverage (`npm test`)
4. Coverage upload to Codecov (optional)

**Vercel Deployment**:
- Already configured (auto-deploys on push to main)
- Preview deployments on PRs (automatic)

**Action Items**:
- Create `.github/workflows/ci.yml`
- Test CI workflow on dummy PR
- Add CI badge to README: ![CI](https://github.com/.../badge.svg)
- Document CI setup in CONTRIBUTING.md

---

## Implementation Plan

### Phase 1: Diff Rendering (Day 1, 4 hours)

**Goal**: Replace raw patch display with syntax-highlighted diff viewer

**Steps**:

1. **Library Setup** (30 minutes)
   - Install `react-diff-viewer-continued`: `npm install react-diff-viewer-continued`
   - Install Prism.js languages: `npm install prismjs`
   - Test import in scratch file (verify types)

2. **RED Phase - Write Failing Tests** (1 hour)
   - Create `src/components/diff-viewer.test.tsx`
   - Test cases:
     - Renders added lines with green background
     - Renders deleted lines with red background
     - Renders context lines with neutral background
     - Displays correct line numbers
     - Handles binary files gracefully
     - Handles empty patches
     - Syntax highlighting applies to TypeScript code
   - Run tests: `npm test diff-viewer.test.tsx` (all fail)

3. **GREEN Phase - Implement Component** (1.5 hours)
   - Create `src/components/diff-viewer.tsx`
   - Props interface:
     ```typescript
     interface DiffViewerProps {
       patch: string;
       filename: string;
       language?: string;
       showLineNumbers?: boolean;
       maxHeight?: string;
     }
     ```
   - Integrate `react-diff-viewer-continued`:
     ```typescript
     import ReactDiffViewer from 'react-diff-viewer-continued';
     ```
   - Parse patch string (extract old/new content)
   - Apply Tailwind styling (green/red/neutral colors)
   - Add syntax highlighting (Prism.js)
   - Add line numbers
   - Handle edge cases (binary files, empty patches)
   - Run tests: `npm test diff-viewer.test.tsx` (all pass)

4. **REFACTOR Phase - Optimize** (30 minutes)
   - Extract patch parsing logic to utility function
   - Memoize parsed patch (`useMemo`)
   - Add dark mode support (Tailwind classes)
   - Optimize syntax highlighting (lazy load Prism languages)
   - Run tests again (verify no regressions)

5. **Integration** (30 minutes)
   - Update `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`
   - Replace raw `<pre>` tag (lines 153-159) with `<DiffViewer />`
   - Pass `file.patch` and `file.filename` as props
   - Test in browser (view sample PR)
   - Verify performance (500-line diff < 500ms)

**Deliverables**:
- ✅ `src/components/diff-viewer.tsx` (component)
- ✅ `src/components/diff-viewer.test.tsx` (tests)
- ✅ Updated PR detail page (integration)
- ✅ Tests pass (>= 95% coverage for DiffViewer)

**Success Criteria**:
- Diff renders with green/red/neutral colors
- Line numbers displayed correctly
- Syntax highlighting works for 10 languages
- Zero TypeScript errors
- Performance: 500-line diff < 500ms

---

### Phase 2: Comment System (Day 2, 6 hours)

**Goal**: Implement real-time comment threading system

**Steps**:

1. **Database Migration** (30 minutes)
   - Create `supabase/migrations/004_create_comments_table.sql`
   - Define schema:
     ```sql
     CREATE TABLE comments (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       pr_id TEXT NOT NULL,
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
       body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
   - Add indexes (pr_id, parent_comment_id, created_at, user_id)
   - Add RLS policies (SELECT, INSERT, UPDATE, DELETE)
   - Test migration locally: `supabase db reset`
   - Verify schema in Supabase dashboard

2. **RED Phase - Write Failing Tests** (1 hour)
   - Create hook tests:
     - `src/lib/hooks/use-comments.test.ts`
     - Test cases: fetch comments, create comment, optimistic updates, polling, cleanup
   - Create component tests:
     - `src/components/comment-input.test.tsx`
     - `src/components/comment-item.test.tsx`
     - `src/components/comment-thread.test.tsx`
   - Mock Supabase client
   - Run tests (all fail)

3. **GREEN Phase - Implement Backend** (1.5 hours)
   - Create `src/lib/supabase/comments.ts`:
     ```typescript
     export async function getComments(prId: string) { ... }
     export async function createComment(comment: Comment) { ... }
     export async function deleteComment(commentId: string) { ... }
     ```
   - Create `src/lib/hooks/use-comments.ts`:
     ```typescript
     export function useComments(prId: string) {
       const [comments, setComments] = useState([]);
       // Polling logic (2s interval)
       // Optimistic updates
       // Cleanup
     }
     ```
   - Implement polling (2s interval, like `use-presence.ts`)
   - Implement optimistic updates (temporary UUID → real UUID)
   - Test hook: `npm test use-comments.test.ts` (all pass)

4. **GREEN Phase - Implement Frontend** (1.5 hours)
   - Create `src/components/comment-input.tsx`:
     - Textarea with auto-resize
     - Character counter (0/10,000)
     - Submit button (disabled until valid)
     - Validation (1-10,000 chars)
   - Create `src/components/comment-item.tsx`:
     - Avatar, username, timestamp
     - Markdown rendering (`react-markdown`)
     - Reply button, delete button
   - Create `src/components/comment-thread.tsx`:
     - Threaded structure (indent replies 40px)
     - Max depth 3 (hide Reply button at depth 3)
     - Empty state ("Be the first to comment!")
   - Test components: `npm test comment-*.test.tsx` (all pass)

5. **REFACTOR Phase - Optimize** (1 hour)
   - Extract threading logic to utility function
   - Memoize comment tree structure
   - Add loading states (skeleton loaders)
   - Add error states (retry buttons)
   - Optimize markdown rendering (memoize)
   - Run all tests (verify no regressions)

6. **Integration** (30 minutes)
   - Add Comment system to PR detail page
   - Place below Files Changed section
   - Wire up `useComments(prId)` hook
   - Test in browser (add comment, reply, real-time sync with 2 windows)
   - Verify polling (2s interval)
   - Test RLS policies (multi-user scenario)

**Deliverables**:
- ✅ `supabase/migrations/004_create_comments_table.sql` (migration)
- ✅ `src/lib/hooks/use-comments.ts` (hook)
- ✅ `src/lib/supabase/comments.ts` (database queries)
- ✅ `src/components/comment-input.tsx` (component)
- ✅ `src/components/comment-item.tsx` (component)
- ✅ `src/components/comment-thread.tsx` (component)
- ✅ Updated PR detail page (integration)
- ✅ Tests pass (>= 90% coverage for hooks, >= 85% for components)

**Success Criteria**:
- Comments display chronologically
- Replies indent correctly (max depth 3)
- Real-time sync works (2s latency)
- Optimistic updates instant for author
- RLS policies enforce access control
- Zero TypeScript errors

---

### Phase 3: Test Coverage (Day 2-3, 4 hours)

**Goal**: Achieve >= 80% test coverage for core features

**Steps**:

1. **Test Infrastructure Setup** (30 minutes)
   - Update `jest.config.js` with coverage thresholds:
     ```javascript
     module.exports = {
       collectCoverageFrom: [
         'src/lib/hooks/**/*.{ts,tsx}',
         'src/components/**/*.{ts,tsx}',
         '!src/**/*.d.ts',
         '!src/**/*.stories.tsx',
       ],
       coverageThresholds: {
         global: { branches: 80, functions: 80, lines: 80, statements: 80 },
         './src/lib/hooks/': { branches: 90, functions: 90, lines: 90, statements: 90 },
       },
     };
     ```
   - Create `setupTests.ts` with matchers
   - Configure TypeScript support for tests

2. **Hook Tests** (1.5 hours)
   - `src/lib/hooks/use-presence.test.ts`:
     - Test initialization, polling, cleanup
     - Mock Supabase client
   - `src/lib/hooks/use-cursors.test.ts`:
     - Test cursor updates, throttling, fade-out, cleanup
     - Mock Supabase client
   - Already done: `src/lib/hooks/use-comments.test.ts` (Phase 2)
   - Run tests: `npm test hooks` (target >= 90% coverage)

3. **Component Tests** (1.5 hours)
   - `src/components/live-cursor.test.tsx`:
     - Test rendering, position, color, fade-out
   - `src/components/cursors-layer.test.tsx`:
     - Test multiple cursors, filtering own cursor
   - `src/components/presence-indicator.test.tsx`:
     - Test avatar stack, tooltips, overflow count
   - Already done: DiffViewer, Comment components (Phase 1 & 2)
   - Run tests: `npm test components` (target >= 85% coverage)

4. **Integration Tests** (1 hour)
   - `src/__tests__/integration/cursor-tracking.test.tsx`:
     - Simulate User A moves cursor → User B sees it
   - `src/__tests__/integration/comment-sync.test.tsx`:
     - Simulate User A adds comment → User B sees it in 2s
   - Mock Supabase polling with timers
   - Run tests: `npm test integration` (target >= 80% coverage)

5. **Coverage Validation** (30 minutes)
   - Run full test suite: `npm test`
   - Generate coverage report: `npm run test:coverage`
   - Review report: `open coverage/lcov-report/index.html`
   - Verify all thresholds met (>= 80% global, >= 90% hooks)
   - Fix any uncovered branches (add missing tests)

**Deliverables**:
- ✅ `jest.config.js` (coverage config)
- ✅ `setupTests.ts` (test setup)
- ✅ Hook tests (3 files)
- ✅ Component tests (7 files total)
- ✅ Integration tests (2 files)
- ✅ Coverage >= 80% (verified in HTML report)

**Success Criteria**:
- All tests pass (`npm test`)
- Coverage >= 80% (branches, functions, lines, statements)
- Hooks coverage >= 90%
- Zero test failures
- CI pipeline passes (if configured)

---

### Phase 4: Integration & Polish (Day 3, 4 hours)

**Goal**: Finalize MVP with error handling, accessibility, and documentation

**Steps**:

1. **Error Handling** (1.5 hours)
   - Create `src/components/error-boundary.tsx`:
     - Catch React errors
     - Show fallback UI with retry button
   - Add error boundaries to PR detail page:
     - Wrap DiffViewer (fallback: raw patch)
     - Wrap CommentThread (fallback: "Comments unavailable")
     - Wrap PresenceIndicator (fallback: hide gracefully)
   - Add toast notifications for errors:
     - Network failures: "Connection lost. [Retry]"
     - Rate limits: "Rate limited. Try again in 15 minutes."
     - Validation errors: Inline error messages
   - Test error scenarios (throttle network, simulate failures)

2. **Accessibility** (1 hour)
   - Run axe DevTools audit on PR detail page
   - Fix critical/serious issues:
     - Add ARIA labels to icons
     - Ensure keyboard navigation works (Tab order)
     - Add focus indicators (visible outline)
     - Verify color contrast (WCAG 2.1 AA)
   - Test keyboard navigation:
     - Tab through all interactive elements
     - Enter to submit comments
     - Escape to close modals
   - Test with screen reader (NVDA):
     - Verify dynamic announcements (new comments)
     - Verify form labels

3. **Performance Testing** (30 minutes)
   - Test diff rendering performance:
     - 500-line diff (target < 500ms)
     - 5000-line diff (target < 2s)
     - Use Chrome DevTools Performance profiler
   - Test comment polling load:
     - Open 5 browser windows (same PR)
     - Monitor network tab (polling requests)
     - Verify no performance degradation
   - Test page load (Lighthouse):
     - Target: TTI < 3s, accessibility >= 90

4. **Documentation** (1 hour)
   - Update README.md:
     - Add "Features" section (diff rendering, comments, presence, cursors)
     - Add setup instructions (env vars, Supabase, GitHub OAuth)
     - Add testing instructions (`npm test`, `npm run test:coverage`)
     - Add screenshots (PR detail page, diff viewer, comments)
   - Create TESTING.md:
     - Document test strategy (TDD workflow)
     - Document coverage thresholds
     - Document how to run tests
   - Update API.md:
     - Document comments table schema
     - Document RLS policies
     - Document comment queries

**Deliverables**:
- ✅ Error boundaries (3 sections)
- ✅ Toast notifications for errors
- ✅ Accessibility fixes (WCAG 2.1 AA)
- ✅ Performance validation (Lighthouse report)
- ✅ Updated README.md
- ✅ TESTING.md
- ✅ Updated API.md

**Success Criteria**:
- Error boundaries catch failures (no white screens)
- axe DevTools: 0 critical/serious issues
- Lighthouse accessibility >= 90
- 500-line diff < 500ms, 5000-line diff < 2s
- Documentation complete (README, TESTING.md, API.md)

---

## Database Schema

### Migration: `supabase/migrations/004_create_comments_table.sql`

```sql
-- =====================================================
-- Migration 004: Create Comments Table
-- Purpose: Enable real-time comment threading on PRs
-- Created: 2026-01-11
-- =====================================================

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,  -- Format: "owner/repo/123"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT body_length CHECK (char_length(body) > 0 AND char_length(body) <= 10000)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_comments_pr_id ON comments(pr_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Composite index for common query pattern (pr_id + created_at)
CREATE INDEX IF NOT EXISTS idx_comments_pr_created ON comments(pr_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: All authenticated users can view comments
CREATE POLICY "Comments are viewable by all authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy 2: Users can create comments with their own user_id
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy 3: Users can only update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy 4: Users can only delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on UPDATE
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE comments IS 'Stores PR comments with threading support (parent_comment_id)';
COMMENT ON COLUMN comments.pr_id IS 'Pull request identifier (format: owner/repo/number)';
COMMENT ON COLUMN comments.parent_comment_id IS 'Parent comment ID for threading (NULL for top-level)';
COMMENT ON COLUMN comments.body IS 'Comment text (1-10,000 characters, markdown supported)';
```

### Down Migration: `supabase/migrations/004_create_comments_table_down.sql`

```sql
-- =====================================================
-- Down Migration 004: Drop Comments Table
-- Purpose: Rollback comments table creation
-- =====================================================

-- Drop trigger
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop RLS policies
DROP POLICY IF EXISTS "Comments are viewable by all authenticated users" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Drop indexes
DROP INDEX IF EXISTS idx_comments_pr_id;
DROP INDEX IF EXISTS idx_comments_parent;
DROP INDEX IF EXISTS idx_comments_created_at;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP INDEX IF EXISTS idx_comments_pr_created;

-- Drop table
DROP TABLE IF EXISTS comments;
```

### Schema Validation Queries

```sql
-- Verify table created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'comments';

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'comments';

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'comments';

-- Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'comments';

-- Verify RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'comments';

-- Test query performance (should use index)
EXPLAIN ANALYZE
SELECT * FROM comments
WHERE pr_id = 'owner/repo/123'
ORDER BY created_at DESC;
```

---

## Component Hierarchy

```
PR Detail Page (src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx)
│
├── Header Section
│   ├── PR Title (h1)
│   ├── State Badge ("open" | "closed")
│   ├── Author Info (GitHub username, avatar)
│   └── Presence Indicator ✅ EXISTING
│       ├── Avatar Stack (up to 5 visible)
│       └── Overflow Count ("+3 more")
│
├── PR Description
│   ├── Markdown Rendering (GitHub description)
│   └── Metadata (branch names, commit count)
│
├── Cursors Layer ✅ EXISTING
│   └── Live Cursor Component (per user)
│       ├── SVG Cursor (pointer icon)
│       ├── Username Label
│       └── Lerp Animation (60fps smooth movement)
│
├── Files Changed Section
│   ├── File List (collapsible)
│   └── For Each File:
│       ├── File Header
│       │   ├── Filename (with icon by extension)
│       │   ├── Stats Badge (+X -Y lines)
│       │   └── Expand/Collapse Button
│       │
│       └── Diff Viewer ⭐ NEW (Phase 1)
│           ├── Line Numbers Column (old/new)
│           ├── Code Lines
│           │   ├── Added Lines (green background, "+" prefix)
│           │   ├── Deleted Lines (red background, "-" prefix)
│           │   └── Context Lines (neutral background)
│           └── Syntax Highlighting (Prism.js)
│               └── Supports: JS, TS, Python, Go, Java, CSS, HTML, JSON, Markdown, YAML
│
└── Comments Section ⭐ NEW (Phase 2)
    ├── Section Header
    │   ├── "Comments" Title
    │   └── Comment Count Badge (e.g., "12 comments")
    │
    ├── Comment Input (top-level)
    │   ├── Textarea (auto-resize, 60-300px)
    │   ├── Character Counter ("0 / 10,000")
    │   ├── Markdown Hint ("Supports **bold**, *italic*, `code`")
    │   └── Submit Button (disabled until valid)
    │
    └── Comment Thread
        ├── Empty State (if no comments)
        │   └── "Be the first to comment!"
        │
        └── Comment List (chronological order)
            ├── Top-Level Comment (depth 0)
            │   ├── Comment Item
            │   │   ├── Avatar (40x40px, GitHub avatar)
            │   │   ├── Header
            │   │   │   ├── Username (bold, clickable → GitHub profile)
            │   │   │   ├── Timestamp ("2 minutes ago", relative)
            │   │   │   └── Actions (visible to author only)
            │   │   │       └── Delete Button (trash icon, confirmation modal)
            │   │   ├── Body
            │   │   │   └── Markdown Rendering (react-markdown)
            │   │   │       ├── Bold, italic, code, links
            │   │   │       ├── Code blocks with syntax highlighting
            │   │   │       └── Sanitized (no XSS)
            │   │   └── Footer
            │   │       └── Reply Button (visible to all)
            │   │
            │   └── Reply Thread (depth 1, indent 40px)
            │       ├── Reply Comment Item (same structure as above)
            │       │   └── Reply Thread (depth 2, indent 80px)
            │       │       ├── Reply Comment Item
            │       │       │   └── Reply Button HIDDEN (max depth 3)
            │       │       └── "Max reply depth reached" message
            │
            └── Loading State (while polling)
                └── Comment Skeleton Loader (shimmer animation)
```

### Component File Structure

```
src/
├── app/
│   └── repositories/
│       └── [owner]/
│           └── [repo]/
│               └── pull/
│                   └── [number]/
│                       └── page.tsx  ← Main PR detail page (integrates all components)
│
├── components/
│   ├── ✅ presence-indicator.tsx       (EXISTING - no changes)
│   ├── ✅ live-cursor.tsx              (EXISTING - no changes)
│   ├── ✅ cursors-layer.tsx            (EXISTING - no changes)
│   ├── ✅ pr-detail-client.tsx         (EXISTING - no changes)
│   │
│   ├── ⭐ diff-viewer.tsx              (NEW - Phase 1)
│   ├── ⭐ comment-input.tsx            (NEW - Phase 2)
│   ├── ⭐ comment-item.tsx             (NEW - Phase 2)
│   ├── ⭐ comment-thread.tsx           (NEW - Phase 2)
│   └── ⭐ error-boundary.tsx           (NEW - Phase 4)
│
├── lib/
│   ├── hooks/
│   │   ├── ✅ use-presence.ts          (EXISTING - no changes)
│   │   ├── ✅ use-cursors.ts           (EXISTING - no changes)
│   │   └── ⭐ use-comments.ts          (NEW - Phase 2)
│   │
│   └── supabase/
│       └── ⭐ comments.ts              (NEW - Phase 2)
│
└── types/
    └── ⭐ comments.ts                  (NEW - Phase 2)
```

---

## Technical Risks

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| **Risk #1: Diff library incompatibility** | **HIGH** - May need to build custom diff renderer | **LOW** - react-diff-viewer-continued is actively maintained | Research 2 libraries before implementation. Test with 500-line diff. Fallback: Use diff2html (more complex integration). | Frontend Developer |
| **Risk #2: Comment polling overload** | **MEDIUM** - High server costs if 100+ users on same PR | **MEDIUM** - Possible at scale | Monitor Supabase dashboard for query load. Implement incremental fetching (only fetch new comments). Consider debouncing polling if > 50 users. | Full-Stack Developer |
| **Risk #3: Test coverage gaps** | **MEDIUM** - May not reach 80% threshold | **MEDIUM** - 4 hours may not be enough | Prioritize hook tests (highest value). Defer integration tests if time runs out. Lower threshold to 70% if necessary (document exception). | Jest/RTL Specialists |
| **Risk #4: RLS policy bugs** | **HIGH** - Users could access/modify others' comments | **LOW** - Policies tested in previous migrations | Test RLS with 2+ user accounts. Verify users cannot query others' data. Use Supabase RLS simulator for validation. | PostgreSQL Specialist |
| **Risk #5: Syntax highlighting bundle size** | **LOW** - Large bundle (> 100KB) slows page load | **MEDIUM** - 10 Prism.js languages = ~60KB | Use code splitting (dynamic import). Lazy-load languages on demand. Monitor bundle size with Webpack Bundle Analyzer. | Frontend Developer |
| **Risk #6: Markdown XSS vulnerability** | **HIGH** - User input could inject malicious scripts | **LOW** - react-markdown sanitizes by default | Verify react-markdown sanitization. Test with XSS payloads (`<script>alert('XSS')</script>`). Use DOMPurify as backup if needed. | Full-Stack Developer |
| **Risk #7: Optimistic update race conditions** | **MEDIUM** - Comment appears twice (local + poll) | **MEDIUM** - Race condition if poll happens during submit | Use temporary UUIDs for optimistic comments. Replace with real UUID on server response. Deduplicate by ID in local state. | Full-Stack Developer |
| **Risk #8: Performance regression on large PRs** | **MEDIUM** - 100+ file PR renders slowly | **LOW** - Most PRs < 20 files | Implement collapsible diffs (render on expand). Test with 50-file PR. Monitor LCP metric with Vercel Analytics. | Lead Engineer |

### Risk Mitigation Plan

**Pre-Sprint 2 Actions**:
1. **Diff Library Research** (1 hour before Phase 1)
   - Test `react-diff-viewer-continued` with sample patch
   - Test `diff2html` with same patch
   - Compare bundle size, integration complexity, features
   - Make final decision (document in this design doc)

2. **Supabase Capacity Planning** (30 minutes before Phase 2)
   - Check current database load (Supabase dashboard)
   - Verify connection pool size (max 100 connections)
   - Estimate comment polling load (2s interval × 50 users = 25 queries/second)
   - Confirm acceptable (< 50% capacity)

3. **Test Infrastructure Validation** (30 minutes before Phase 3)
   - Verify Jest + React Testing Library installed
   - Run sample test to confirm setup
   - Configure coverage reporting
   - Confirm CI integration (GitHub Actions)

**During-Sprint Monitoring**:
1. **Performance Metrics** (continuous)
   - Monitor Vercel Analytics (LCP, FCP, TTI)
   - Monitor Supabase dashboard (query performance)
   - Check browser DevTools (network tab, performance profiler)

2. **Test Coverage Tracking** (after each phase)
   - Run `npm run test:coverage` after each phase
   - Verify coverage trend (should increase each phase)
   - Identify uncovered branches early

**Post-Sprint Actions**:
1. **Production Monitoring** (ongoing)
   - Enable Vercel Analytics (Web Vitals)
   - Set up Supabase alerts (slow queries, high load)
   - Monitor error logs (console.error in production)

2. **Performance Audit** (1 week post-MVP)
   - Lighthouse audit (target >= 90)
   - Test with large PR (100+ files, 10,000+ lines)
   - Optimize based on findings

---

## Performance Requirements

### NFR-1.1: Diff Rendering Performance

**Target**: < 500ms for 500-line diff (p95)
**Threshold**: < 2s for 5000-line diff (p95)
**Measurement**: Chrome DevTools Performance profiler

**Optimization Strategies**:
1. **Virtual Scrolling**: Render only visible lines (defer to post-MVP)
2. **Code Splitting**: Lazy-load diff library (`React.lazy()`)
3. **Memoization**: Cache parsed patch (`useMemo`)
4. **Lazy Rendering**: Collapse diffs by default, expand on click
5. **Syntax Highlighting**: Asynchronous (non-blocking UI)

**Baseline Measurement** (before optimization):
- 500-line diff: ~800ms (needs optimization)
- 5000-line diff: ~5s (needs virtual scrolling)

**Target Measurement** (after optimization):
- 500-line diff: ~400ms ✅
- 5000-line diff: ~1.5s ✅

**Validation**:
- Test with real PR (GitHub repo with large diff)
- Use Chrome DevTools → Performance → Record
- Measure "Scripting" + "Rendering" time
- Verify no UI blocking (main thread < 50ms tasks)

---

### NFR-1.2: Real-Time Sync Latency

**Target**: < 2s latency for presence, cursors, comments (p95)
**Measurement**: Manual testing with 2 browser windows + stopwatch

**Optimization Strategies**:
1. **Polling Interval**: 2s (consistent across all features)
2. **Optimistic Updates**: Instant for comment author (0s perceived latency)
3. **Efficient Queries**: Index on `pr_id`, `created_at` (< 100ms query time)
4. **Incremental Fetching**: Only fetch comments newer than last fetch

**Baseline Measurement**:
- Presence: ~2s (polling interval)
- Cursors: ~2s perceived (lerp animation smooths delay)
- Comments: ~2s (polling interval)

**Optimistic Update Impact**:
- Comment author sees comment instantly (0s)
- Other viewers see comment within 2s (polling)
- Net effect: 2s → 0s for author, 2s for others

**Validation**:
- Open 2 browser windows (same PR, different users)
- Window A: Add comment
- Window B: Start stopwatch
- Verify comment appears in Window B within 2s

---

### NFR-1.3: Initial Page Load

**Target**: < 3s for Time to Interactive (TTI)
**Metrics**:
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3s

**Measurement**: Lighthouse audit (Chrome DevTools)

**Optimization Strategies**:
1. **Server-Side Rendering**: Next.js SSR for initial PR data
2. **Image Optimization**: `next/image` for avatars
3. **Code Splitting**: Dynamic imports for diff library, comment system
4. **Font Optimization**: Preload fonts (Tailwind CSS fonts)

**Baseline Measurement** (before optimization):
- FCP: ~1.2s
- LCP: ~2.8s
- TTI: ~3.5s

**Target Measurement** (after optimization):
- FCP: ~0.8s ✅
- LCP: ~2.0s ✅
- TTI: ~2.5s ✅

**Validation**:
- Run Lighthouse audit: DevTools → Lighthouse → Analyze page load
- Target score: Performance >= 90
- Verify Core Web Vitals pass (green in Lighthouse)

---

### NFR-1.4: Database Query Performance

**Target**: < 100ms for single query (p95)
**Measurement**: Supabase dashboard + `EXPLAIN ANALYZE`

**Optimization Strategies**:
1. **Indexes**: All foreign keys and WHERE/JOIN columns indexed
2. **Limit Results**: Paginate comments (50 per page)
3. **Composite Index**: `(pr_id, created_at)` for common query
4. **Query Plan Verification**: Use `EXPLAIN ANALYZE` to verify index usage

**Query Performance Targets**:
| Query | Expected Time | Index Used |
|-------|---------------|------------|
| `SELECT * FROM comments WHERE pr_id = $1` | < 50ms | `idx_comments_pr_id` |
| `SELECT * FROM comments WHERE pr_id = $1 ORDER BY created_at` | < 80ms | `idx_comments_pr_created` (composite) |
| `SELECT * FROM comments WHERE parent_comment_id = $1` | < 30ms | `idx_comments_parent` |
| `SELECT * FROM comments WHERE user_id = $1` | < 40ms | `idx_comments_user_id` |

**Validation**:
```sql
-- Verify index usage
EXPLAIN ANALYZE
SELECT * FROM comments
WHERE pr_id = 'owner/repo/123'
ORDER BY created_at DESC;

-- Expected output:
-- Index Scan using idx_comments_pr_created on comments
-- Planning Time: 0.5 ms
-- Execution Time: 15.2 ms ✅
```

**Monitoring**:
- Supabase dashboard → Database → Performance Insights
- Set alert: Query time > 200ms (slow query threshold)

---

## Code Structure

### New Files to Create

**Phase 1 (Diff Rendering)**:
1. `src/components/diff-viewer.tsx` - DiffViewer component
2. `src/components/diff-viewer.test.tsx` - Component tests
3. `src/types/diff.ts` - TypeScript types for diff props

**Phase 2 (Comment System)**:
4. `supabase/migrations/004_create_comments_table.sql` - Database migration
5. `src/lib/hooks/use-comments.ts` - Real-time polling hook
6. `src/lib/supabase/comments.ts` - Database queries
7. `src/components/comment-input.tsx` - Comment input component
8. `src/components/comment-item.tsx` - Individual comment component
9. `src/components/comment-thread.tsx` - Threaded comment list
10. `src/types/comments.ts` - TypeScript types for comments
11. `src/lib/hooks/use-comments.test.ts` - Hook tests
12. `src/components/comment-input.test.tsx` - Component tests
13. `src/components/comment-item.test.tsx` - Component tests
14. `src/components/comment-thread.test.tsx` - Component tests

**Phase 3 (Testing)**:
15. `jest.config.js` - Jest configuration (update existing)
16. `setupTests.ts` - Test setup (create new)
17. `src/lib/hooks/use-presence.test.ts` - Hook tests
18. `src/lib/hooks/use-cursors.test.ts` - Hook tests
19. `src/components/live-cursor.test.tsx` - Component tests
20. `src/components/cursors-layer.test.tsx` - Component tests
21. `src/components/presence-indicator.test.tsx` - Component tests
22. `src/__tests__/integration/cursor-tracking.test.tsx` - Integration tests
23. `src/__tests__/integration/comment-sync.test.tsx` - Integration tests

**Phase 4 (Error Handling & Docs)**:
24. `src/components/error-boundary.tsx` - Error boundary component
25. `TESTING.md` - Test documentation (create new)
26. `.github/workflows/ci.yml` - CI pipeline (create new)

**Total**: 26 new files

---

### Files to Modify

**Phase 1 (Diff Rendering)**:
1. `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`
   - Lines 153-159: Replace `<pre><code>{file.patch}</code></pre>` with `<DiffViewer />`

**Phase 2 (Comment System)**:
2. `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`
   - Add Comment section below Files Changed section
   - Import and use `CommentThread` component

**Phase 3 (Testing)**:
3. `package.json`
   - Add test scripts: `"test:coverage": "jest --coverage"`
   - Add dependencies (if missing): `@testing-library/react`, `@testing-library/jest-dom`

**Phase 4 (Documentation)**:
4. `README.md`
   - Add "Features" section (diff rendering, comments, presence, cursors)
   - Add "Testing" section (how to run tests, coverage)
   - Add screenshots

**Total**: 4 files modified

---

### Directory Structure (After Sprint 2)

```
code-review-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml ⭐ NEW
│
├── supabase/
│   └── migrations/
│       ├── 001_create_realtime_schema.sql ✅ EXISTING
│       ├── 002_fix_rls_upsert_policies.sql ✅ EXISTING
│       ├── 003_add_cursor_cleanup_cron.sql ✅ EXISTING
│       └── 004_create_comments_table.sql ⭐ NEW
│
├── src/
│   ├── __tests__/
│   │   └── integration/ ⭐ NEW
│   │       ├── cursor-tracking.test.tsx ⭐ NEW
│   │       └── comment-sync.test.tsx ⭐ NEW
│   │
│   ├── app/
│   │   └── repositories/
│   │       └── [owner]/
│   │           └── [repo]/
│   │               └── pull/
│   │                   └── [number]/
│   │                       └── page.tsx ⚠️ MODIFIED
│   │
│   ├── components/
│   │   ├── presence-indicator.tsx ✅ EXISTING
│   │   ├── live-cursor.tsx ✅ EXISTING
│   │   ├── cursors-layer.tsx ✅ EXISTING
│   │   ├── pr-detail-client.tsx ✅ EXISTING
│   │   │
│   │   ├── diff-viewer.tsx ⭐ NEW
│   │   ├── diff-viewer.test.tsx ⭐ NEW
│   │   │
│   │   ├── comment-input.tsx ⭐ NEW
│   │   ├── comment-input.test.tsx ⭐ NEW
│   │   ├── comment-item.tsx ⭐ NEW
│   │   ├── comment-item.test.tsx ⭐ NEW
│   │   ├── comment-thread.tsx ⭐ NEW
│   │   ├── comment-thread.test.tsx ⭐ NEW
│   │   │
│   │   ├── error-boundary.tsx ⭐ NEW
│   │   │
│   │   ├── live-cursor.test.tsx ⭐ NEW
│   │   ├── cursors-layer.test.tsx ⭐ NEW
│   │   └── presence-indicator.test.tsx ⭐ NEW
│   │
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── use-presence.ts ✅ EXISTING
│   │   │   ├── use-presence.test.ts ⭐ NEW
│   │   │   ├── use-cursors.ts ✅ EXISTING
│   │   │   ├── use-cursors.test.ts ⭐ NEW
│   │   │   ├── use-comments.ts ⭐ NEW
│   │   │   └── use-comments.test.ts ⭐ NEW
│   │   │
│   │   └── supabase/
│   │       └── comments.ts ⭐ NEW
│   │
│   └── types/
│       ├── diff.ts ⭐ NEW
│       └── comments.ts ⭐ NEW
│
├── jest.config.js ⚠️ MODIFIED (add coverage thresholds)
├── setupTests.ts ⭐ NEW
├── package.json ⚠️ MODIFIED (add test scripts)
│
├── README.md ⚠️ MODIFIED (add features, testing, screenshots)
├── TESTING.md ⭐ NEW
└── technical_design_sprint_2_mvp.md ⭐ NEW (this file)
```

---

## Success Criteria

### Feature Completeness

**User Story #1: Diff Rendering** ✅
- [ ] Diff component renders file patches from GitHub API
- [ ] Line numbers displayed on both sides (old/new)
- [ ] Added lines have green background with `+` indicator
- [ ] Deleted lines have red background with `-` indicator
- [ ] Context lines have neutral background
- [ ] Syntax highlighting works for 10 languages
- [ ] Component handles edge cases (binary files, large diffs)
- [ ] Diff rendering is responsive (desktop/tablet/mobile)
- [ ] Performance: 500-line diff < 500ms

**User Story #2: Comments** ✅
- [ ] Comment input box on PR detail page
- [ ] Users can submit comments with markdown
- [ ] Comments display below PR description
- [ ] Each comment shows avatar, username, timestamp
- [ ] Users can reply to comments (nested threading)
- [ ] Comments sync in real-time (2s polling)
- [ ] Comment count badge shows total comments
- [ ] Empty state shown when no comments exist
- [ ] Comment timestamps use relative format ("2 minutes ago")

**User Story #3: Tests** ✅
- [ ] All custom hooks have unit tests (>= 90% coverage)
- [ ] All React components have component tests (>= 85% coverage)
- [ ] Integration tests cover real-time flows
- [ ] Overall coverage >= 80%
- [ ] All tests pass on `npm test`
- [ ] Coverage report generated
- [ ] Test documentation added to README

**User Story #4: Error Handling** ✅
- [ ] Error boundaries catch React errors
- [ ] User-friendly error messages (not raw errors)
- [ ] Network failures show retry button
- [ ] Loading states for all async operations
- [ ] Graceful degradation (show partial data)

**User Story #5: Documentation** ✅
- [ ] README updated with features, setup, testing
- [ ] TESTING.md created with test strategy
- [ ] Screenshots added to README
- [ ] API.md updated with comments schema

---

### Technical Quality

**Zero Errors** ✅
- [ ] TypeScript errors: 0 (`tsc --noEmit`)
- [ ] Build errors: 0 (`npm run build`)
- [ ] Lint errors: 0 (`npm run lint`)
- [ ] Test failures: 0 (`npm test`)

**Performance** ✅
- [ ] Diff rendering: 500-line diff < 500ms (p95)
- [ ] Comment sync: < 2s latency (p95)
- [ ] Page load (TTI): < 3s (p95)
- [ ] Database queries: < 100ms (p95)

**Accessibility** ✅
- [ ] WCAG 2.1 Level AA compliance (axe DevTools)
- [ ] Lighthouse accessibility score >= 90
- [ ] Keyboard navigation works (all features)
- [ ] Screen reader announces dynamic changes

**Security** ✅
- [ ] RLS policies enforce access control
- [ ] Markdown sanitized (no XSS)
- [ ] Users cannot query others' private data
- [ ] No secrets in source code

---

### Demo Readiness

**Demo Checklist** ✅
- [ ] Diff rendering works for sample PR (TypeScript file)
- [ ] Comment system works (add comment, reply, delete)
- [ ] Real-time sync works in 2 browser windows
- [ ] Presence and cursors work in multiple windows
- [ ] All tests pass (`npm test`)
- [ ] Coverage >= 80% (`npm run test:coverage`)
- [ ] No console errors on production build
- [ ] README updated with setup instructions

---

## Appendix A: TypeScript Interfaces

### DiffViewer Props

```typescript
// src/types/diff.ts

export interface DiffViewerProps {
  /** GitHub API patch string (format: "@@ -1,5 +1,7 @@\n...") */
  patch: string;

  /** Filename for language detection (e.g., "App.tsx") */
  filename: string;

  /** Optional language override (e.g., "typescript") */
  language?: string;

  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;

  /** Max height for scrollable diffs (default: "600px") */
  maxHeight?: string;

  /** Split view (side-by-side) or unified (default: "split") */
  viewMode?: 'split' | 'unified';
}

export interface ParsedDiff {
  oldContent: string;
  newContent: string;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'delete' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}
```

---

### Comment Types

```typescript
// src/types/comments.ts

export interface Comment {
  id: string; // UUID
  pr_id: string; // Format: "owner/repo/123"
  user_id: string; // UUID
  parent_comment_id: string | null; // NULL for top-level
  body: string; // Markdown text (1-10,000 chars)
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface CommentTreeNode extends CommentWithUser {
  replies: CommentTreeNode[]; // Nested replies
  depth: number; // 0 = top-level, 1 = reply, 2 = reply to reply
}

export interface CommentInputProps {
  /** Pull request ID (format: "owner/repo/123") */
  prId: string;

  /** Parent comment ID for replies (NULL for top-level) */
  parentCommentId?: string | null;

  /** Callback after comment submitted */
  onCommentSubmit?: (comment: Comment) => void;

  /** Placeholder text (default: "Add a comment...") */
  placeholder?: string;

  /** Auto-focus on mount (default: false) */
  autoFocus?: boolean;
}

export interface CommentItemProps {
  /** Comment data (with user info) */
  comment: CommentWithUser;

  /** Current depth (0 = top-level, 1 = reply, etc.) */
  depth: number;

  /** Callback when reply button clicked */
  onReply?: (commentId: string) => void;

  /** Callback when delete button clicked */
  onDelete?: (commentId: string) => void;
}

export interface CommentThreadProps {
  /** Pull request ID (format: "owner/repo/123") */
  prId: string;

  /** Comments array (flat, will be threaded by component) */
  comments: CommentWithUser[];

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;
}
```

---

## Appendix B: Database Queries

### Supabase Comment Queries

```typescript
// src/lib/supabase/comments.ts

import { createClient } from '@/lib/supabase/client';
import type { Comment, CommentWithUser } from '@/types/comments';

/**
 * Fetch all comments for a PR (with user info)
 */
export async function getComments(prId: string): Promise<CommentWithUser[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:auth.users!user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('pr_id', prId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CommentWithUser[];
}

/**
 * Fetch comments newer than timestamp (incremental fetch)
 */
export async function getNewComments(
  prId: string,
  since: string // ISO timestamp
): Promise<CommentWithUser[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:auth.users!user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('pr_id', prId)
    .gt('created_at', since)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CommentWithUser[];
}

/**
 * Create a new comment
 */
export async function createComment(
  prId: string,
  body: string,
  parentCommentId: string | null = null
): Promise<Comment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('comments')
    .insert({
      pr_id: prId,
      body: body,
      parent_comment_id: parentCommentId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Comment;
}

/**
 * Delete a comment (user can only delete own comments, enforced by RLS)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

/**
 * Get comment count for a PR
 */
export async function getCommentCount(prId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('pr_id', prId);

  if (error) throw error;
  return count || 0;
}
```

---

## Appendix C: Testing Strategy

### Test File Template

```typescript
// Example: src/lib/hooks/use-comments.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { useComments } from './use-comments';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client');
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('useComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase responses
    mockSupabase.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      }),
    } as any);
  });

  it('initializes with empty comments array', () => {
    const { result } = renderHook(() => useComments('owner/repo/123'));

    expect(result.current.comments).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches comments on mount', async () => {
    const mockComments = [
      { id: '1', pr_id: 'owner/repo/123', body: 'Test comment' },
    ];

    mockSupabase.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockComments,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useComments('owner/repo/123'));

    await waitFor(() => {
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('polls for new comments every 2 seconds', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useComments('owner/repo/123'));

    // Initial fetch
    expect(mockSupabase).toHaveBeenCalledTimes(1);

    // Advance 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockSupabase).toHaveBeenCalledTimes(2); // Initial + 1 poll
    });

    jest.useRealTimers();
  });

  it('cleans up polling interval on unmount', () => {
    jest.useFakeTimers();

    const { unmount } = renderHook(() => useComments('owner/repo/123'));

    unmount();

    // Advance time after unmount
    jest.advanceTimersByTime(10000);

    // Should not poll after unmount
    expect(mockSupabase).toHaveBeenCalledTimes(1); // Only initial fetch

    jest.useRealTimers();
  });

  it('handles optimistic updates', async () => {
    const { result } = renderHook(() => useComments('owner/repo/123'));

    const newComment = { body: 'New comment', parentCommentId: null };

    // Create comment (optimistic)
    result.current.createComment(newComment);

    // Comment appears immediately (temporary UUID)
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].body).toBe('New comment');
    expect(result.current.comments[0].id).toMatch(/^temp-/);

    // Wait for server response
    await waitFor(() => {
      // Temporary UUID replaced with real UUID
      expect(result.current.comments[0].id).not.toMatch(/^temp-/);
    });
  });
});
```

---

**Document Status**: READY FOR IMPLEMENTATION

**Next Steps**:
1. ✅ Business Analyst questions answered (15 questions)
2. ✅ Multi-domain detection complete (8 domains identified)
3. ✅ Specialist assignments complete (8 specialists)
4. ✅ Implementation plan detailed (4 phases)
5. ✅ Database schema complete (migration + down migration)
6. ✅ Component hierarchy documented
7. ✅ Technical risks identified (8 risks + mitigation)
8. ✅ Performance requirements specified (4 NFRs)

**Implementation Ready**: 2026-01-11

**Lead Engineer**: Approved for Sprint 2 execution
