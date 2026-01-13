# Sprint 3: Technical Design - Line-Specific Comments + Keyboard Shortcuts + Markdown Preview

**Created By**: Lead Engineer
**Source**: Product Owner User Stories
**Date**: 2026-01-13

---

## Architecture

### System Overview
Line-specific comments integrate into existing DiffViewer component. Database adds line metadata to comments table. Frontend renders comment indicators on line numbers and manages comment threads per line.

### Technology Stack
- **Frontend**: React 19 (Client Components), TypeScript, Tailwind CSS, Framer Motion
- **State**: Zustand (comments-store extended for line metadata)
- **Database**: Supabase PostgreSQL (comments table schema update)
- **Diff Rendering**: diff2html (modified with click handlers)

---

## 1. Database Schema Changes

### Migration: `005_add_line_comments_support.sql`

```sql
-- Add line-specific comment columns to existing comments table
ALTER TABLE comments
  ADD COLUMN file_path TEXT,                    -- File path in PR (e.g., "src/app/page.tsx")
  ADD COLUMN line_number INTEGER,               -- Line number in diff (1-indexed)
  ADD COLUMN line_type TEXT CHECK (line_type IN ('addition', 'deletion', 'context')),
  ADD COLUMN line_content TEXT;                 -- Snapshot of line content (for reference)

-- Create index for line-specific comment queries
CREATE INDEX idx_comments_line
  ON comments(pr_id, file_path, line_number)
  WHERE file_path IS NOT NULL AND line_number IS NOT NULL;

-- NULL values = PR-level comments (existing behavior)
-- Non-NULL = line-specific comments (new feature)
```

**Design Decision**: Extend existing table rather than create separate table (simpler queries, unified comment model).

---

## 2. Component Architecture

### Modified Components

#### `diff-viewer.tsx` (Extend)
**Current**: Renders diff HTML via diff2html
**New**: Add click handlers to line numbers

```tsx
// After diff HTML render, attach click handlers
const lineNumbers = containerRef.current.querySelectorAll('.d2h-code-side-linenumber');
lineNumbers.forEach((lineNum) => {
  lineNum.addEventListener('click', (e) => {
    const lineNumber = extractLineNumber(e.target);
    const filePath = filename;
    onLineClick?.({ filePath, lineNumber });
  });
  lineNum.classList.add('cursor-pointer', 'hover:bg-blue-100');
});
```

**Props Update**:
```tsx
export interface DiffViewerProps {
  patch: string;
  filename: string;
  className?: string;
  onLineClick?: (lineInfo: { filePath: string; lineNumber: number }) => void; // NEW
  lineCommentCounts?: Map<number, number>; // NEW: Show comment indicators
}
```

#### `line-comment-indicator.tsx` (New)
Displays comment count badge on line numbers with comments.

```tsx
<div className="absolute -right-2 -top-1 bg-blue-500 text-white rounded-full w-4 h-4">
  <span className="text-xs">{count}</span>
</div>
```

#### `line-comment-thread.tsx` (New)
Inline comment thread that appears below clicked line in diff.

```tsx
// Inserted into DOM after line row
<tr className="line-comment-thread">
  <td colspan="4">
    <CommentThread prId={prId} filePath={filePath} lineNumber={lineNumber} />
  </td>
</tr>
```

---

## 3. State Management Updates

### `comments-store.ts` (Extend)

**New Type**:
```typescript
export interface LineCommentMetadata {
  file_path: string | null;
  line_number: number | null;
  line_type: 'addition' | 'deletion' | 'context' | null;
  line_content: string | null;
}

export interface Comment {
  // ... existing fields
  file_path: string | null;          // NEW
  line_number: number | null;        // NEW
  line_type: string | null;          // NEW
  line_content: string | null;       // NEW
}
```

**New Selectors**:
```typescript
getLineComments: (prId: string, filePath: string, lineNumber: number) => Comment[];
getLineCommentCount: (prId: string, filePath: string, lineNumber: number) => number;
getFileCommentSummary: (prId: string, filePath: string) => Map<number, number>;
```

---

## 4. Multi-Domain Detection

