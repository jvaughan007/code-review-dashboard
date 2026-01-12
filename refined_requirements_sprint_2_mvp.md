# Sprint 2: MVP Completion - Refined Requirements

**Sprint Goal**: Complete MVP features (diff rendering, comments, tests) to make dashboard production-ready for demo and handoff

**Refined From**: `user_stories_sprint_2_mvp.md` (5 user stories)
**Created By**: Business Analyst (agile-team)
**Date**: 2026-01-11

---

## Executive Summary

This document refines 5 user stories into detailed functional and non-functional requirements for Sprint 2. The sprint focuses on completing critical MVP features to transition the Code Review Dashboard from 70% complete to production-ready.

**Key Deliverables**:
1. Syntax-highlighted diff rendering (replacing raw patch display)
2. Real-time comment threading system
3. Comprehensive test coverage (>= 80%)
4. Robust error handling
5. Complete documentation for handoff

**Estimated Duration**: 2-3 days (18 hours total effort)

---

## Functional Requirements

### FR-A: Diff Rendering (from Story #1)

**Objective**: Replace raw patch text display with GitHub-quality diff rendering featuring syntax highlighting, line numbers, and color-coded changes.

#### FR-A.1: Diff Component Implementation

**Requirement**: Create a reusable `DiffViewer` component that renders GitHub API patch data with professional styling.

**Details**:
- **Component Location**: `src/components/diff-viewer.tsx`
- **Props Interface**:
  ```typescript
  interface DiffViewerProps {
    patch: string;           // GitHub API patch string
    filename: string;        // For syntax highlighting detection
    language?: string;       // Optional language override
    showLineNumbers?: boolean; // Default: true
    maxHeight?: string;      // For scrollable diffs, default: "600px"
  }
  ```
- **Rendering Modes**: Side-by-side (desktop), unified (mobile)
- **Expandable Sections**: Collapse large unchanged sections with "Expand X lines" button

**Acceptance Criteria**:
- Component accepts GitHub patch format (`@@ -1,5 +1,7 @@` headers)
- Renders within 500ms for 500-line diffs
- Gracefully handles invalid patch format (shows error message)
- Supports lazy rendering for large PRs (render on file expansion)

#### FR-A.2: Line Number Display

**Requirement**: Display line numbers for both old and new versions of the file.

**Details**:
- **Old Line Numbers**: Left column, shows original file line numbers
- **New Line Numbers**: Right column, shows modified file line numbers
- **Skipped Lines**: Show `...` for collapsed sections with expand button
- **Alignment**: Line numbers must align with code lines (no offset issues)

**Acceptance Criteria**:
- Line numbers match GitHub's diff view
- Line numbers are non-selectable (user can copy code without numbers)
- Line numbers have distinct background color from code
- Line numbers are monospaced for alignment

#### FR-A.3: Color-Coded Change Indicators

**Requirement**: Use color coding to distinguish additions, deletions, and context lines.

**Details**:
- **Added Lines**: Green background (`bg-green-50 dark:bg-green-900/20`), `+` prefix
- **Deleted Lines**: Red background (`bg-red-50 dark:bg-red-900/20`), `-` prefix
- **Context Lines**: Neutral background (`bg-muted`), no prefix
- **Modified Lines**: Yellow highlight for changed portions within line (word-level diff)
- **Dark Mode Support**: All colors must have dark mode variants

**Acceptance Criteria**:
- Colors meet WCAG 2.1 Level AA contrast requirements (4.5:1 for text)
- Word-level diff highlights exact changed tokens (not entire line)
- Colors are visually distinct for colorblind users (use patterns/icons)

#### FR-A.4: Syntax Highlighting

**Requirement**: Apply syntax highlighting based on file extension.

**Details**:
- **Supported Languages** (minimum):
  - JavaScript (.js, .jsx)
  - TypeScript (.ts, .tsx)
  - Python (.py)
  - Go (.go)
  - Java (.java)
  - CSS (.css, .scss, .sass)
  - HTML (.html)
  - JSON (.json)
  - Markdown (.md)
  - YAML (.yml, .yaml)
- **Fallback**: Plain text rendering for unsupported languages
- **Library**: Use Prism.js or highlight.js for syntax highlighting
- **Theme**: Match application theme (light/dark mode)

**Acceptance Criteria**:
- Syntax highlighting does not interfere with diff colors (use opacity)
- Highlighting renders asynchronously (does not block UI)
- Language detection fallback to plain text (no errors)
- Syntax theme is customizable via Tailwind config

#### FR-A.5: Edge Case Handling

**Requirement**: Handle edge cases gracefully without crashes.

**Details**:
- **Binary Files**: Show message "Binary file (no preview available)"
- **Empty Patches**: Show message "No changes in this file"
- **Large Diffs**: Virtual scrolling for diffs > 1000 lines
- **Invalid Patch Format**: Show error message with raw patch as fallback
- **Network Failures**: Show loading skeleton, retry on failure

**Acceptance Criteria**:
- Binary file detection works for images, PDFs, executables
- Large diff performance tested up to 5000 lines
- Error messages are user-friendly (no technical jargon)
- Loading states use skeleton loaders (not spinners)

#### FR-A.6: Responsive Design

**Requirement**: Diff rendering must work on all screen sizes.

**Details**:
- **Desktop (>= 1024px)**: Side-by-side view (old | new)
- **Tablet (768px - 1023px)**: Unified view with line numbers
- **Mobile (< 768px)**: Unified view, single column, horizontal scroll for long lines
- **Touch Support**: Swipe to scroll, tap to expand sections

**Acceptance Criteria**:
- Breakpoints use Tailwind's responsive classes
- Horizontal scroll does not break layout
- Touch gestures work on iOS and Android
- Line numbers remain visible during scroll

---

### FR-B: Comment System (from Story #2)

**Objective**: Implement real-time comment threading system for PR collaboration.

#### FR-B.1: Database Schema

**Requirement**: Create `comments` table with support for threading and real-time sync.

**Details**:
- **Migration File**: `supabase/migrations/004_create_comments_table.sql`
- **Schema**:
  ```sql
  CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id TEXT NOT NULL,                    -- Format: "owner/repo/123"
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX idx_comments_pr_id ON comments(pr_id);
  CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
  CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
  CREATE INDEX idx_comments_user_id ON comments(user_id);
  ```
- **Constraints**:
  - `body` length: 1-10,000 characters
  - `parent_comment_id` must reference existing comment (no orphans)
  - Cascade delete when user or parent comment deleted

**Acceptance Criteria**:
- Migration is idempotent (can run multiple times safely)
- Indexes improve query performance (< 100ms for 1000 comments)
- Constraints prevent invalid data (empty comments, circular references)
- Down migration fully reverses schema changes

#### FR-B.2: Row Level Security (RLS) Policies

**Requirement**: Implement RLS policies to control comment access.

**Details**:
- **Policy 1 - SELECT**: All authenticated users can view all comments
  ```sql
  CREATE POLICY "Comments are viewable by all authenticated users"
    ON comments FOR SELECT
    TO authenticated
    USING (true);
  ```
