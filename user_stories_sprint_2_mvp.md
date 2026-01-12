# Sprint 2: MVP Completion - User Stories

**Sprint Goal**: Complete MVP features (diff rendering, comments, tests) to make dashboard production-ready for demo and handoff

**Sprint Duration**: 2-3 days
**Team**: 14 AGILE specialists available
**Assessment Date**: 2026-01-11

---

## Sprint Overview

**Current Status**: 70% complete (core infrastructure done, features incomplete)

**What Works**:
- ✅ Next.js 16 + TypeScript 5.7.2 setup
- ✅ GitHub OAuth authentication
- ✅ Repositories and PRs listing
- ✅ PR detail page with basic info
- ✅ Presence tracking (live count of viewers)
- ✅ Live cursors (smooth 60fps tracking)
- ✅ Zero TypeScript errors (strict mode)

**Sprint 2 Focus**: Implement 3 critical MVP features to reach production-ready state

---

## User Story #1: Syntax-Highlighted Diff Rendering

**As a** code reviewer
**I want** to see syntax-highlighted diffs with line numbers and color-coded changes
**So that** I can easily review code changes without reading raw patch text

### User Context

**Current State**: Diffs display as raw patch text in a `<pre>` tag, making them difficult to read and unprofessional.

**Pain Point**: Reviewing code changes requires manually parsing `@@` headers, `+` and `-` symbols, and context lines without visual aids.

**Expected Outcome**: GitHub-quality diff rendering with:
- Syntax highlighting based on file type
- Line numbers (old line, new line)
- Green background for added lines (`+`)
- Red background for deleted lines (`-`)
- Neutral background for context lines
- Expandable sections for large diffs

### Acceptance Criteria

- [ ] Diff component renders file patches from GitHub API
- [ ] Line numbers displayed on both sides (old/new)
- [ ] Added lines have green background with `+` indicator
- [ ] Deleted lines have red background with `-` indicator
- [ ] Context lines have neutral background (unchanged code)
- [ ] Syntax highlighting works for common languages (JavaScript, TypeScript, Python, Go, Java, CSS)
- [ ] Component handles edge cases (binary files, large diffs, no changes)
- [ ] Diff rendering is responsive (works on mobile, tablet, desktop)
- [ ] Performance tested with large diffs (1000+ line changes)

### Technical Requirements

**Implementation Options**:
1. `react-diff-viewer-continued` (preferred - actively maintained fork)
2. `diff2html` (alternative - mature, feature-rich)
3. Custom component (avoid - reinventing the wheel)

**File to Update**: `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx:153-159`

**Current Code** (to be replaced):
```tsx
{file.patch && (
  <div className="mt-3 overflow-x-auto rounded-md bg-muted p-4">
    <pre className="text-xs font-mono">
      <code>{file.patch}</code>
    </pre>
  </div>
)}
```

**New Component**: `src/components/diff-viewer.tsx`

### Priority: P0 (Critical)

**Rationale**: Without proper diff rendering, the dashboard is unusable for actual code review. This is the #1 blocker for MVP.

### Estimated Effort: 4 hours

**Breakdown**:
- RED phase (TDD tests): 1 hour
- GREEN phase (implementation): 2 hours
- REFACTOR phase (optimization): 1 hour

### Definition of Done

- [ ] Feature implemented with TDD (RED → GREEN → REFACTOR)
- [ ] All acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Tests pass (>= 95% coverage for new code)
- [ ] Code reviewed by Lead Engineer
- [ ] Performance tested with 1000+ line diff
- [ ] Documented in component JSDoc comments

### Test Cases

**Unit Tests** (`src/components/diff-viewer.test.tsx`):
- Renders added lines with green background
- Renders deleted lines with red background
- Renders context lines with neutral background
- Displays correct line numbers
- Handles binary files gracefully
- Handles empty patches
- Syntax highlighting applies to TypeScript code

**Integration Tests**:
- Diff viewer renders on PR detail page
- Multiple file diffs render correctly
- Scroll behavior works for long diffs

---

## User Story #2: Basic Comment Threading System

**As a** team member reviewing a pull request
**I want** to add comments to PRs and reply to others' comments
**So that** we can discuss code changes, ask questions, and collaborate in context

### User Context

**Current State**: No comment system exists. Users cannot discuss PRs within the dashboard.

