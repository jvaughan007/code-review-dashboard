# Sprint 3: Line-Specific Comments - Sprint Plan

**Sprint Goal**: Enable precise code-level feedback with line-specific comments
**Sprint Duration**: 2 weeks
**Created By**: Scrum Master
**Date**: 2026-01-13

---

## Sprint Backlog Summary

| Story | Title | Points | Priority | Status |
|-------|-------|--------|----------|--------|
| #1 | Line-Specific Comments | 8 | P0 | **MUST-HAVE** |
| #2 | Keyboard Shortcuts | 5 | P1 | **MUST-HAVE** |
| #3 | Markdown Preview | 3 | P1 | **[STRETCH]** |
| #4 | Expand Test Coverage | 5 | P2 | **[STRETCH]** |

**Sprint Commitment**: 13 points (Stories #1 + #2)
**With Stretch**: 21 points (if velocity allows)
**Buffer**: 20% built into estimates

---

## Pre-Sprint Infrastructure Checklist

- [x] Test runner installed (Vitest)
- [x] Coverage reporting configured
- [x] Database connection working
- [x] Build passes

---

## Story #1: Line-Specific Comments (P0, 8 points)

### Acceptance Criteria
- [ ] Click line number to open comment input
- [ ] Comment indicator on lines with comments
- [ ] Real-time sync (2s polling)
- [ ] Works with added/deleted lines

### Technical Approach
- **Database**: Add file_path, line_number columns to comments table
- **Frontend**: Modify DiffViewer with click handlers
- **State**: Extend comments-store with line selectors

### Specialist Assignments
- PostgreSQL Specialist: Migration 005
- React 19 Specialist: DiffViewer modification
- Zustand Specialist: Store extension
- Full-Stack Developer: API integration

### Test Targets (TDD-influenced)
- [ ] Store tests: getLineComments, getLineCommentCount selectors
- [ ] Component tests: DiffViewer click handlers

---

## Story #2: Keyboard Shortcuts (P1, 5 points)

### Acceptance Criteria
- [ ] j/k for next/previous file
- [ ] c to open comment on line
- [ ] r to reply to comment
- [ ] ? for help overlay

### Technical Approach
- Custom useKeyboardShortcuts hook
- Focus management for line selection
- Input detection to disable shortcuts while typing

### Specialist Assignments
- React 19 Specialist: Hook implementation
- Tailwind CSS Specialist: Focus indicators, help modal

### Test Targets
- [ ] Store tests: Focus state management
- [ ] Component tests: Keyboard event handling

---

## Story #3: Markdown Preview [STRETCH] (P1, 3 points)

### Acceptance Criteria
- [ ] Write/Preview tabs in comment input
- [ ] Real-time Markdown rendering

### Technical Approach
- Extend comment-input.tsx with tabs
- Use react-markdown for preview

---

## Story #4: Expand Test Coverage [STRETCH] (P2, 5 points)

### Acceptance Criteria
- [ ] Activity Feed components tested
- [ ] Maintain store coverage >85%

---

## Phase Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1**: Database | 1 day | Migration 005, indexes |
| **Phase 2**: Frontend | 3 days | DiffViewer, LineCommentThread |
| **Phase 3**: Integration | 2 days | API routes, tests GREEN |
| **Phase 4**: Keyboard | 2 days | useKeyboardShortcuts hook |
| **Phase 5**: Stretch | 2 days | Markdown preview, extra tests |

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| diff2html DOM manipulation brittle | Wrap in try-catch, use data-attributes |
| Line mismatch after PR update | Store line content snapshot |

---

## Definition of Done

### Per-Story
- [ ] Acceptance criteria met
- [ ] Store tests passing (if applicable)
- [ ] Zero TypeScript errors
- [ ] Build succeeds

### Per-Sprint
- [ ] Must-have stories complete (13 points)
- [ ] Tests passing
- [ ] Documentation updated

---

## Decision Points

**Decision Council Required If:**
- Line comment UX differs from GitHub pattern (3+ options)
- Performance issues with large diffs (optimization approach)

---

**Status**: READY FOR EXECUTION
**First Action**: PostgreSQL Specialist creates Migration 005

---

*Sprint plan follows retro guidelines: 120 lines, stretch goals marked, 20% buffer included*