- **Policy 2 - INSERT**: Users can create comments with their own user_id
  ```sql
  CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  ```
- **Policy 3 - UPDATE**: Users can only update their own comments
  ```sql
  CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  ```
- **Policy 4 - DELETE**: Users can only delete their own comments
  ```sql
  CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  ```

**Acceptance Criteria**:
- Unauthenticated users cannot access comments (401 error)
- Users cannot impersonate others (insert with different user_id fails)
- Comment edit/delete buttons only appear for comment author
- RLS policies tested with multiple user accounts

#### FR-B.3: Comment Input Component

**Requirement**: Provide input interface for creating comments and replies.

**Details**:
- **Component**: `src/components/comment-input.tsx`
- **Features**:
  - Textarea with auto-resize (min 60px, max 300px)
  - Character counter (0/10,000)
  - Submit button (disabled until valid input)
  - Cancel button (for replies, clears input)
  - Markdown preview toggle (optional for MVP)
- **Validation**:
  - Minimum length: 1 character
  - Maximum length: 10,000 characters
  - Trim whitespace before submission
  - Show error message for invalid input
- **Loading States**:
  - Disable input during submission
  - Show loading spinner on submit button
  - Optimistic update (show comment immediately, rollback on error)

**Acceptance Criteria**:
- Input autofocuses when reply button clicked
- Enter submits, Shift+Enter adds new line
- Character counter updates in real-time
- Submit button shows loading state during API call
- Error toast appears on submission failure

#### FR-B.4: Comment Display Component

**Requirement**: Display individual comments with author, timestamp, and content.

**Details**:
- **Component**: `src/components/comment-item.tsx`
- **Layout**:
  ```
  [Avatar] [Username]  [Timestamp]  [Edit] [Delete]
          [Comment body with markdown rendering]
          [Reply button]
  ```
- **Avatar**: User's GitHub avatar (40x40px, rounded)
- **Username**: GitHub username (bold)
- **Timestamp**: Relative format ("2 minutes ago", "3 hours ago", "Jan 10")
- **Comment Body**: Render markdown (bold, italic, code, links)
- **Actions**:
  - Reply button (visible to all)
  - Edit button (visible to author only)
  - Delete button (visible to author only)
- **Edit Mode**:
  - Replace body with textarea
  - Show Save/Cancel buttons
  - Update timestamp to "edited" indicator

**Acceptance Criteria**:
- Markdown renders safely (no XSS vulnerabilities)
- Relative timestamps update every minute
- Edit mode preserves original text (cancel restores)
- Delete shows confirmation modal ("Are you sure?")
- Avatar loads lazily (use placeholder during load)

#### FR-B.5: Comment Threading Component

**Requirement**: Display threaded comment structure with nested replies.

**Details**:
- **Component**: `src/components/comment-thread.tsx`
- **Threading Logic**:
  - Top-level comments: `parent_comment_id IS NULL`
  - Replies: `parent_comment_id = <parent_id>`
  - Max nesting depth: 3 levels (top → reply → reply to reply)
- **Visual Hierarchy**:
  - Indent replies 40px from parent
  - Vertical line connecting parent to replies
  - Lighter background for nested levels
- **Sorting**:
  - Top-level comments: Chronological (oldest first)
  - Replies: Chronological within thread
  - Option to sort by "Newest first" (future enhancement)

**Acceptance Criteria**:
- Threading visualized with indent and connecting lines
- Max depth enforced (show "Reply" only for depth < 3)
- Empty state shown when no comments exist ("Be the first to comment!")
- Replies collapse/expand toggle (show/hide nested comments)

#### FR-B.6: Real-Time Synchronization

**Requirement**: Poll database for new comments and sync across all viewers.

**Details**:
- **Hook**: `src/lib/hooks/use-comments.ts`
- **Polling Strategy**:
  - Interval: 2 seconds (consistent with presence/cursors)
  - Fetch comments where `pr_id = current PR`
  - Join with `auth.users` for usernames/avatars
  - Only fetch comments newer than last fetch timestamp (optimization)
- **Optimistic Updates**:
  - Add comment to local state immediately on submit
  - Assign temporary ID (replace with real ID on server response)
  - Rollback if server returns error
- **Cleanup**:
  - Clear polling interval on unmount
  - No memory leaks (verified in tests)

**Acceptance Criteria**:
- New comments appear within 2 seconds for all viewers
- Optimistic updates show instantly for author
- Polling stops when component unmounts
- Network errors do not crash app (retry with exponential backoff)

---

### FR-C: Test Coverage (from Story #3)

**Objective**: Achieve >= 80% test coverage for core features to ensure production readiness.

#### FR-C.1: Hook Unit Tests

**Requirement**: Test all custom React hooks with >= 90% coverage.

**Details**:
- **Test Files**:
  1. `src/lib/hooks/use-presence.test.ts`
  2. `src/lib/hooks/use-cursors.test.ts`
  3. `src/lib/hooks/use-comments.test.ts`
- **Test Cases**:
  - Initialization (default state)
  - Data fetching (success, error, loading states)
  - Polling behavior (interval, cleanup)
  - Optimistic updates (comments)
  - Error handling (network failures)
  - Cleanup (no memory leaks)
- **Testing Library**: `@testing-library/react-hooks` (or React 18 renderHook)
- **Mocking**: Mock Supabase client with `jest.mock()`

**Acceptance Criteria**:
- All hooks tested independently (unit isolation)
- Coverage >= 90% for branches, functions, lines, statements
- Tests use descriptive names (describe/it blocks)
- Mock data matches production schema

#### FR-C.2: Component Tests

**Requirement**: Test React components with >= 85% coverage.

**Details**:
- **Test Files**:
  1. `src/components/live-cursor.test.tsx`
  2. `src/components/cursors-layer.test.tsx`
  3. `src/components/presence-indicator.test.tsx`
  4. `src/components/diff-viewer.test.tsx`
  5. `src/components/comment-input.test.tsx`
  6. `src/components/comment-thread.test.tsx`
  7. `src/components/comment-item.test.tsx`
- **Test Cases**:
  - Rendering (correct DOM structure)
  - User interactions (clicks, keyboard, mouse events)
  - Prop variations (different data inputs)
  - Conditional rendering (show/hide elements)
  - Accessibility (ARIA labels, keyboard navigation)
  - Error states (invalid props, network failures)
- **Testing Library**: `@testing-library/react` with `userEvent`
- **Assertions**: Use `@testing-library/jest-dom` matchers

**Acceptance Criteria**:
- Components render without errors
- User interactions tested (click, type, hover)
- Snapshots used for complex UI (regression detection)
- Coverage >= 85% for all components

#### FR-C.3: Integration Tests

**Requirement**: Test end-to-end flows with >= 80% coverage of critical paths.

**Details**:
- **Test Files**:
  1. `src/__tests__/integration/cursor-tracking.test.tsx`
  2. `src/__tests__/integration/comment-sync.test.tsx`