**Pain Point**: Code review requires asynchronous collaboration. Without comments, the dashboard is a read-only viewer, not a collaboration tool.

**Expected Outcome**: Basic comment system with:
- Comment input box on PR detail page
- Comments display in chronological order
- Each comment shows author, timestamp, body
- Reply threading (comments can have replies)
- Real-time synchronization (new comments appear for all viewers)

### Acceptance Criteria

- [ ] Comment input box appears on PR detail page
- [ ] Users can submit comments with markdown support
- [ ] Comments display below PR description
- [ ] Each comment shows avatar, username, timestamp
- [ ] Users can reply to existing comments (nested threading)
- [ ] Comments sync in real-time (2s polling, matching presence/cursor architecture)
- [ ] Comment count badge shows total comments on PR
- [ ] Empty state message when no comments exist
- [ ] Comment submission validates (non-empty, max length)
- [ ] Comment timestamps use relative format ("2 minutes ago")

### Technical Requirements

**Database Migration**: `supabase/migrations/004_create_comments_table.sql`

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL, -- format: "owner/repo/number"
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_comment_id UUID REFERENCES comments(id), -- NULL for top-level, UUID for replies
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_pr_id ON comments(pr_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by all authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**New Components**:
- `src/components/comment-input.tsx` - Input box with submit button
- `src/components/comment-thread.tsx` - Thread display with replies
- `src/components/comment-item.tsx` - Single comment display
- `src/lib/hooks/use-comments.ts` - Real-time comment polling hook

**API Integration**:
- `src/lib/supabase/comments.ts` - Supabase queries (getComments, createComment, etc.)

**Real-Time Strategy**: Database polling (2s interval) matching presence/cursor architecture for consistency.

### Priority: P1 (High)

**Rationale**: Comments are essential for collaboration. Without them, the dashboard is incomplete as a code review tool. However, basic viewing functionality works without comments.

### Estimated Effort: 6 hours

**Breakdown**:
- Database migration: 30 minutes
- RED phase (TDD tests): 1.5 hours
- GREEN phase (implementation): 3 hours
- REFACTOR phase (optimization): 1 hour

### Definition of Done

- [ ] Feature implemented with TDD (RED → GREEN → REFACTOR)
- [ ] All acceptance criteria met
- [ ] Zero TypeScript errors
- [ ] Tests pass (>= 95% coverage for new code)
- [ ] Code reviewed by Lead Engineer
- [ ] Database migration tested (up/down)
- [ ] RLS policies verified (users can only edit/delete own comments)
- [ ] Real-time sync tested with 2+ browser windows
- [ ] Documented in component JSDoc comments

### Test Cases

**Unit Tests** (`src/lib/hooks/use-comments.test.ts`):
- Fetches comments for PR ID
- Creates new comment successfully
- Creates reply to existing comment
- Polls for new comments every 2s
- Cleans up polling on unmount

**Component Tests**:
- `src/components/comment-input.test.tsx`: Validates input, submits comment
- `src/components/comment-thread.test.tsx`: Displays nested replies correctly
- `src/components/comment-item.test.tsx`: Shows avatar, username, timestamp, body

**Integration Tests**:
- Comment appears in real-time for other viewers
- Reply threading works (parent → child relationship)
- Comment count updates correctly

---

## User Story #3: Core Test Coverage for Production Readiness

**As a** developer
**I want** core features tested with >= 80% coverage
**So that** we can confidently deploy to production and prevent regressions

### User Context

**Current State**: Zero test coverage. No tests exist for hooks, components, or integration flows.

**Pain Point**: Without tests, refactoring is risky, bugs can reoccur, and production deployment confidence is low.

**Expected Outcome**: Comprehensive test suite covering:
- Custom hooks (use-presence, use-cursors, use-comments)
- React components (LiveCursor, CursorsLayer, PresenceIndicator, DiffViewer, CommentThread)
- Integration flows (cursor tracking, comment sync)

### Acceptance Criteria

- [ ] All custom hooks have unit tests (>= 90% coverage)
- [ ] All React components have component tests (>= 85% coverage)
- [ ] Integration tests cover real-time flows (presence, cursors, comments)
- [ ] Overall coverage >= 80% for core features
- [ ] Tests run in CI/CD pipeline (if configured)
- [ ] All tests pass on `npm test`
- [ ] Coverage report generated (`npm run test:coverage`)
- [ ] Test documentation added to README

### Technical Requirements

**Testing Libraries** (already in package.json):
- `jest` - Test runner
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation

**Test Files to Create**:

1. **Hook Tests**:
   - `src/lib/hooks/use-presence.test.ts`
   - `src/lib/hooks/use-cursors.test.ts`
   - `src/lib/hooks/use-comments.test.ts`

2. **Component Tests**:
   - `src/components/live-cursor.test.tsx`
   - `src/components/cursors-layer.test.tsx`
   - `src/components/presence-indicator.test.tsx`
   - `src/components/diff-viewer.test.tsx`
   - `src/components/comment-input.test.tsx`
   - `src/components/comment-thread.test.tsx`
   - `src/components/comment-item.test.tsx`

3. **Integration Tests** (optional for MVP, recommended):
   - `src/__tests__/integration/cursor-tracking.test.tsx`
   - `src/__tests__/integration/comment-sync.test.tsx`

**Jest Configuration**: Update `jest.config.js` with coverage thresholds:
```js
module.exports = {
  collectCoverageFrom: [
    'src/lib/hooks/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Priority: P2 (Medium)

**Rationale**: Tests are critical for production readiness but do not block MVP demo. The dashboard can be demoed without tests, but should not be deployed to production without them.

### Estimated Effort: 4 hours

**Breakdown**:
- Hook tests: 1.5 hours
- Component tests: 2 hours
- Integration tests: 30 minutes (basic coverage)

### Definition of Done

- [ ] All test files created and passing
- [ ] Coverage >= 80% for core features
- [ ] Zero TypeScript errors
- [ ] Tests run on `npm test` without failures
- [ ] Coverage report reviewed by QA Lead
- [ ] Test documentation added to README
- [ ] CI/CD integration documented (even if not configured yet)

### Test Cases

**Hook Tests** (`use-cursors.test.ts` example):
- Initializes with empty cursors array
- Sends cursor position on mousemove
- Throttles cursor updates (spatial + temporal)
- Polls for other users' cursors every 2s
- Fades out inactive cursors after 3s
- Cleans up polling on unmount

**Component Tests** (`live-cursor.test.tsx` example):
- Renders cursor SVG at correct position
- Displays username label
- Applies correct color from user
- Animates smoothly (lerp interpolation)
- Fades out after inactivity

**Integration Tests** (`cursor-tracking.test.tsx` example):
- User A moves cursor → User B sees it in real-time
- Multiple cursors render simultaneously
- Cursors clean up when users leave

---

## User Story #4: Error Handling and Edge Cases

**As a** user
**I want** clear error messages and graceful degradation
**So that** I understand what went wrong and the app doesn't crash

### User Context

**Current State**: Basic error handling exists, but edge cases may not be covered.

**Pain Point**: Users may encounter errors without clear feedback (e.g., network failures, API rate limits, invalid PR IDs).

**Expected Outcome**: Robust error handling with:
- User-friendly error messages
- Graceful degradation (show partial data instead of crashing)
- Retry mechanisms for transient failures
- Loading states for async operations

### Acceptance Criteria

- [ ] API errors display user-friendly messages (not raw error text)
- [ ] Network failures show "Connection lost" toast with retry button
- [ ] Invalid PR IDs show 404 page with navigation back
- [ ] Rate limit errors show "Rate limited, try again in X minutes"
- [ ] Loading states displayed for all async operations (spinners, skeletons)
- [ ] Error boundaries catch React errors and show fallback UI
- [ ] Console errors logged for debugging (but not shown to users)

### Priority: P2 (Medium)

**Rationale**: Basic error handling exists. This story enhances user experience but is not critical for MVP demo.

### Estimated Effort: 2 hours

### Definition of Done

- [ ] All acceptance criteria met
- [ ] Error scenarios tested manually
- [ ] Error boundary implemented
- [ ] Toast notifications for transient errors
- [ ] 404 page for invalid routes

---

## User Story #5: Documentation for Handoff

**As a** developer taking over this project
**I want** clear documentation of architecture, setup, and deployment
**So that** I can onboard quickly and maintain the dashboard

### User Context

**Current State**: README exists but is minimal. No architecture docs, limited setup instructions.

**Pain Point**: New developers need to read code to understand system design. Deployment process is undocumented.

**Expected Outcome**: Comprehensive documentation including:
- Architecture overview (components, hooks, data flow)
- Setup guide (env vars, Supabase config, GitHub OAuth)
- Deployment guide (Vercel, Netlify, self-hosted)
- API documentation (Supabase queries, GitHub API calls)
- Contributing guide (how to add features)

### Acceptance Criteria

- [ ] README updated with detailed setup instructions
- [ ] ARCHITECTURE.md created with system design diagrams
- [ ] DEPLOYMENT.md created with deployment steps
- [ ] API.md created with Supabase schema and queries
- [ ] CONTRIBUTING.md created with development workflow
- [ ] All environment variables documented
- [ ] Screenshots added to README for visual reference

### Priority: P2 (Medium)

**Rationale**: Documentation aids handoff but is not required for MVP demo. Can be completed after demo if time is limited.

### Estimated Effort: 2 hours

### Definition of Done

- [ ] All documentation files created
- [ ] README includes screenshots
- [ ] Architecture diagrams added (Mermaid or images)
- [ ] Deployment tested following new guide
- [ ] Reviewed by Product Owner

---

## Sprint Summary

### Total User Stories: 5

**Critical (P0)**: 1 story
- Better Diff Rendering

**High (P1)**: 1 story
- Comment Threading System

**Medium (P2)**: 3 stories
- Core Test Coverage
- Error Handling
- Documentation

### Total Estimated Effort: 18 hours (2-3 days)

**Day 1**: Diff rendering (4h) + Start comments (2h)
**Day 2**: Finish comments (4h) + Core tests (4h)
**Day 3**: Error handling (2h) + Documentation (2h)

### Success Criteria for Sprint 2

**Sprint is successful when**:
1. ✅ Diff rendering displays syntax-highlighted, color-coded diffs
2. ✅ Users can add comments and reply to comments
3. ✅ Real-time comment sync works (polling)
4. ✅ Core features have >= 80% test coverage
5. ✅ Error handling covers common edge cases
6. ✅ Documentation complete for handoff
7. ✅ Zero TypeScript errors
8. ✅ All tests pass

### Demo-Ready Checklist

- [ ] Diff rendering works for sample PR (show TypeScript file)
- [ ] Comment system works (add comment, reply, real-time sync in 2 browsers)
- [ ] Presence and cursors work in multiple browser windows
- [ ] All tests pass (`npm test`)
- [ ] Coverage report shows >= 80% (`npm run test:coverage`)
- [ ] README updated with setup instructions
- [ ] No console errors on production build

---

## INVEST Validation

Each user story has been validated against INVEST criteria:

- **Independent**: Stories can be implemented in parallel (diff, comments, tests)
- **Negotiable**: Details can be adjusted (e.g., comment markdown support can be deferred)
- **Valuable**: Each story delivers user value (better diffs, collaboration, confidence)
- **Estimable**: All stories have clear effort estimates (2-6 hours)
- **Small**: All stories fit within sprint (largest is 6 hours)
- **Testable**: All stories have clear acceptance criteria and test cases

---

## Dependencies

**Story #2 (Comments)** → **Story #3 (Tests)**: Comment tests depend on comment implementation

**Story #1 (Diffs)** → **Story #3 (Tests)**: Diff tests depend on diff implementation

**All Stories** → **Story #5 (Documentation)**: Docs written after features complete

**Recommendation**: Implement in order P0 → P1 → P2 to manage dependencies naturally.

---

## Risk Mitigation

**Risk #1**: Diff rendering library doesn't support desired features
- **Mitigation**: Research 2 libraries (react-diff-viewer-continued, diff2html) before implementation
- **Fallback**: Build minimal custom component if libraries fail

**Risk #2**: Real-time comment sync has race conditions
- **Mitigation**: Use same polling architecture as cursors (proven stable)
- **Fallback**: Require manual refresh if polling fails

**Risk #3**: Test coverage goal not met in time
- **Mitigation**: Prioritize hook tests (highest value, lowest effort)
- **Fallback**: Lower threshold to 70% if needed

---

## Next Steps

**1. Business Analyst**: Refine requirements for comment markdown support
**2. Lead Engineer**: Create technical design for diff component
**3. QA Lead**: Create TDD test strategy (RED phase)
**4. Scrum Master**: Consolidate sprint plan and assign stories
**5. Execute**: TDD RED-GREEN-REFACTOR implementation

---

**Sprint Status**: READY FOR PLANNING
**User Stories Created**: 2026-01-11
**Created By**: Product Owner (agile-team)
