# Sprint 3: Enhanced Diff Interactions - User Stories

**Sprint Goal**: Enable precise code-level feedback with line-specific comments and improve power user experience with keyboard shortcuts

**Sprint Duration**: 2 weeks
**Created By**: Product Owner
**Date**: 2026-01-13

---

## User Story #1: Line-Specific Comments on Diffs

**As a** code reviewer
**I want** to add comments directly on specific lines of code in the diff viewer
**So that** my feedback is contextually tied to exact locations rather than general PR comments

### Acceptance Criteria
- [ ] Click on any line number in diff viewer to open comment input
- [ ] Comment indicator (icon/badge) appears on lines with comments
- [ ] Hover over indicator shows comment preview
- [ ] Click indicator expands full comment thread
- [ ] Line comments sync in real-time across all users (2s latency max)
- [ ] Line comments persist in database (comments table with line_number field)
- [ ] Line comments appear in Activity Feed with line reference
- [ ] Works with both added (+) and deleted (-) lines

### Priority: P0 (Critical)

### Story Points: 8

### Must-Have vs Stretch: **MUST-HAVE**

### Dependencies
- Existing comments system (Sprint 2)
- Diff viewer syntax highlighting (Sprint 2)

### Business Value
Line-specific comments are the core value proposition of code review tools. Without this, we're just a glorified chat room. This feature differentiates us from GitHub's native review experience by adding real-time collaboration at the line level.

### Notes
- This is highest priority from Sprint 2 retrospective
- Backend: Add line_number, file_path columns to comments table
- Frontend: Enhance DiffViewer component with comment icons
- Consider UX: Click line number vs click line content vs hover actions

---

## User Story #2: Keyboard Shortcuts for Navigation

**As a** power user reviewing code frequently
**I want** keyboard shortcuts for common actions (next file, add comment, reply)
**So that** I can navigate and interact without reaching for the mouse

### Acceptance Criteria
- [ ] `j/k` keys navigate to next/previous file in diff list
- [ ] `c` key opens comment input on currently selected line
- [ ] `r` key focuses reply input on selected comment thread
- [ ] `?` key displays keyboard shortcut help overlay
- [ ] Shortcuts disabled when typing in text inputs
- [ ] Visual indicator shows currently focused line/comment
- [ ] Works on both Mac and Windows (Cmd vs Ctrl handled)

### Priority: P1 (High)

### Story Points: 5

### Must-Have vs Stretch: **MUST-HAVE**

### Dependencies
- Line-specific comments (User Story #1)

### Business Value
Power users drive adoption. Engineers reviewing 10+ PRs daily will champion tools that optimize their workflow. Keyboard shortcuts reduce review time by 30-40% based on GitHub/GitLab usage data.

### Notes
- Frontend-only feature (no backend changes)
- Use React hook for keyboard event handling
- Popular shortcuts to implement first: j/k (navigation), c (comment), ? (help)
- Consider vim/emacs users who expect these patterns

---

## User Story #3: Markdown Preview in Comments

**As a** reviewer writing detailed feedback
**I want** to preview Markdown formatting before submitting comments
**So that** I can ensure my code snippets, links, and formatting render correctly

### Acceptance Criteria
- [ ] Comment input shows "Write" and "Preview" tabs
- [ ] Preview tab renders Markdown in real-time
- [ ] Supports code blocks with syntax highlighting
- [ ] Supports links, bold, italic, lists, quotes
- [ ] Preview matches final rendered comment style
- [ ] Tab switching preserves comment text (no data loss)

### Priority: P1 (High)

### Story Points: 3

### Must-Have vs Stretch: **STRETCH**

### Dependencies
- Existing comments system (Sprint 2)

### Business Value
Markdown is standard for technical documentation. Reviewers want to share code suggestions, reference docs, and format feedback. This reduces "comment edit cycles" where users post, realize formatting is wrong, then edit.

### Notes
- Use lightweight Markdown library (e.g., marked.js, react-markdown)
- Preview should use same CSS as rendered comments (consistency)
- Consider: Live preview (updates as you type) vs tab-based preview
- Stretch goal: Add quick Markdown formatting buttons (bold, code block)

---

## User Story #4: Expand Component Test Coverage

**As a** developer maintaining the codebase
**I want** high test coverage on all critical components
**So that** refactoring and new features don't introduce regressions

### Acceptance Criteria
- [ ] DiffViewer component test coverage >80% (currently 75%)
- [ ] Activity Feed components have unit tests (currently untested)
- [ ] Comment components have integration tests (currently minimal)
- [ ] All Zustand stores maintain >85% coverage (currently 76-100%)
- [ ] Test suite runs <5 seconds (currently ~1s)
- [ ] All tests pass with zero flaky tests

### Priority: P2 (Medium)

### Story Points: 5

### Must-Have vs Stretch: **STRETCH**

### Dependencies
- None (testing infrastructure already exists)

### Business Value
Technical debt reduction. High test coverage accelerates future development by catching bugs early and enabling confident refactoring. This is foundational for scaling the team (if we add contributors, tests are the safety net).

### Notes
- QA Lead to define test strategy
- Focus on business logic (stores) and user interactions (components)
- E2E tests with Playwright deferred to Sprint 4 (separate story)
- Current test suite is fast (~1s), maintain that speed

---

## Sprint Summary

**Total Story Points**: 21 (8 + 5 + 3 + 5)

**Must-Have Stories**: 16 points (Stories #1, #2)
**Stretch Stories**: 8 points (Stories #3, #4)

**Priority Breakdown**:
- P0 (Critical): 1 story (Line-specific comments)
- P1 (High): 2 stories (Keyboard shortcuts, Markdown preview)
- P2 (Medium): 1 story (Test coverage)

**Value Proposition**:
Sprint 3 transforms the MVP into a truly competitive code review tool. Line-specific comments are table stakes for code review. Keyboard shortcuts differentiate us for power users. Markdown preview polishes the experience. Test coverage ensures quality as we scale.

**Risk Assessment**:
- Line-specific comments (Story #1) is architecturally complex (8 points) - highest risk
- Keyboard shortcuts (Story #2) is frontend-only, lower risk
- Markdown preview (Story #3) is low complexity, safe stretch goal
- Test coverage (Story #4) is continuous work, no user-facing risk

**Recommendation**:
Commit to Stories #1 and #2 as sprint commitments (13 points). Pull in Story #3 if velocity allows (16 points total). Story #4 is ongoing technical investment, not sprint-critical.

---

**Next Steps**:
1. Business Analyst refines requirements for Story #1 (line-specific comments architecture)
2. Lead Engineer designs technical approach (database schema changes, UI component structure)
3. QA Lead writes test strategy for RED-GREEN-REFACTOR cycle
4. Scrum Master consolidates sprint plan with specialist assignments