- **Test Scenarios**:
  - **Cursor Tracking Flow**:
    1. User A opens PR
    2. User B opens same PR
    3. User A moves mouse → User B sees cursor in real-time
    4. User A leaves → Cursor disappears for User B
  - **Comment Sync Flow**:
    1. User A adds comment
    2. Comment appears immediately for User A (optimistic)
    3. Comment syncs to User B within 2 seconds
    4. User B replies → Reply appears for both users
- **Mocking**: Mock Supabase real-time updates with polling simulation
- **Test Environment**: Use in-memory Supabase (or mock responses)

**Acceptance Criteria**:
- Integration tests cover end-to-end user flows
- Tests simulate multi-user scenarios (2+ users)
- Timing verified (2s polling latency)
- Coverage >= 80% for integration test files

#### FR-C.4: Coverage Thresholds

**Requirement**: Configure Jest to enforce minimum coverage thresholds.

**Details**:
- **Jest Config**: Update `jest.config.js`
  ```js
  module.exports = {
    collectCoverageFrom: [
      'src/lib/hooks/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.stories.tsx',
      '!src/**/index.ts',
    ],
    coverageThresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
      './src/lib/hooks/': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  };
  ```
- **Coverage Reports**: HTML, JSON, LCOV (for CI/CD)
- **Enforcement**: Test suite fails if thresholds not met

**Acceptance Criteria**:
- Coverage thresholds defined in Jest config
- `npm test` fails if coverage < thresholds
- Coverage report generated in `coverage/` directory
- CI/CD pipeline runs tests and uploads coverage report

#### FR-C.5: Test Documentation

**Requirement**: Document test strategy and how to run tests.

**Details**:
- **README Section**: Add "Testing" section to README
- **Content**:
  - How to run tests: `npm test`
  - How to run with coverage: `npm run test:coverage`
  - How to run specific test file: `npm test -- use-cursors.test.ts`
  - How to run in watch mode: `npm test -- --watch`
  - Coverage thresholds and rationale
  - Mocking strategy (Supabase, GitHub API)
- **Test Strategy Document**: Optional `TESTING.md` for detailed test patterns

**Acceptance Criteria**:
- README includes test commands
- Coverage thresholds documented
- New developers can run tests without guidance

---

### FR-D: Error Handling (from Story #4)

**Objective**: Implement robust error handling and graceful degradation for all user-facing features.

#### FR-D.1: User-Friendly Error Messages

**Requirement**: Display clear, actionable error messages instead of technical errors.

**Details**:
- **Error Categories**:
  - **Network Errors**: "Unable to connect. Please check your internet."
  - **API Errors**: "GitHub API error. Try again later."
  - **Rate Limits**: "Rate limited. Try again in 15 minutes."
  - **Authentication Errors**: "Session expired. Please log in again."
  - **Validation Errors**: "Comment must be 1-10,000 characters."
  - **Not Found**: "Pull request not found."
- **Error Display**:
  - Toast notifications for transient errors (auto-dismiss after 5s)
  - Inline error messages for form validation (below input field)
  - Error pages for fatal errors (404, 500)
- **Error Logging**:
  - Log technical errors to console (for debugging)
  - Do not expose stack traces to users
  - Optional: Send errors to monitoring service (Sentry)

**Acceptance Criteria**:
- All errors show user-friendly messages (no raw error text)
- Toast notifications auto-dismiss and are dismissible manually
- Console logs include full error details (stack trace, context)
- Error messages are actionable ("Try again", "Check internet")

#### FR-D.2: Loading States

**Requirement**: Show loading indicators for all async operations.

**Details**:
- **Loading Indicators**:
  - **Skeleton Loaders**: For content (PR details, comments, diffs)
  - **Spinners**: For buttons (submit, load more)
  - **Progress Bars**: For long operations (optional for MVP)
- **Placement**:
  - Diff viewer: Skeleton with shimmer animation
  - Comments: Skeleton for comment items
  - Buttons: Spinner inside button (disable button)
- **Accessibility**: ARIA labels for loading states ("Loading comments...")

**Acceptance Criteria**:
- All async operations show loading state
- Loading states match design system (Tailwind)
- Loading indicators have ARIA labels
- Loading states do not block UI (user can navigate away)

#### FR-D.3: Retry Mechanisms

**Requirement**: Allow users to retry failed operations.

**Details**:
- **Retry Button**: Show in error toast or inline error message
- **Exponential Backoff**: Retry after 1s, 2s, 4s, 8s (max 4 retries)
- **Automatic Retries**: For transient network errors (< 500ms timeout)
- **Manual Retries**: For persistent errors (user clicks "Retry")

**Acceptance Criteria**:
- Retry button appears for failed operations
- Exponential backoff prevents server overload
- Max retries enforced (stop after 4 attempts)
- Retry state tracked (show "Retrying..." during retry)

#### FR-D.4: Error Boundaries

**Requirement**: Catch React errors and show fallback UI.

**Details**:
- **Component**: `src/components/error-boundary.tsx`
- **Fallback UI**:
  - Error icon + message: "Something went wrong"
  - "Reload page" button
  - "Report issue" link (optional)
- **Error Logging**: Log component stack to console
- **Placement**: Wrap PR detail page, comment section, diff viewer

**Acceptance Criteria**:
- Error boundary catches React errors (prevent white screen)
- Fallback UI is user-friendly (not scary technical message)
- Reload button refreshes page
- Error logged to console for debugging

#### FR-D.5: Graceful Degradation

**Requirement**: Show partial data instead of failing completely.

**Details**:
- **Scenarios**:
  - **Diff Rendering Fails**: Show raw patch as fallback
  - **Comments Fail to Load**: Show empty state with retry button
  - **Syntax Highlighting Fails**: Show plain text diff
  - **Avatars Fail to Load**: Show initials placeholder
- **Partial Success**: If 3/5 files load, show 3 and error for 2

**Acceptance Criteria**:
- Partial data displayed when possible
- Errors do not block entire page
- Fallback UI clearly indicates degraded state
- User can retry individual failed sections

---

### FR-E: Documentation (from Story #5)

**Objective**: Provide comprehensive documentation for developers taking over the project.

#### FR-E.1: Updated README

**Requirement**: Enhance README with detailed setup, usage, and development instructions.

**Details**:
- **Sections**:
  1. **Overview**: What is this project?
  2. **Features**: List all features (auth, diffs, comments, presence, cursors)
  3. **Tech Stack**: Next.js 16, TypeScript 5.7.2, Supabase, Tailwind
  4. **Prerequisites**: Node.js 20+, Supabase account, GitHub OAuth app
  5. **Setup**: Step-by-step environment configuration
  6. **Development**: How to run dev server, build, test
  7. **Deployment**: Vercel deployment steps
  8. **Testing**: How to run tests and view coverage
  9. **Contributing**: How to add features (TDD workflow)
  10. **License**: MIT or Apache 2.0
- **Screenshots**: Add screenshots of key features (PR detail, comments, cursors)

**Acceptance Criteria**:
- README >= 500 lines (comprehensive)
- Setup instructions tested by new developer
- Screenshots show current UI (not outdated)
- Links to related docs (ARCHITECTURE.md, TESTING.md)

#### FR-E.2: Architecture Documentation

**Requirement**: Create ARCHITECTURE.md with system design overview.

