# Sprint 4: Technical Design

**Sprint Goal**: Wire Sprint 3 features into the application and add visual polish
**Created By**: Lead Engineer
**Date**: 2026-01-13

---

## Architecture Overview

### Current State
- PR page (`/repositories/[owner]/[repo]/pull/[number]`) is a Server Component
- DiffViewer renders without line comment functionality
- Keyboard shortcuts hook exists but not integrated
- LineCommentThread component exists but not used

### Target State
- FilesSection becomes client component with line comment state
- DiffViewer wired with onLineClick and lineCommentCounts
- Keyboard shortcuts integrated with focus state
- E2E tests covering integration

---

## Story #1: Line Comments Integration

### Multi-Domain Detection
- **Frontend**: New FilesSection client component
- **State Management**: Line comment state, selected line state
- **Database**: No changes (Sprint 3 migration ready)

### Technical Approach

**Step 1**: Create FilesSection client component
```typescript
// src/components/files-section.tsx
"use client";

interface FilesSectionProps {
  files: FileChange[];
  prId: string;
}

export function FilesSection({ files, prId }: FilesSectionProps) {
  const [selectedLine, setSelectedLine] = useState<LineClickInfo | null>(null);
  const { getFileCommentSummary } = useCommentsStore();

  const handleLineClick = (lineInfo: LineClickInfo) => {
    setSelectedLine(lineInfo);
  };

  return (
    <>
      {files.map((file, index) => (
        <DiffViewer
          key={index}
          patch={file.patch}
          filename={file.filename}
          onLineClick={handleLineClick}
          lineCommentCounts={getFileCommentSummary(prId, file.filename)}
        />
      ))}

      {selectedLine && (
        <LineCommentThread
          prId={prId}
          lineInfo={selectedLine}
          onClose={() => setSelectedLine(null)}
        />
      )}
    </>
  );
}
```

**Step 2**: Update PR page to use FilesSection
```typescript
// In page.tsx, replace DiffViewer loop with:
<FilesSection files={files} prId={`${owner}/${repo}/${number}`} />
```

**Step 3**: Initialize comments store with polling
```typescript
// FilesSection needs to poll for comments
// Use existing useComments hook with prId
```

### Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `src/components/files-section.tsx` | CREATE | Client component for file list with line comments |
| `src/app/.../page.tsx` | MODIFY | Use FilesSection instead of DiffViewer loop |

### Tests
- Component test: FilesSection renders files
- E2E test: Click line → modal opens → add comment → badge appears

---

## Story #2: Keyboard Navigation Focus State

### Multi-Domain Detection
- **State Management**: New focus-state store
- **Frontend**: Visual indicators in DiffViewer
- **Hooks**: Wire useKeyboardShortcuts to focus state

### Technical Approach

**Step 1**: Create focus-state store
```typescript
// src/lib/stores/focus-state-store.ts
interface FocusState {
  currentFileIndex: number;
  currentLineNumber: number | null;
  totalFiles: number;

  setCurrentFile: (index: number) => void;
  setCurrentLine: (lineNumber: number | null) => void;
  nextFile: () => void;
  prevFile: () => void;
}
```

**Step 2**: Add focusedLine prop to DiffViewer
```typescript
// DiffViewer already highlights lines, add:
interface DiffViewerProps {
  // ... existing props
  focusedLine?: number; // Highlighted line for keyboard nav
}
```

**Step 3**: Wire keyboard shortcuts in FilesSection
```typescript
const { currentFileIndex, nextFile, prevFile } = useFocusStateStore();

useKeyboardShortcuts({
  onNextFile: nextFile,
  onPrevFile: prevFile,
  onOpenComment: () => {/* open comment on focused line */},
  onToggleHelp: () => setShowHelp(true),
});
```

### Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `src/lib/stores/focus-state-store.ts` | CREATE | Focus state management |
| `src/lib/stores/focus-state-store.test.ts` | CREATE | Tests for focus store |
| `src/components/diff-viewer.tsx` | MODIFY | Add focusedLine visual |
| `src/components/files-section.tsx` | MODIFY | Wire keyboard shortcuts |

### Tests
- Store tests: nextFile, prevFile, bounds checking
- E2E test: Press j → file changes → visual indicator moves

---

## Story #3: E2E Testing Setup

### Technical Approach

**Step 1**: Install Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

**Step 2**: Configure Playwright
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

**Step 3**: Create test for line comments
```typescript
// e2e/line-comments.spec.ts
test('can add line comment', async ({ page }) => {
  await page.goto('/repositories/owner/repo/pull/1');

  // Click on line number
  await page.click('.d2h-code-side-linenumber:has-text("10")');

  // Modal should open
  await expect(page.locator('.line-comment-thread')).toBeVisible();

  // Add comment
  await page.fill('textarea', 'Test comment');
  await page.click('button:has-text("Comment")');

  // Badge should appear
  await expect(page.locator('.line-comment-badge')).toBeVisible();
});
```

### Files to Create
| File | Action | Description |
|------|--------|-------------|
| `playwright.config.ts` | CREATE | Playwright configuration |
| `e2e/line-comments.spec.ts` | CREATE | Line comment E2E tests |
| `e2e/keyboard-nav.spec.ts` | CREATE | Keyboard navigation tests |

---

## Story #4: Markdown Preview [STRETCH]

### Technical Approach

**Step 1**: Install react-markdown
```bash
npm install react-markdown
```

**Step 2**: Add tabs to CommentInput
```typescript
// Extend CommentInput with showPreview state
const [showPreview, setShowPreview] = useState(false);

{showPreview ? (
  <ReactMarkdown>{body}</ReactMarkdown>
) : (
  <textarea value={body} onChange={...} />
)}
```

### Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `src/components/comment-input.tsx` | MODIFY | Add Write/Preview tabs |

---

## Implementation Order

```
Phase 1: Line Comments Integration (Story #1)
├── Create FilesSection component
├── Wire DiffViewer with handlers
└── Update PR page

Phase 2: Focus State (Story #2)
├── Create focus-state store
├── Add store tests
├── Add focusedLine to DiffViewer
└── Wire keyboard shortcuts

Phase 3: E2E Tests (Story #3)
├── Install Playwright
├── Configure test environment
└── Write line comment tests

Phase 4: Markdown Preview [STRETCH]
└── Add Write/Preview tabs
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Server Component → Client Component migration | FilesSection is isolated, minimal changes to page |
| E2E tests need running server | Use Playwright's webServer config |
| Focus state sync issues | Store is client-side only, no persistence needed |

---

## Specialist Assignments

| Specialist | Tasks |
|------------|-------|
| React 19 Specialist | FilesSection component, Server/Client split |
| Zustand Specialist | Focus state store |
| Tailwind CSS Specialist | Focus indicators, highlight styles |
| Playwright Specialist | E2E test setup and tests |
| Full-Stack Developer | Integration coordination |

---

**Status**: READY FOR SPRINT PLAN
**Next Step**: Scrum Master creates `sprint_plan_sprint_4.md`
