# Sprint 4: Integration & Polish - Sprint Plan

**Sprint Goal**: Wire Sprint 3 features into the application and add visual polish
**Sprint Duration**: 1-2 sessions
**Created By**: Scrum Master
**Date**: 2026-01-13

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

## Pre-Sprint Infrastructure Checklist

- [x] Test runner installed (Vitest)
- [x] Coverage reporting configured
- [x] Database connection working
- [x] Build passes
- [ ] Playwright installed (Story #3)

---

## Story #1: Line Comments Integration (P0, 5 points)

### Acceptance Criteria
- [ ] Clicking a line number opens LineCommentThread modal
- [ ] Line comment badges show on lines with comments
- [ ] Comments sync with database
- [ ] Works on PR detail page

### Technical Tasks
1. Create `FilesSection` client component
2. Wire `DiffViewer` with `onLineClick` and `lineCommentCounts`
3. Update PR page to use `FilesSection`
4. Initialize comments polling in `FilesSection`

### Specialist Assignments
- React 19 Specialist: FilesSection component
- Full-Stack Developer: Integration coordination

### Test Targets (TDD-influenced)
- [ ] Component test: FilesSection renders files with DiffViewers

---

## Story #2: Keyboard Navigation Focus (P1, 5 points)

### Acceptance Criteria
- [ ] Current file has visual highlight with j/k
- [ ] Current line has visual highlight with arrows
- [ ] Focus indicator is visible

### Technical Tasks
1. Create `focus-state-store.ts`
2. Create store tests
3. Add `focusedLine` prop to DiffViewer
4. Wire `useKeyboardShortcuts` in FilesSection

### Specialist Assignments
- Zustand Specialist: Focus state store
- Tailwind CSS Specialist: Focus visual styles

### Test Targets
- [ ] Store tests: nextFile, prevFile, bounds

---

## Story #3: E2E Testing Setup (P1, 5 points)

### Acceptance Criteria
- [ ] Playwright configured
- [ ] Line comment flow test
- [ ] Keyboard navigation test

### Technical Tasks
1. Install Playwright
2. Configure `playwright.config.ts`
3. Create `e2e/line-comments.spec.ts`
4. Create `e2e/keyboard-nav.spec.ts`

### Specialist Assignments
- Playwright Specialist: All E2E setup and tests

### Test Targets
- [ ] E2E: Line comment full flow
- [ ] E2E: j/k file navigation

---

## Story #4: Markdown Preview [STRETCH] (P2, 3 points)

### Acceptance Criteria
- [ ] Write/Preview tabs in CommentInput
- [ ] Real-time Markdown rendering

### Technical Tasks
1. Install react-markdown
2. Add tabs to CommentInput

---

## Phase Timeline

| Phase | Deliverables |
|-------|--------------|
| **Phase 1**: Integration | FilesSection, PR page update |
| **Phase 2**: Focus State | Store, tests, visual indicators |
| **Phase 3**: E2E Tests | Playwright setup, test files |
| **Phase 4**: Stretch | Markdown preview |

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| Server → Client migration complexity | FilesSection isolated, minimal page changes |
| E2E tests need auth | Use test user or mock auth |
| Focus state across components | Zustand store handles cross-component state |

---

## Definition of Done

### Per-Story
- [ ] Acceptance criteria met
- [ ] Tests passing (unit or E2E)
- [ ] Zero TypeScript errors
- [ ] Build succeeds

### Per-Sprint
- [ ] Must-have stories complete (15 points)
- [ ] Tests passing
- [ ] Tech debt addressed (from tracker)

---

## Tech Debt Resolution (from Sprint 3)

| Item | Story | Status |
|------|-------|--------|
| DiffViewer click handler E2E tests | #3 | Addressed |
| Focus state visual indicators | #2 | Addressed |
| LineCommentThread integration | #1 | Addressed |

---

**Status**: READY FOR EXECUTION
**First Action**: Create FilesSection component (Story #1, Phase 1)

---

*Sprint plan follows retro guidelines: <120 lines, stretch goals marked, 20% buffer*