**Details**:
- **Sections**:
  1. **System Overview**: High-level architecture diagram
  2. **Directory Structure**: Explanation of src/ folders
  3. **Data Flow**: How data flows from GitHub API → UI
  4. **Real-Time Architecture**: Polling strategy for presence/cursors/comments
  5. **Database Schema**: Supabase tables (presence, cursors, comments)
  6. **Authentication Flow**: GitHub OAuth with Supabase Auth
  7. **Component Hierarchy**: React component tree
  8. **State Management**: Where state lives (hooks, contexts)
- **Diagrams**: Use Mermaid for flowcharts and sequence diagrams

**Acceptance Criteria**:
- Architecture doc >= 300 lines
- Diagrams render correctly in GitHub markdown
- All major systems explained (auth, real-time, API)
- Rationale documented for key decisions (polling vs WebSockets)

#### FR-E.3: API Documentation

**Requirement**: Document all Supabase queries and GitHub API calls.

**Details**:
- **File**: `API.md`
- **Sections**:
  1. **Supabase Schema**: Tables, columns, types, constraints
  2. **RLS Policies**: Explanation of each policy
  3. **Queries**: List all SELECT, INSERT, UPDATE, DELETE queries
  4. **GitHub API Endpoints**: List all endpoints used (/repos, /pulls, etc.)
  5. **Rate Limits**: GitHub API rate limits and handling
  6. **Error Codes**: Expected error codes and meanings
- **Examples**: Include example requests/responses

**Acceptance Criteria**:
- All Supabase tables documented
- All RLS policies explained
- All GitHub API endpoints listed
- Example queries provided

#### FR-E.4: Deployment Guide

**Requirement**: Create DEPLOYMENT.md with deployment instructions.

**Details**:
- **Platforms Covered**:
  1. **Vercel** (recommended)
  2. **Netlify** (alternative)
  3. **Self-Hosted** (Docker or Node.js)
- **Steps for Each Platform**:
  - Environment variables setup
  - Build command configuration
  - Database migration execution
  - OAuth callback URL configuration
  - Custom domain setup (optional)
- **Production Checklist**: Pre-deployment verification steps

**Acceptance Criteria**:
- Deployment guide tested on Vercel
- All environment variables documented
- OAuth setup instructions clear
- Production checklist complete

#### FR-E.5: Contributing Guide

**Requirement**: Create CONTRIBUTING.md with development workflow.

**Details**:
- **Sections**:
  1. **Development Workflow**: TDD (RED → GREEN → REFACTOR)
  2. **Code Style**: TypeScript strict, ESLint rules
  3. **Commit Messages**: Conventional commits format
  4. **Pull Request Template**: What to include in PR description
  5. **Testing Requirements**: Coverage thresholds, test types
  6. **Code Review Checklist**: What reviewers should check
- **Examples**: Show example test, example commit, example PR

**Acceptance Criteria**:
- CONTRIBUTING.md >= 200 lines
- TDD workflow explained with examples
- Code style enforced by tooling (ESLint, Prettier)
- PR template created in `.github/pull_request_template.md`

---

## Non-Functional Requirements

### NFR-1: Performance

**Objective**: Ensure fast, responsive user experience across all features.

#### NFR-1.1: Diff Rendering Performance

**Requirement**: Diff rendering must complete within acceptable time limits.

**Details**:
- **Target**: < 500ms for 500-line diff
- **Threshold**: < 2s for 5000-line diff
- **Optimization**:
  - Virtual scrolling for diffs > 1000 lines
  - Lazy rendering (render only visible viewport)
  - Code splitting (load diff library asynchronously)
- **Measurement**: Use Chrome DevTools Performance profiler

**Acceptance Criteria**:
- 500-line diff renders in < 500ms (p95)
- 5000-line diff renders in < 2s (p95)
- No UI blocking during render
- Smooth scrolling (60fps)

#### NFR-1.2: Real-Time Sync Latency

**Requirement**: Real-time features must sync within acceptable latency.

**Details**:
- **Presence**: < 2s latency (2s polling interval)
- **Cursors**: < 2s perceived latency (lerp animation smooths delay)
- **Comments**: < 2s latency (2s polling interval)
- **Optimization**:
  - Optimistic updates for comments (instant for author)
  - Cursor lerp animation (smooth interpolation)
  - Efficient database queries (indexed columns)

**Acceptance Criteria**:
- Presence updates within 2s (tested with network throttling)
- Cursor movement feels smooth (60fps animation)
- Comments appear within 2s for all viewers
- Optimistic updates instant for author

#### NFR-1.3: Initial Page Load

**Requirement**: PR detail page must load quickly.

**Details**:
- **Target**: < 3s for Time to Interactive (TTI)
- **Metrics**:
  - First Contentful Paint (FCP): < 1s
  - Largest Contentful Paint (LCP): < 2.5s
  - Time to Interactive (TTI): < 3s
- **Optimization**:
  - Server-side rendering (Next.js SSR)
  - Image optimization (next/image)
  - Code splitting (dynamic imports)
  - Font optimization (preload)

**Acceptance Criteria**:
- Lighthouse score >= 90 (Performance)
- Core Web Vitals pass (FCP, LCP, CLS)
- Page usable within 3s on 3G network

#### NFR-1.4: Database Query Performance

**Requirement**: All database queries must execute efficiently.

**Details**:
- **Target**: < 100ms for single query
- **Optimization**:
  - Indexes on all foreign keys and frequently queried columns
  - Limit query results (pagination)
  - Use `EXPLAIN ANALYZE` to verify query plans
- **Monitoring**: Log slow queries (> 200ms)

**Acceptance Criteria**:
- All queries < 100ms (p95)
- Indexes used for all WHERE/JOIN clauses
- No full table scans for large tables
- Query performance tested with 10,000 records

---

### NFR-2: Accessibility

**Objective**: Ensure dashboard is usable by people with disabilities.

#### NFR-2.1: WCAG 2.1 Level AA Compliance

**Requirement**: Meet WCAG 2.1 Level AA standards.

**Details**:
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: ARIA labels for all non-text elements
- **Focus Indicators**: Visible focus outline for all focusable elements
- **Heading Hierarchy**: Proper h1 → h6 hierarchy (no skipped levels)

**Acceptance Criteria**:
- All color combinations meet contrast requirements (use axe DevTools)
- All features usable without mouse (keyboard only)
- Screen reader announces all actions (tested with NVDA/JAWS)
- Focus visible on all interactive elements
- HTML validation passes (W3C validator)

#### NFR-2.2: Keyboard Navigation

**Requirement**: Support full keyboard navigation.

**Details**:
- **Tab Order**: Logical tab order (top to bottom, left to right)
- **Focus Management**: Focus moves to new content (modals, toasts)
- **Shortcuts**: Optional keyboard shortcuts (e.g., "C" to comment)
- **Escape Key**: Close modals/dropdowns with Escape

**Acceptance Criteria**:
- Tab order follows visual layout
- Focus trapped in modals (Tab cycles within modal)
- Escape closes all overlays
- Shortcuts documented in help menu

#### NFR-2.3: Screen Reader Support