### Domains Involved
- ✅ **Frontend** (DiffViewer modification, line comment UI)
- ✅ **State Management** (Zustand store extension)
- ✅ **Database** (Schema migration, RLS policies)
- ✅ **Backend** (API routes for line-specific CRUD)
- ⚠️ **Keyboard Shortcuts** (Separate domain, Story #2)
- ⚠️ **Markdown Preview** (Separate domain, Story #3)

### Specialist Assignments

#### Story #1: Line-Specific Comments (Priority P0)

**Frontend Team** (parallel work):
- **React 19 Specialist**: Modify DiffViewer, create LineCommentThread
- **TypeScript Specialist**: Type definitions for line metadata
- **Tailwind CSS Specialist**: Comment indicator styling, hover states
- **Framer Motion Specialist**: Thread expand/collapse animations

**State Team** (parallel work):
- **Zustand Specialist**: Extend comments-store with line selectors

**Backend Team** (parallel work):
- **PostgreSQL Specialist**: Migration 005, indexes, RLS policies
- **Full-Stack Developer**: API route integration (POST /api/comments with line metadata)

**QA Team** (after implementation):
- **QA Lead**: Test strategy (RED phase)
- **Jest Specialist**: Unit tests for line comment filtering
- **React Testing Library Specialist**: Component tests for DiffViewer clicks
- **Playwright Specialist**: E2E tests for multi-user line comments

#### Story #2: Keyboard Shortcuts (Priority P1)

**Frontend Team**:
- **React 19 Specialist**: useKeyboardShortcuts hook
- **TypeScript Specialist**: Keyboard event types
- **Full-Stack Developer**: File navigation state management

**QA Team**:
- **React Testing Library Specialist**: Keyboard event tests
- **Playwright Specialist**: E2E keyboard navigation tests

#### Story #3: Markdown Preview (Priority P1, Stretch)

**Frontend Team**:
- **React 19 Specialist**: Tabbed comment input (Write/Preview)
- **TypeScript Specialist**: Markdown parsing types
- **Tailwind CSS Specialist**: Tab styling, preview rendering

**QA Team**:
- **React Testing Library Specialist**: Preview toggle tests

---

## 5. Implementation Plan

### Phase 1: Database Foundation (Story #1)
**Specialists**: PostgreSQL Specialist
**Duration**: 1 day
**Deliverables**:
- Migration 005 (line columns)
- Indexes for performance
- RLS policies updated

### Phase 2: Frontend Line Comments (Story #1)
**Specialists**: React 19, TypeScript, Tailwind CSS, Zustand
**Duration**: 3 days
**Deliverables**:
- DiffViewer with click handlers
- LineCommentIndicator component
- LineCommentThread component
- Store extended with line selectors

### Phase 3: Integration & Testing (Story #1)
**Specialists**: Full-Stack Developer, QA Team
**Duration**: 2 days
**Deliverables**:
- API routes connected
- Unit tests GREEN
- Component tests GREEN
- E2E tests GREEN

### Phase 4: Keyboard Shortcuts (Story #2)
**Specialists**: React 19, Full-Stack Developer
**Duration**: 2 days
**Deliverables**:
- useKeyboardShortcuts hook
- j/k file navigation
- c comment, r reply
- ? help modal

### Phase 5: Markdown Preview (Story #3, Stretch)
**Specialists**: React 19, Tailwind CSS
**Duration**: 1 day
**Deliverables**:
- Tabbed comment input
- Real-time Markdown rendering

---

## 6. Integration Points

### DiffViewer ↔ LineCommentThread
- DiffViewer detects line click
- Injects LineCommentThread row into diff table
- Thread fetches comments via store selector

### CommentsStore ↔ Database
- Store includes line metadata in POST /api/comments
- Polling (2s) fetches line-specific comments
- Selector filters by file_path + line_number

### KeyboardShortcuts ↔ DiffViewer
- Hook listens for 'c' key
- Gets currently focused line number
- Triggers onLineClick handler

---

## 7. Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| diff2html DOM manipulation brittle | HIGH | HIGH | Wrap in try-catch, add data-attributes to line numbers |
| Line numbers mismatch after PR updates | MEDIUM | HIGH | Store line content snapshot for reference |
| Performance with 100+ line comments | MEDIUM | MEDIUM | Virtualize diff rendering, lazy load threads |
| Keyboard shortcuts conflict with browser | LOW | LOW | Document conflicts, allow customization |

---

## 8. Performance Requirements

### Story #1: Line Comments
- **Latency**: Line click to thread open <100ms
- **Rendering**: No layout shift when thread appears
- **Polling**: Max 1 request per file per 2s

### Story #2: Keyboard Shortcuts
- **Responsiveness**: Key press to action <50ms
- **Navigation**: Smooth scroll to next file <200ms

---

## 9. Design Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Line metadata storage | Separate table / Extend comments | Extend | Simpler queries, unified model |
| Comment thread display | Inline / Modal / Sidebar | Inline | Contextual, GitHub-like UX |
| Keyboard shortcuts library | react-hotkeys / Custom | Custom | Avoid bundle bloat, simple use case |
| Markdown preview | Full editor / Toggle tabs | Toggle tabs | MVP-appropriate, zero-cost |

---

## Status

**Next Step**: QA Lead writes test strategy (TDD RED phase)
**Checkpoint**: ⚠️ HIGH RISK - User approval required before implementation
**Reason**: Modifying diff2html DOM is fragile, line number mapping has edge cases

