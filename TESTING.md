# Testing Strategy

This document outlines the testing approach for the Code Review Dashboard project.

## Philosophy: TDD-Influenced Development

We use a **TDD-influenced** approach rather than strict TDD. This means:

1. **Test business logic first** - Zustand stores contain pure functions that are easy to test
2. **Pragmatic component testing** - Focus on structure and edge cases, not implementation details
3. **Minimal mocking** - Avoid complex Supabase mocks; test what we control
4. **High value, low complexity** - Prioritize tests that catch real bugs with minimal setup

### Why Not Strict TDD?

Strict TDD (RED → GREEN → REFACTOR) works well for greenfield projects with stable requirements. For this project:

- **Supabase hooks** require extensive mocking (low value, high complexity)
- **Real-time features** are better tested manually or with E2E tests
- **Zustand stores** are pure functions (high value, low complexity)

## Test Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner (fast, Vite-native) |
| **@testing-library/react** | Component testing |
| **@testing-library/jest-dom** | DOM matchers |
| **jsdom** | Browser environment simulation |
| **@vitest/coverage-v8** | Coverage reporting |

## Test Structure

```
src/
├── components/
│   └── diff-viewer.test.tsx      # Component tests
├── lib/
│   └── stores/
│       ├── presence-store.test.ts  # Store tests
│       ├── cursor-store.test.ts    # Store tests
│       └── comments-store.test.ts  # Store tests
└── test/
    ├── setup.ts                    # Test environment setup
    └── mocks.ts                    # Shared mock utilities
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Coverage Report

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

### Current Coverage (55 tests)

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **cursor-store.ts** | 100% | 90% | 100% | 100% |
| **comments-store.ts** | 87.93% | 61.11% | 89.28% | 87.27% |
| **presence-store.ts** | 76.66% | 70% | 76.19% | 73.07% |
| **diff-viewer.tsx** | 75% | 81.81% | 66.66% | 73.33% |

### Coverage Thresholds

Defined in `vitest.config.ts`:

```typescript
thresholds: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
},
```

## Test Categories

### 1. Store Tests (Highest Priority)

Zustand stores contain the core business logic. They are pure functions that are easy to test.

**Example: cursor-store.test.ts**

```typescript
describe('Cursor Store', () => {
  beforeEach(() => {
    useCursorStore.setState({ cursorsByPRFile: {}, myColor: null });
  });

  it('should filter out own cursor from cursor list', () => {
    const store = useCursorStore.getState();
    store.setCursors('owner/repo/1', 'src/index.ts', [
      createMockCursor({ session_id: 'session-1' }),
      createMockCursor({ session_id: 'session-2' }),
    ]);

    const result = store.getCursorsForFile('owner/repo/1', 'src/index.ts');
    expect(result).toHaveLength(2);
  });
});
```

**What to test:**
- State mutations (setComments, addComment, deleteComment)
- Computed values (getTopLevelComments, getReplies)
- Edge cases (empty arrays, missing keys)
- Optimistic UI logic (markError, replaceOptimistic)

### 2. Component Tests (Medium Priority)

Focus on rendering and structure, not implementation details.

**Example: diff-viewer.test.tsx**

```typescript
describe('DiffViewer Component', () => {
  it('should render diff viewer with patch content', () => {
    const patch = `@@ -1,3 +1,4 @@
 function hello() {
-  console.log('old');
+  console.log('new');
 }`;

    render(<DiffViewer patch={patch} filename="test.ts" />);

    expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
  });

  it('should handle empty patch gracefully', () => {
    render(<DiffViewer patch="" filename="empty.ts" />);

    expect(screen.getByText(/no changes/i)).toBeInTheDocument();
  });
});
```

**What to test:**
- Component renders without crashing
- Props are handled correctly
- Edge cases (empty, null, large data)
- Accessibility (test IDs, ARIA attributes)

**What NOT to test:**
- Third-party library internals (diff2html rendering)
- CSS styling details
- Supabase integration (use mocks or skip)

### 3. Hook Tests (Deferred)

Hooks that integrate with Supabase require extensive mocking. We defer these to manual testing or future E2E tests.

**Why deferred:**
- Supabase client mocking is complex
- Real-time polling is time-dependent
- Manual testing is more reliable for these flows

**Future approach:**
- Use Playwright for E2E testing
- Test with real Supabase instance in CI

## Test Setup

### Environment Setup (src/test/setup.ts)

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser APIs not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### Mock Utilities (src/test/mocks.ts)

```typescript
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    // ... other Supabase methods
  })),
};
```

## Writing New Tests

### Step 1: Identify Test Category

| What you're testing | Category | Priority |
|---------------------|----------|----------|
| Zustand store logic | Store test | High |
| Component rendering | Component test | Medium |
| Supabase integration | Manual/E2E | Low |

### Step 2: Create Test File

Follow naming convention: `{component-name}.test.{ts,tsx}`

### Step 3: Write Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = createMockData();

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Step 4: Run and Verify

```bash
npm test -- --filter="FeatureName"
```

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main branch

```yaml
# .github/workflows/test.yml (example)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Common Issues

**1. "Cannot find module" errors**

Ensure path aliases are configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

**2. JSX/Global attribute warnings**

These warnings come from styled-jsx and are harmless in tests:

```
Received `true` for a non-boolean attribute `jsx`.
```

**3. Async component issues**

Use `waitFor` for async operations:

```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

**4. Store state bleeding between tests**

Always reset store state in `beforeEach`:

```typescript
beforeEach(() => {
  useStore.setState(initialState);
});
```

## Future Testing Roadmap

### Phase 1 (Current)
- [x] Vitest setup
- [x] Store tests (presence, cursor, comments)
- [x] Component tests (diff-viewer)

### Phase 2 (Next Sprint)
- [ ] Additional component tests
- [ ] Activity feed tests
- [ ] Error boundary tests

### Phase 3 (Future)
- [ ] Playwright E2E setup
- [ ] Multi-user collaboration tests
- [ ] Visual regression tests

---

**Last Updated**: 2026-01-13