**Requirement**: Provide meaningful screen reader announcements.

**Details**:
- **ARIA Labels**: All icons have aria-label
- **ARIA Live Regions**: Announce dynamic changes (new comments, cursor positions)
- **Alt Text**: All images have descriptive alt text
- **Form Labels**: All form inputs have associated labels
- **Skip Links**: "Skip to main content" link at page top

**Acceptance Criteria**:
- All images have alt text (or aria-hidden if decorative)
- Dynamic changes announced by screen reader
- Forms fully navigable by screen reader
- Skip links functional (tested with NVDA)

---

### NFR-3: Code Quality

**Objective**: Maintain high code quality standards for long-term maintainability.

#### NFR-3.1: TypeScript Strict Mode

**Requirement**: Zero TypeScript errors with strict mode enabled.

**Details**:
- **Strict Flags** (in tsconfig.json):
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "alwaysStrict": true
    }
  }
  ```
- **Type Coverage**: >= 95% (use type-coverage)
- **Any Types**: Avoid `any` (use `unknown` or specific types)

**Acceptance Criteria**:
- `tsc --noEmit` passes with zero errors
- No `@ts-ignore` comments (use `@ts-expect-error` with explanation)
- Type coverage >= 95% (measured with type-coverage)
- All props interfaces exported for reusability

#### NFR-3.2: ESLint and Prettier

**Requirement**: Enforce code style with linting and formatting.

**Details**:
- **ESLint Config**: Extend `next/core-web-vitals` + `typescript-eslint`
- **Prettier Config**: Consistent formatting (2 spaces, single quotes, trailing commas)
- **Pre-Commit Hooks**: Lint staged files with husky + lint-staged
- **CI Checks**: Fail build if linting errors

**Acceptance Criteria**:
- `npm run lint` passes with zero errors
- Prettier formats all files consistently
- Pre-commit hooks prevent commits with lint errors
- CI pipeline runs linting checks

#### NFR-3.3: Test Coverage Thresholds

**Requirement**: Maintain >= 80% test coverage for core code.

**Details**:
- **Thresholds** (in jest.config.js):
  - Branches: >= 80%
  - Functions: >= 80%
  - Lines: >= 80%
  - Statements: >= 80%
- **Exceptions**: Exclude `.stories.tsx`, `.d.ts`, `index.ts` files
- **Enforcement**: Test suite fails if thresholds not met

**Acceptance Criteria**:
- Coverage >= 80% for all categories
- Coverage report generated on each test run
- Uncovered lines reviewed and justified
- CI pipeline enforces coverage thresholds

#### NFR-3.4: Code Review Standards

**Requirement**: All code changes must be reviewed before merging.

**Details**:
- **Review Checklist**:
  - [ ] TypeScript errors: Zero
  - [ ] Lint errors: Zero
  - [ ] Tests: All pass, coverage >= 80%
  - [ ] Performance: No regressions
  - [ ] Accessibility: WCAG 2.1 Level AA
  - [ ] Documentation: Updated if needed
- **Approval Required**: 1 approval from Lead Engineer
- **PR Template**: Use template in `.github/pull_request_template.md`

**Acceptance Criteria**:
- All PRs have >= 1 approval
- PR checklist completed by author
- Reviewer validates all checklist items
- No merges without passing CI

---

### NFR-4: Browser Compatibility

**Objective**: Ensure dashboard works on all modern browsers.

#### NFR-4.1: Supported Browsers

**Requirement**: Support last 2 versions of major browsers.

**Details**:
- **Desktop**:
  - Chrome >= 120
  - Firefox >= 120
  - Safari >= 17
  - Edge >= 120
- **Mobile**:
  - Chrome Android >= 120
  - Safari iOS >= 17
  - Samsung Internet >= 23
- **Not Supported**: IE11 (end of life)

**Acceptance Criteria**:
- Dashboard tested on all supported browsers
- No critical bugs on supported browsers
- Polyfills added for missing features (if needed)
- Unsupported browser message shown for IE11

#### NFR-4.2: Feature Detection

**Requirement**: Use feature detection for progressive enhancement.

**Details**:
- **Checks**:
  - Local storage availability
  - Clipboard API support
  - Pointer events support
- **Fallbacks**:
  - Cookies if local storage unavailable
  - Manual copy if clipboard API unavailable
  - Mouse events if pointer events unavailable

**Acceptance Criteria**:
- Feature detection implemented for all optional APIs
- Fallbacks tested on browsers without feature
- No console errors on unsupported browsers
- Graceful degradation (reduced functionality, not broken)

---

### NFR-5: Security

**Objective**: Protect user data and prevent common vulnerabilities.

#### NFR-5.1: Row Level Security (RLS)

**Requirement**: Enforce data access control at database level.

**Details**:
- **RLS Enabled**: All tables with user data
- **Policies**: Defined for SELECT, INSERT, UPDATE, DELETE
- **Testing**: Verify users cannot access others' data
- **Monitoring**: Log RLS policy violations

**Acceptance Criteria**:
- RLS enabled on all tables
- Policies tested with multiple user accounts
- Users cannot query others' private data
- RLS violations logged for audit

#### NFR-5.2: XSS Prevention

**Requirement**: Prevent cross-site scripting attacks.

**Details**:
- **React**: Automatic escaping of JSX content
- **Markdown**: Use sanitized markdown library (react-markdown with remark-gfm)
- **HTML Rendering**: Avoid dangerouslySetInnerHTML (or sanitize with DOMPurify)
- **Input Validation**: Validate all user inputs server-side

**Acceptance Criteria**:
- User input never rendered as raw HTML
- Markdown sanitized before rendering
- No dangerouslySetInnerHTML (or sanitized with DOMPurify)
- XSS vulnerability scan passes (use Snyk or npm audit)

#### NFR-5.3: Authentication Security

**Requirement**: Secure authentication flow and session management.

**Details**:
- **OAuth**: Use GitHub OAuth with Supabase Auth
- **Session Storage**: HTTP-only cookies (not local storage)
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Token Refresh**: Automatic token refresh before expiration

**Acceptance Criteria**:
- Tokens stored in HTTP-only cookies
- CSRF tokens validated on all POST/PUT/DELETE
- Sessions expire after inactivity (configurable timeout)
- Token refresh happens transparently

#### NFR-5.4: Environment Variables

**Requirement**: Protect sensitive configuration from exposure.

**Details**:
- **Secret Management**: Store secrets in environment variables
- **Public vs Private**:
  - Public (client-side): `NEXT_PUBLIC_SUPABASE_URL`
  - Private (server-side): `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_CLIENT_SECRET`
- **Version Control**: Never commit `.env.local` (add to .gitignore)
- **Documentation**: Document all required env vars in README

**Acceptance Criteria**:
- No secrets in source code
- `.env.local` in .gitignore
- Environment variables documented
- Vercel environment variables configured

---

## Technical Constraints

### TC-1: Technology Stack

**Constraint**: Must use existing tech stack without major changes.

**Details**:
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7.2 (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with GitHub OAuth
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui
- **Testing**: Jest + React Testing Library
- **Hosting**: Vercel (or compatible platform)

**Rationale**: Project is 70% complete. Changing stack would require rewrite.

**Impact**: Limits library choices (must be compatible with Next.js 16 + TypeScript 5.7.2).

---

### TC-2: Zero TypeScript Errors

**Constraint**: Must maintain zero TypeScript errors throughout development.

**Details**:
- **Strict Mode**: All TypeScript strict flags enabled
- **CI Enforcement**: Build fails on type errors
- **No Suppression**: No `@ts-ignore` allowed (use `@ts-expect-error` with explanation)

**Rationale**: Type safety prevents bugs and improves maintainability.

**Impact**: May require refactoring to satisfy type checker.

---

### TC-3: TDD Workflow

**Constraint**: Must follow Test-Driven Development (RED → GREEN → REFACTOR).

**Details**:
- **RED Phase**: Write failing tests first
- **GREEN Phase**: Implement minimum code to pass tests
- **REFACTOR Phase**: Optimize and clean up code

**Rationale**: TDD ensures test coverage and prevents regressions.

**Impact**: Development takes 20-30% longer but reduces bugs.

---

### TC-4: Database Polling (No WebSockets)

**Constraint**: Use database polling for real-time features, not WebSockets.

**Details**:
- **Polling Interval**: 2 seconds for presence, cursors, comments
- **Rationale**: Simplicity over complexity (WebSockets add infrastructure overhead)
- **Trade-Off**: Slightly higher latency (2s vs instant) for simpler architecture

**Impact**: Real-time features have 2s latency instead of sub-second.

---

### TC-5: Markdown Support for Comments

**Constraint**: Comments must support basic Markdown (bold, italic, code, links).

**Details**:
- **Library**: `react-markdown` with `remark-gfm`
- **Supported Syntax**:
  - Bold: `**text**`
  - Italic: `*text*`
  - Code: `` `code` `` (inline), ` ```code``` ` (block)
  - Links: `[text](url)`
  - Lists: `- item` or `1. item`
- **Not Supported** (for MVP): Images, tables, HTML

**Rationale**: Markdown is standard for developer tools (GitHub, Slack, Discord).

**Impact**: Requires markdown parser and sanitization.

---

## Dependencies

### DEP-1: Diff Rendering Library

**Dependency**: Choose between `react-diff-viewer-continued` or `diff2html`.

**Details**:
- **Option 1: react-diff-viewer-continued**
  - Pros: React component, actively maintained, easy integration
  - Cons: Less feature-rich than diff2html
  - Install: `npm install react-diff-viewer-continued`
- **Option 2: diff2html**
  - Pros: Feature-rich, mature, highly customizable
  - Cons: Not React-native (need wrapper component)
  - Install: `npm install diff2html`

**Decision Needed**: Lead Engineer must choose library before implementation.

**Impact**: Affects FR-A implementation time (react-diff-viewer is faster to integrate).

---

### DEP-2: Comments Database Migration

**Dependency**: Must create and apply database migration before comment feature.

**Details**:
- **Migration File**: `supabase/migrations/004_create_comments_table.sql`
- **Steps**:
  1. Write migration SQL (CREATE TABLE, indexes, RLS policies)
  2. Test migration locally (`supabase db reset`)
  3. Apply migration to staging (`supabase db push`)
  4. Verify schema in Supabase dashboard
  5. Apply to production (after testing)

**Decision Needed**: Database admin must review migration before production.

**Impact**: Comment feature cannot be developed until migration applied.

---

### DEP-3: Test Infrastructure

**Dependency**: Jest and React Testing Library must be configured.

**Details**:
- **Current State**: Testing libraries in package.json, but no tests written
- **Configuration Needed**:
  - `jest.config.js`: Configure coverage, test environment
  - `setupTests.ts`: Configure test matchers and globals
  - `tsconfig.test.json`: TypeScript config for tests
- **Mock Setup**:
  - Mock Supabase client
  - Mock Next.js router
  - Mock window.matchMedia (for responsive tests)

**Decision Needed**: QA Lead must configure test setup before TDD RED phase.

**Impact**: Tests cannot be written until infrastructure configured.

---

### DEP-4: Markdown Rendering Library

**Dependency**: Markdown parser for comment bodies.

**Details**:
- **Library**: `react-markdown` with `remark-gfm`
- **Install**: `npm install react-markdown remark-gfm`
- **Sanitization**: Built-in (react-markdown sanitizes by default)
- **Configuration**:
  ```tsx
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';

  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {commentBody}
  </ReactMarkdown>
  ```

**Decision Needed**: Security review of markdown sanitization.

**Impact**: Comment bodies cannot render markdown until library installed.

---

### DEP-5: Syntax Highlighting Library

**Dependency**: Syntax highlighter for diff rendering.

**Details**:
- **Option 1: Prism.js**
  - Pros: Lightweight, many languages, themeable
  - Cons: Manual language loading
  - Install: `npm install prismjs`
- **Option 2: highlight.js**
  - Pros: Automatic language detection, many themes
  - Cons: Larger bundle size
  - Install: `npm install highlight.js`

**Decision Needed**: Frontend Developer must choose library based on bundle size.

**Impact**: Affects diff rendering performance (bundle size vs features).

---

## Questions for Lead Engineer

### Q1: Diff Rendering Library Choice

**Question**: Should we use `react-diff-viewer-continued` or `diff2html` for diff rendering?

**Context**:
- `react-diff-viewer-continued`: React-native, easy integration, less customization
- `diff2html`: More features, better performance, requires wrapper component

**Decision Criteria**:
- Bundle size impact
- Customization needs (do we need word-level diff?)
- Integration complexity

**Impact**: Affects FR-A.1 implementation time and bundle size.

---

### Q2: Comment Polling Interval

**Question**: Should comments use the same 2s polling interval as presence/cursors, or a different interval?

**Context**:
- Presence/cursors: 2s interval (proven stable)
- Comments: Less frequent updates (could use longer interval like 5s)

**Decision Criteria**:
- User expectation for comment latency
- Server load (3 polling mechanisms at 2s = high load)
- Battery impact on mobile

**Impact**: Affects FR-B.6 polling strategy and server costs.

---

### Q3: Comment Threading Depth Limit

**Question**: What should be the maximum nesting depth for comment replies?

**Context**:
- Current plan: 3 levels (top → reply → reply to reply)
- GitHub: Unlimited nesting (but gets messy)
- Reddit: 10+ levels (but requires "Continue thread" link)

**Decision Criteria**:
- UI complexity (deep nesting is hard to display)
- User behavior (how often do threads go deep?)
- Database query complexity (recursive queries)

**Impact**: Affects FR-B.5 threading logic and UI design.

---

### Q4: Test Priority Order

**Question**: What order should we write tests in (if time is limited)?

**Context**:
- Hook tests: Highest value, easiest to write
- Component tests: Medium value, medium difficulty
- Integration tests: High value, time-consuming

**Decision Criteria**:
- Coverage thresholds (must reach 80%)
- Risk areas (which code is most likely to break?)
- Time constraints (2-3 day sprint)

**Impact**: Affects FR-C test file creation order.

---

### Q5: Error Boundary Placement

**Question**: Where should we place error boundaries (how granular)?

**Context**:
- Option 1: One boundary for entire PR detail page (simple, but entire page fails)
- Option 2: Boundaries for each section (diffs, comments, presence) (complex, but isolated failures)

**Decision Criteria**:
- User experience (should one section failure crash entire page?)
- Developer experience (more boundaries = more code)
- Recovery strategy (can user recover from errors?)

**Impact**: Affects FR-D.4 error boundary implementation.

---

### Q6: Syntax Highlighting Languages

**Question**: Which programming languages should we support for syntax highlighting?

**Context**:
- Current plan: JavaScript, TypeScript, Python, Go, Java, CSS, HTML, JSON, Markdown, YAML
- Prism.js supports 100+ languages (but increases bundle size)

**Decision Criteria**:
- Most common languages in team's repos
- Bundle size impact (each language adds ~5-10KB)
- Fallback strategy (plain text for unsupported languages)

**Impact**: Affects FR-A.4 syntax highlighting library choice and bundle size.

---

### Q7: Optimistic Updates for Comments

**Question**: Should we use optimistic updates for comments (show immediately, then sync)?

**Context**:
- Optimistic: Show comment instantly for author, sync in background
- Pessimistic: Wait for server response before showing comment

**Decision Criteria**:
- User experience (instant feedback vs risk of failure)
- Error handling complexity (rollback on failure)
- Perceived performance (feels faster vs actual faster)

**Impact**: Affects FR-B.6 real-time sync strategy.

---

### Q8: Comment Edit/Delete Features

**Question**: Should MVP include comment editing and deletion, or defer to later?

**Context**:
- User Story #2 includes edit/delete buttons
- Adds complexity (edit history, soft delete vs hard delete)
- Not critical for MVP demo

**Decision Criteria**:
- Time constraints (2-3 day sprint)
- MVP definition (what's minimum viable?)
- User expectation (do users expect edit/delete?)

**Impact**: Affects FR-B.4 comment actions and database schema (soft delete requires deleted_at column).

---

### Q9: Performance Monitoring

**Question**: Should we add performance monitoring (e.g., Vercel Analytics, Sentry)?

**Context**:
- Helps identify slow queries and rendering bottlenecks
- Adds external dependency and cost
- Not critical for MVP, but useful for production

**Decision Criteria**:
- Budget (free tier vs paid)
- Privacy concerns (data sent to third party)
- Value (how much would we use the data?)

**Impact**: Affects NFR-1 performance measurement and monitoring strategy.

---

### Q10: Accessibility Audit Tool

**Question**: Which accessibility audit tool should we use for WCAG compliance?

**Context**:
- Options: axe DevTools, Lighthouse, WAVE, Pa11y
- axe DevTools: Browser extension, manual testing
- Lighthouse: Automated, CI integration
- WAVE: Visual overlay, good for learning
- Pa11y: CLI, CI integration

**Decision Criteria**:
- CI integration (can it run automatically?)
- Coverage (what issues can it detect?)
- Developer experience (ease of use)

**Impact**: Affects NFR-2 accessibility testing workflow.

---

### Q11: Comment Markdown Preview

**Question**: Should comment input include live markdown preview (like GitHub)?

**Context**:
- User Story #2 mentions "markdown preview toggle (optional for MVP)"
- Improves user experience (see formatted output before posting)
- Adds UI complexity (split view or tabs)

**Decision Criteria**:
- Time constraints (2-3 day sprint)
- User expectation (is preview expected?)
- Implementation complexity (split pane layout)

**Impact**: Affects FR-B.3 comment input component design.

---

### Q12: Virtual Scrolling for Large PRs

**Question**: Should we implement virtual scrolling for PRs with many files (100+)?

**Context**:
- Current: Render all files at once (could be slow for 100+ files)
- Virtual scrolling: Only render visible files (better performance)
- Adds complexity (use react-virtualized or react-window)

**Decision Criteria**:
- Expected PR size (how many files in typical PR?)
- Performance impact (is it slow without virtual scrolling?)
- Time constraints (2-3 day sprint)

**Impact**: Affects NFR-1.1 diff rendering performance optimization.

---

### Q13: Database Indexing Strategy

**Question**: Which columns should be indexed for optimal query performance?

**Context**:
- Current plan: Index pr_id, parent_comment_id, created_at, user_id
- More indexes = faster queries, but slower writes and more storage

**Decision Criteria**:
- Query patterns (which columns in WHERE/JOIN clauses?)
- Write frequency (comments written less often than read)
- Index maintenance cost

**Impact**: Affects NFR-1.4 database query performance.

---

### Q14: Error Logging Service

**Question**: Should we integrate error logging service (Sentry, LogRocket, etc.)?

**Context**:
- Helps debug production issues (stack traces, user context)
- Costs money (free tier has limits)
- Not critical for MVP, but useful for production

**Decision Criteria**:
- Budget (free tier sufficient?)
- Privacy (data sent to third party)
- Value (how often do production errors occur?)

**Impact**: Affects FR-D.1 error logging strategy.

---

### Q15: CI/CD Pipeline

**Question**: Should we set up CI/CD pipeline for automated testing and deployment?

**Context**:
- GitHub Actions can run tests, linting, coverage on each PR
- Vercel auto-deploys on push to main (already configured?)
- Adds setup time, but prevents regressions

**Decision Criteria**:
- Time constraints (2-3 day sprint)
- Team size (solo developer vs team)
- Value (how many bugs would CI catch?)

**Impact**: Affects NFR-3.2 ESLint enforcement and NFR-3.3 coverage enforcement.

---

## Success Metrics

### SM-1: Feature Completion

**Metric**: All 5 user stories meet acceptance criteria.

**Measurement**:
- [ ] Story #1 (Diff Rendering): All 9 acceptance criteria met
- [ ] Story #2 (Comments): All 10 acceptance criteria met
- [ ] Story #3 (Tests): All 8 acceptance criteria met
- [ ] Story #4 (Error Handling): All 7 acceptance criteria met
- [ ] Story #5 (Documentation): All 7 acceptance criteria met

**Target**: 100% acceptance criteria met

**Validation**: Product Owner review and approval

---

### SM-2: Test Coverage

**Metric**: Core features have >= 80% test coverage.

**Measurement**:
- Run `npm run test:coverage`
- Check coverage report for branches, functions, lines, statements
- Verify all 4 categories >= 80%

**Target**:
- Branches: >= 80%
- Functions: >= 80%
- Lines: >= 80%
- Statements: >= 80%

**Validation**: Coverage report in `coverage/lcov-report/index.html`

---

### SM-3: Zero Errors

**Metric**: Zero TypeScript errors and zero build errors.

**Measurement**:
- Run `tsc --noEmit` (TypeScript check)
- Run `npm run build` (production build)
- Verify exit code 0 (success)

**Target**:
- TypeScript errors: 0
- Build errors: 0
- Runtime errors: 0 (in demo)

**Validation**: CI/CD pipeline passes all checks

---

### SM-4: Performance

**Metric**: Diff rendering and real-time sync meet performance targets.

**Measurement**:
- Test 500-line diff rendering time (Chrome DevTools Performance)
- Test comment sync latency (2 browser windows, stopwatch)
- Test page load time (Lighthouse)

**Target**:
- 500-line diff: < 500ms (p95)
- Comment sync: < 2s latency (p95)
- Page load (TTI): < 3s (p95)

**Validation**: Manual testing + Lighthouse report

---

### SM-5: Accessibility

**Metric**: WCAG 2.1 Level AA compliance.

**Measurement**:
- Run axe DevTools audit
- Run Lighthouse accessibility audit
- Verify no critical or serious issues

**Target**:
- axe DevTools: 0 critical/serious issues
- Lighthouse accessibility score: >= 90

**Validation**: Audit reports + manual keyboard navigation test

---

### SM-6: Documentation Completeness

**Metric**: All documentation files created and complete.

**Measurement**:
- Verify README >= 500 lines
- Verify ARCHITECTURE.md >= 300 lines
- Verify API.md exists and documents all endpoints
- Verify DEPLOYMENT.md exists with Vercel steps
- Verify CONTRIBUTING.md >= 200 lines

**Target**: All 5 documentation files complete

**Validation**: Product Owner review

---

### SM-7: Demo Readiness

**Metric**: Dashboard is demo-ready (all features work in live demo).

**Measurement**: Run through demo checklist
- [ ] Diff rendering works for sample PR
- [ ] Comment system works (add comment, reply, real-time sync)
- [ ] Presence shows live viewer count
- [ ] Cursors track in real-time
- [ ] All tests pass (`npm test`)
- [ ] Coverage >= 80% (`npm run test:coverage`)
- [ ] No console errors on production build

**Target**: 100% demo checklist complete

**Validation**: Live demo with Product Owner

---

## Appendix A: Database Schema Reference

### Table: comments

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

CREATE INDEX idx_comments_pr_id ON comments(pr_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

**Columns**:
- `id`: Primary key (UUID)
- `pr_id`: Pull request identifier (format: "owner/repo/123")
- `user_id`: Comment author (foreign key to auth.users)
- `parent_comment_id`: Parent comment for threading (NULL for top-level)
- `body`: Comment text (1-10,000 characters, markdown supported)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
- `idx_comments_pr_id`: For fetching all comments on a PR
- `idx_comments_parent`: For fetching replies to a comment
- `idx_comments_created_at`: For chronological sorting
- `idx_comments_user_id`: For fetching user's comments

---

## Appendix B: Component Hierarchy

```
PR Detail Page
├── Header
│   ├── Title
│   ├── State Badge (open/closed)
│   └── Presence Indicator
├── Description
├── Cursors Layer
│   └── Live Cursor (per user)
├── Files Changed
│   ├── File Header
│   │   ├── Filename
│   │   └── Stats (+X -Y lines)
│   └── Diff Viewer
│       ├── Line Numbers (old/new)
│       ├── Code Lines (added/deleted/context)
│       └── Syntax Highlighting
└── Comments Section
    ├── Comment Input
    └── Comment Thread
        ├── Comment Item (top-level)
        │   ├── Avatar
        │   ├── Username
        │   ├── Timestamp
        │   ├── Body (markdown)
        │   └── Actions (reply/edit/delete)
        └── Comment Item (reply)
            ├── Avatar
            ├── Username
            ├── Timestamp
            ├── Body (markdown)
            └── Actions (reply/edit/delete)
