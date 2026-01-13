# Sprint 4: Integration & Polish - User Stories

**Sprint Goal**: Wire Sprint 3 features into the application and add visual polish
**Sprint Duration**: 1-2 sessions
**Created By**: Product Owner
**Date**: 2026-01-13

---

## Sprint Context

Sprint 3 built powerful features (line comments, keyboard shortcuts) but they're not yet integrated into the PR page. Sprint 4 focuses on:
1. **Integration** - Connect new components to existing pages
2. **Visual feedback** - Focus indicators for keyboard navigation
3. **Testing** - E2E tests for full flows
4. **Polish** - Stretch goal: Markdown preview

---

## User Story #1: Line Comments Integration (P0 - Tech Debt)

**As a** code reviewer
**I want** to click on line numbers in the diff to add comments
**So that** I can provide precise feedback on specific code changes

### Acceptance Criteria
- [ ] Clicking a line number in DiffViewer opens LineCommentThread modal
- [ ] Existing line comments show badge indicators on their lines
- [ ] Comments sync with database (polling already exists)
- [ ] Works on PR detail page (`/repositories/[owner]/[repo]/pull/[number]`)

### Priority: **P0** (Critical - Tech Debt from Sprint 3)

### Notes
- DiffViewer already has `onLineClick` and `lineCommentCounts` props
- LineCommentThread component already exists
- Need to wire them together on the PR page

---

## User Story #2: Keyboard Navigation Focus State (P1)

**As a** power user
**I want** to see which line/file is focused when using keyboard shortcuts
**So that** I know where my cursor is when navigating

### Acceptance Criteria
- [ ] Current file has visual highlight when navigating with j/k
- [ ] Current line has visual highlight when navigating with arrows
- [ ] Focus persists when using keyboard shortcuts
- [ ] Focus indicator is visible but not distracting

### Priority: **P1** (High)

### Notes
- useKeyboardShortcuts hook already has navigation callbacks
- Need focus state store to track current file/line
- DiffViewer needs to accept focusedLine prop

---

## User Story #3: E2E Testing Setup (P1)

**As a** developer
**I want** end-to-end tests for critical flows
**So that** I can catch integration issues before production

### Acceptance Criteria
- [ ] Playwright configured and running
- [ ] Test for line comment flow (click line → add comment → see badge)
- [ ] Test for keyboard navigation (j/k between files)
- [ ] Tests run in CI (or documented manual run)

### Priority: **P1** (High - Sprint 3 Retro recommendation)

### Notes
- Focus on DOM-heavy components that are hard to unit test
- DiffViewer click handlers need E2E coverage

---

## User Story #4: Markdown Preview [STRETCH] (P2)

**As a** comment author
**I want** to preview my comment with Markdown formatting
**So that** I can ensure my comment looks correct before posting

### Acceptance Criteria
- [ ] Write/Preview tabs in CommentInput
- [ ] Real-time Markdown rendering in preview tab
- [ ] Supports common Markdown (bold, italic, code, links)

### Priority: **P2** (Medium - Deferred from Sprint 3)

---

## Sprint Backlog Summary

| Story | Title | Points | Priority | Status |
|-------|-------|--------|----------|--------|
| #1 | Line Comments Integration | 5 | P0 | **MUST-HAVE** |
| #2 | Keyboard Navigation Focus | 5 | P1 | **MUST-HAVE** |
| #3 | E2E Testing Setup | 5 | P1 | **MUST-HAVE** |
| #4 | Markdown Preview | 3 | P2 | **[STRETCH]** |

**Sprint Commitment**: 15 points (Stories #1 + #2 + #3)
**With Stretch**: 18 points (if velocity allows)
**Buffer**: 20% built into estimates

---

## Dependencies

- Story #2 depends on Story #1 (need integration to test focus)
- Story #3 can run in parallel with Stories #1 and #2
- Story #4 is independent (stretch goal)

---

## Definition of Done (Per Story)

- [ ] Acceptance criteria met
- [ ] Tests passing (unit or E2E as appropriate)
- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] Code reviewed by Lead Engineer (simulated)

---

**Status**: READY FOR TECHNICAL DESIGN
**Next Step**: Lead Engineer creates `technical_design_sprint_4.md`