```

---

## Appendix C: API Endpoints

### GitHub API Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/repos/{owner}/{repo}/pulls/{number}` | GET | Fetch PR details | 5000/hour |
| `/repos/{owner}/{repo}/pulls/{number}/files` | GET | Fetch PR files | 5000/hour |
| `/user` | GET | Fetch authenticated user | 5000/hour |
| `/user/repos` | GET | Fetch user repositories | 5000/hour |

### Supabase Queries

| Query | Table | Purpose |
|-------|-------|---------|
| `SELECT * FROM presence WHERE pr_id = $1` | presence | Fetch viewers on PR |
| `INSERT INTO presence (pr_id, user_id)` | presence | Track user viewing PR |
| `SELECT * FROM cursors WHERE pr_id = $1` | cursors | Fetch live cursors |
| `INSERT INTO cursors (pr_id, user_id, x, y)` | cursors | Update cursor position |
| `SELECT * FROM comments WHERE pr_id = $1 ORDER BY created_at` | comments | Fetch comments |
| `INSERT INTO comments (pr_id, user_id, body, parent_comment_id)` | comments | Create comment |
| `UPDATE comments SET body = $1, updated_at = NOW() WHERE id = $2` | comments | Edit comment |
| `DELETE FROM comments WHERE id = $1` | comments | Delete comment |

---

## Appendix D: Environment Variables

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-app-client-id
GITHUB_CLIENT_SECRET=your-github-app-client-secret

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
```

### Optional Environment Variables

```bash
# Performance Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

---

## Appendix E: TDD Workflow

### RED Phase (Write Failing Tests)

1. **Identify Feature**: Start with user story acceptance criteria
2. **Write Test Case**: Describe expected behavior
3. **Run Test**: Verify it fails (no implementation yet)
4. **Example**:
   ```typescript
   describe('DiffViewer', () => {
     it('renders added lines with green background', () => {
       const patch = '@@ -1,1 +1,2 @@\n line1\n+line2';
       render(<DiffViewer patch={patch} filename="test.ts" />);

       const addedLine = screen.getByText('line2');
       expect(addedLine).toHaveClass('bg-green-50');
     });
   });
   ```

### GREEN Phase (Implement Minimum Code)

1. **Write Minimal Code**: Just enough to pass the test
2. **Run Test**: Verify it passes
3. **Example**:
   ```typescript
   export function DiffViewer({ patch, filename }: DiffViewerProps) {
     const lines = patch.split('\n');
     return (
       <div>
         {lines.map(line => {
           const isAdded = line.startsWith('+');
           return (
             <div className={isAdded ? 'bg-green-50' : ''}>
               {line}
             </div>
           );
         })}
       </div>
     );
   }
   ```

### REFACTOR Phase (Optimize and Clean)

1. **Refactor Code**: Improve structure, performance, readability
2. **Run Tests**: Verify they still pass
3. **Example**:
   ```typescript
   export function DiffViewer({ patch, filename }: DiffViewerProps) {
     const lines = useMemo(() => parsePatch(patch), [patch]);

     return (
       <div className="diff-viewer">
         {lines.map((line, idx) => (
           <DiffLine key={idx} line={line} />
         ))}
       </div>
     );
   }
   ```

---

**Document Status**: READY FOR LEAD ENGINEER REVIEW

**Next Steps**:
1. Lead Engineer answers 15 questions (Q1-Q15)
2. Lead Engineer creates technical design document
3. QA Lead creates test strategy document
4. Scrum Master consolidates sprint plan
5. Team executes TDD implementation

---

**Created By**: Business Analyst (agile-team)
**Date**: 2026-01-11
**Sprint**: Sprint 2 (MVP Completion)
**Estimated Duration**: 2-3 days (18 hours total)
