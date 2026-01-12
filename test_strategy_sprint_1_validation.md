# Sprint 1 Test Strategy: Counter Component Validation

**Created By**: QA Lead
**Date**: 2026-01-10
**Status**: READY FOR SCRUM MASTER CONSOLIDATION
**Based On**: technical_design_sprint_1_validation.md
**Test Framework**: Jest + React Testing Library (RTL)

**Executive Summary**:
This document provides a comprehensive test strategy for the Counter Component with a critical focus on Test-Driven Development (TDD). The strategy follows the RED-GREEN-REFACTOR methodology, ensuring tests are written FIRST, then implementation follows. This validates the TDD process for future sprints and ensures quality metrics (>= 95% coverage) are met through disciplined test-first development.

---

## 1. TEST APPROACH: TEST PYRAMID STRATEGY

### 1.1 Test Pyramid Overview

```
        ┌─────────────────────┐
        │   E2E/Manual Tests  │  (5% - User workflows)
        │  (Browser testing)  │
        ├─────────────────────┤
        │  Integration Tests  │  (25% - Component interactions)
        │ (Multi-button flows)│
        ├─────────────────────┤
        │   Unit Tests        │  (70% - Individual functions)
        │ (Button handlers)   │
        └─────────────────────┘
```

### 1.2 Test Breakdown

| Test Type | Count | Focus Area | Tools | Priority |
|-----------|-------|-----------|-------|----------|
| **Unit Tests** | 10 | Individual handlers, state updates | Jest + RTL | CRITICAL |
| **Integration Tests** | 4 | Multi-button workflows, sequences | Jest + RTL | CRITICAL |
| **Accessibility Tests** | 3 | a11y queries, keyboard nav, ARIA | jest-axe | HIGH |
| **Edge Case Tests** | 2 | Boundary conditions, stress testing | Jest + RTL | MEDIUM |
| **Snapshot Tests** | 0 | NOT RECOMMENDED (fragile) | - | SKIP |
| **E2E Tests** | 0 | Overkill for Sprint 1 | - | FUTURE |
| **TOTAL** | **19** | - | - | - |

### 1.3 Testing Principles

1. **User-Centric Queries**: Query by role, label, or text (not DOM structure)
   - Good: `screen.getByRole('button', { name: /increment/i })`
   - Bad: `screen.getByTestId('increment-btn')`

2. **No Implementation Details**: Test behavior, not internal state
   - Good: `expect(screen.getByText('5')).toBeInTheDocument()`
   - Bad: `expect(component.state.count).toBe(5)`

3. **Async Awareness**: Use `userEvent` (not `fireEvent`) for accurate interactions
   - Good: `await userEvent.click(button)`
   - Bad: `fireEvent.click(button)`

4. **Isolation**: Each test is independent and can run in any order

---

## 2. TDD RED-GREEN-REFACTOR PLAN (CRITICAL VALIDATION)

### 2.1 TDD Workflow Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    RED PHASE (Days 1-2)                          │
│  Write ALL tests FIRST (all fail, component not yet created)    │
├──────────────────────────────────────────────────────────────────┤
│  Test File: src/components/Counter.test.tsx                     │
│  Component: NOT YET CREATED (will fail 19/19 tests)            │
│  Expected: "19 failed, 0 passed"                                │
└──────────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                  GREEN PHASE (Days 2-3)                          │
│  Implement component to pass ALL tests                          │
├──────────────────────────────────────────────────────────────────┤
│  Component: src/components/Counter.tsx (CREATED)               │
│  Expected: "0 failed, 19 passed" (100% pass rate)              │
│  Coverage: >= 95% achieved                                      │
└──────────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│               REFACTOR PHASE (Days 4-5)                          │
│  Clean up, optimize, validate a11y                             │
├──────────────────────────────────────────────────────────────────┤
│  All tests STILL pass: "0 failed, 19 passed"                   │
│  Code review ready: TypeScript, ESLint, a11y validated         │
│  No test modifications (only code refactored)                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 RED PHASE: Test File Creation (Day 1)

**Objective**: Write ALL failing tests FIRST (before any component implementation)

**File to Create**: `src/components/Counter.test.tsx`

**Expected Test Results**: ALL 19 TESTS FAIL (because Counter.tsx doesn't exist yet)

#### Test File Structure

```typescript
// src/components/Counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';  // ← IMPORT WILL FAIL - FILE DOESN'T EXIST YET

describe('Counter Component - TDD Red Phase', () => {

  // UNIT TESTS: Initial Render
  describe('FR-A.1: Initial State Display', () => {
    test('displays 0 on initial render', () => {
      render(<Counter />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // UNIT TESTS: Increment Button
  describe('FR-A.2 & FR-A.3: Increment Button', () => {
    test('increment button is present and accessible', () => {
      render(<Counter />);
      const button = screen.getByRole('button', { name: /increment/i });
      expect(button).toBeInTheDocument();
    });

    test('increments count by 1 on single click', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const button = screen.getByRole('button', { name: /increment/i });
      await user.click(button);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('increments count by 1 on multiple consecutive clicks', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const button = screen.getByRole('button', { name: /increment/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('handles rapid clicks without losing count', async () => {
      const user = userEvent.setup({ delay: null }); // No delay
      render(<Counter />);
      const button = screen.getByRole('button', { name: /increment/i });
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  // UNIT TESTS: Decrement Button
  describe('FR-B.1 & FR-B.2: Decrement Button', () => {
    test('decrement button is present and accessible', () => {
      render(<Counter />);
      const button = screen.getByRole('button', { name: /decrement/i });
      expect(button).toBeInTheDocument();
    });

    test('decrements count by 1 on single click', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const button = screen.getByRole('button', { name: /decrement/i });
      await user.click(button);
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    test('decrements count by 1 on multiple consecutive clicks', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const button = screen.getByRole('button', { name: /decrement/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(screen.getByText('-3')).toBeInTheDocument();
    });

    test('allows count to go negative (no limit constraint)', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const button = screen.getByRole('button', { name: /decrement/i });
      for (let i = 0; i < 5; i++) {
        await user.click(button);
      }
      expect(screen.getByText('-5')).toBeInTheDocument();
    });
  });

  // UNIT TESTS: Reset Button
  describe('FR-B.3 & FR-B.4: Reset Button', () => {
    test('reset button is present and accessible', () => {
      render(<Counter />);
      const button = screen.getByRole('button', { name: /reset/i });
      expect(button).toBeInTheDocument();
    });

    test('resets count to 0 from positive number', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Increment to 5
      for (let i = 0; i < 5; i++) {
        await user.click(incButton);
      }
      expect(screen.getByText('5')).toBeInTheDocument();

      // Reset to 0
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('resets count to 0 from negative number', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const decButton = screen.getByRole('button', { name: /decrement/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Decrement to -3
      for (let i = 0; i < 3; i++) {
        await user.click(decButton);
      }
      expect(screen.getByText('-3')).toBeInTheDocument();

      // Reset to 0
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // INTEGRATION TESTS: Multi-Button Workflows
  describe('FR-B.5: Button Independence & Sequences', () => {
    test('buttons operate independently in sequence: increment → decrement → reset', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });
      const decButton = screen.getByRole('button', { name: /decrement/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Step 1: Increment 3 times
      await user.click(incButton);
      await user.click(incButton);
      await user.click(incButton);
      expect(screen.getByText('3')).toBeInTheDocument();

      // Step 2: Decrement 1 time
      await user.click(decButton);
      expect(screen.getByText('2')).toBeInTheDocument();

      // Step 3: Reset
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('reset button works after complex interaction pattern', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });
      const decButton = screen.getByRole('button', { name: /decrement/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Complex pattern: +5, -2, +1, -3
      for (let i = 0; i < 5; i++) await user.click(incButton);
      for (let i = 0; i < 2; i++) await user.click(decButton);
      await user.click(incButton);
      for (let i = 0; i < 3; i++) await user.click(decButton);
      // Expected: 5 - 2 + 1 - 3 = 1
      expect(screen.getByText('1')).toBeInTheDocument();

      // Reset
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('each button click independently updates display', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });
      const decButton = screen.getByRole('button', { name: /decrement/i });

      // Alternate clicks
      await user.click(incButton);
      expect(screen.getByText('1')).toBeInTheDocument();
      await user.click(decButton);
      expect(screen.getByText('0')).toBeInTheDocument();
      await user.click(incButton);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('multiple resets in a row maintain zero state', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const resetButton = screen.getByRole('button', { name: /reset/i });

      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
      await user.click(resetButton);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // ACCESSIBILITY TESTS: Keyboard Navigation & A11y
  describe('Accessibility: Keyboard Navigation & ARIA', () => {
    test('buttons are keyboard navigable (Tab key)', async () => {
      const user = userEvent.setup();
      render(<Counter />);

      const incButton = screen.getByRole('button', { name: /increment/i });
      const decButton = screen.getByRole('button', { name: /decrement/i });
      const resetButton = screen.getByRole('button', { name: /reset/i });

      // Tab to first button
      await user.tab();
      expect(incButton).toHaveFocus();

      // Tab to next button
      await user.tab();
      expect(decButton).toHaveFocus();

      // Tab to reset button
      await user.tab();
      expect(resetButton).toHaveFocus();
    });

    test('buttons can be activated with Enter/Space key', async () => {
      const user = userEvent.setup();
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });

      // Tab to button
      await user.tab();
      expect(incButton).toHaveFocus();

      // Activate with Space key
      await user.keyboard(' ');
      expect(screen.getByText('1')).toBeInTheDocument();

      // Press again with Enter key
      await user.keyboard('{Enter}');
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('buttons have semantic HTML (button elements with accessible labels)', () => {
      render(<Counter />);

      // Verify buttons are actual button elements
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);

      // Verify accessible names
      expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });

  // EDGE CASE TESTS: Stress Testing & Boundary Conditions
  describe('Edge Cases: Stress Testing & Boundary Conditions', () => {
    test('handles very large positive numbers', async () => {
      const user = userEvent.setup({ delay: null }); // Rapid clicks
      render(<Counter />);
      const incButton = screen.getByRole('button', { name: /increment/i });

      // Click 100 times
      for (let i = 0; i < 100; i++) {
        await user.click(incButton);
      }
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    test('handles very large negative numbers', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Counter />);
      const decButton = screen.getByRole('button', { name: /decrement/i });

      // Click 50 times
      for (let i = 0; i < 50; i++) {
        await user.click(decButton);
      }
      expect(screen.getByText('-50')).toBeInTheDocument();
    });
  });
});
```

### 2.3 RED PHASE Validation

**At end of RED phase (Day 1 afternoon)**:

```bash
npm test -- Counter.test.tsx

# Expected output:
# FAIL  src/components/Counter.test.tsx
# ✕ Counter Component - TDD Red Phase (19 suites)
#
# Test Suites: 1 failed, 0 passed, 1 total
# Tests:       19 failed, 0 passed, 19 total
#
# Reason: Cannot find module './Counter' (file doesn't exist yet)
```

**RED Phase Checklist**:
- [ ] Test file created: `src/components/Counter.test.tsx`
- [ ] All 19 tests fail (Component.tsx doesn't exist)
- [ ] No implementation file created yet (`Counter.tsx` MUST NOT exist)
- [ ] Test file is comprehensive (covers all acceptance criteria)
- [ ] Team confirms "RED phase is complete"

### 2.4 GREEN PHASE: Implementation (Days 2-3)

**Objective**: Implement Counter.tsx to pass ALL 19 tests

**File to Create**: `src/components/Counter.tsx`

**Implementation Template** (React Developer follows this):

```typescript
// src/components/Counter.tsx
import { useState } from 'react';

/**
 * Counter Component
 * A simple counter that displays a number with Increment, Decrement, and Reset buttons.
 *
 * @example
 * import { Counter } from './Counter';
 * export function App() {
 *   return <Counter />;
 * }
 *
 * @returns {JSX.Element} A counter component with three action buttons
 */
export function Counter() {
  const [count, setCount] = useState<number>(0);

  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);
  const handleReset = () => setCount(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      {/* Display Section */}
      <div className="text-6xl font-bold text-gray-900">{count}</div>

      {/* Button Group Section */}
      <div className="flex gap-4 flex-wrap justify-center">
        {/* Increment Button */}
        <button
          onClick={handleIncrement}
          className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white
                     hover:bg-blue-700 focus:outline-none focus:ring-4
                     focus:ring-blue-500 focus:ring-offset-2 transition-all"
          aria-label="Increment counter"
        >
          Increment
        </button>

        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white
                     hover:bg-red-700 focus:outline-none focus:ring-4
                     focus:ring-red-500 focus:ring-offset-2 transition-all"
          aria-label="Decrement counter"
        >
          Decrement
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white
                     hover:bg-gray-700 focus:outline-none focus:ring-4
                     focus:ring-gray-500 focus:ring-offset-2 transition-all"
          aria-label="Reset counter to zero"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
```

**GREEN Phase Test Validation**:

```bash
npm test -- Counter.test.tsx

# Expected output:
# PASS  src/components/Counter.test.tsx
# ✓ Counter Component - TDD Red Phase (19 suites)
#
# Test Suites: 1 passed, 0 failed, 1 total
# Tests:       19 passed, 0 failed, 19 total
#
# Coverage:
# Statements   : 100%
# Branches     : 100%
# Functions    : 100%
# Lines        : 100%
```

**GREEN Phase Checklist**:
- [ ] Component file created: `src/components/Counter.tsx`
- [ ] All 19 tests PASS (no failures)
- [ ] Code coverage: >= 95% (expected: 100%)
- [ ] No test file modifications (only implementation)
- [ ] Team confirms "GREEN phase is complete"

### 2.5 REFACTOR PHASE: Clean Up & Optimize (Days 4-5)

**Objective**: Improve code quality without breaking tests

**Tasks**:
1. Extract Tailwind classes to CSS Modules (optional)
2. Add JSDoc documentation (optional)
3. Code review by Lead Engineer
4. Accessibility validation (axe scan)
5. TypeScript & ESLint checks

**REFACTOR Checklist**:
- [ ] All 19 tests STILL PASS (no regressions)
- [ ] Code review approved (0 required changes)
- [ ] TypeScript compilation: `tsc --noEmit` passes
- [ ] ESLint: `npm run lint` passes (0 errors)
- [ ] Accessibility: axe scan shows 0 violations
- [ ] Team confirms "REFACTOR phase is complete"

---

## 3. TEST COVERAGE REQUIREMENTS

### 3.1 Coverage Targets

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|-----------|-------------|
| **Statements** | >= 95% | 90-95% | < 90% |
| **Branches** | >= 95% | 90-95% | < 90% |
| **Functions** | >= 95% | 90-95% | < 90% |
| **Lines** | >= 95% | 90-95% | < 90% |

### 3.2 Coverage Report Generation

**Before Code Review (GREEN phase)**:

```bash
# Generate coverage report
npm test -- --coverage Counter.test.tsx

# Expected output:
# ────────────────────────────────────────────────────────────────────
# File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
# ────────────────────────────────────────────────────────────────────
# Counter.tsx  100      100       100      100       -
# ────────────────────────────────────────────────────────────────────
# All files    100      100       100      100
```

**Coverage Report Attached to PR**:
- Screenshot or HTML report showing >= 95% metrics
- Link to coverage dashboard (if CI/CD configured)

### 3.3 Coverage Interpretation

**100% Coverage Explanation**:
- Every line of code executed by tests
- Every branch (if/else paths) tested
- Every function called and validated
- No dead code

**Why 95% is minimum (not 100%)**:
- Some edge cases may be untestable (e.g., React errors)
- Unreachable code paths are acceptable
- Performance is critical (diminishing returns after 95%)

---

## 4. ACCEPTANCE CRITERIA VALIDATION

### 4.1 Requirements Mapping

Each acceptance criterion from refined_requirements_sprint_1_validation.md maps to one or more tests:

#### Functional Requirements: Display & Increment (FR-A)

| Acceptance Criteria | Test Case | Test File | Status |
|-------------------|-----------|-----------|--------|
| **FR-A.1**: Counter displays 0 on initial load | "displays 0 on initial render" | Line 18-22 | RED → GREEN |
| **FR-A.2**: Increment button exists and is accessible | "increment button is present and accessible" | Line 25-30 | RED → GREEN |
| **FR-A.3**: Increment increments count by 1 per click | "increments count by 1 on single click" | Line 32-39 | RED → GREEN |
| **FR-A.4**: Increment updates display immediately (synchronous) | "increments count on multiple clicks" | Line 41-51 | RED → GREEN |

#### Functional Requirements: Decrement & Reset (FR-B)

| Acceptance Criteria | Test Case | Test File | Status |
|-------------------|-----------|-----------|--------|
| **FR-B.1**: Decrement button exists and is accessible | "decrement button is present and accessible" | Line 57-62 | RED → GREEN |
| **FR-B.2**: Decrement decrements count by 1 per click | "decrements count by 1 on single click" | Line 64-71 | RED → GREEN |
| **FR-B.3**: Reset button exists and is accessible | "reset button is present and accessible" | Line 84-89 | RED → GREEN |
| **FR-B.4**: Reset resets count to 0 from any number | "resets from positive/negative" | Lines 91-118 | RED → GREEN |
| **FR-B.5**: Buttons operate independently (no coupling) | "buttons operate independently in sequence" | Lines 127-163 | RED → GREEN |

#### Non-Functional Requirements (NFR)

| NFR | Test Case | Validation Method | Status |
|-----|-----------|-------------------|--------|
| **NFR-1**: Component renders in < 100ms | Performance profiling (DevTools) | Manual testing | GREEN |
| **NFR-2**: Button clicks update display < 16ms @ 60fps | Performance profiling | Manual testing | GREEN |
| **NFR-3**: No console errors or warnings | Console inspection (DevTools) | Manual testing | GREEN |
| **NFR-4**: Works in Chrome/Firefox/Safari | Browser compatibility | Manual testing | GREEN |
| **NFR-5**: WCAG 2.1 AA Accessible | a11y tests + axe scan | Jest-axe + axe DevTools | GREEN |

### 4.2 Acceptance Criteria → Test Case Mapping

```
User Story FR-A (Display & Increment):
├─ FR-A.1: Display 0 on load
│  └─ Test: "displays 0 on initial render"
├─ FR-A.2: Increment button exists
│  └─ Test: "increment button is present and accessible"
├─ FR-A.3: Increment works
│  └─ Test: "increments count by 1 on single click"
│  └─ Test: "increments count on multiple clicks"
│  └─ Test: "handles rapid clicks without losing count"
└─ FR-A.4: Immediate update (no async)
   └─ Validated by all tests (RTL queries don't wait)

User Story FR-B (Decrement & Reset):
├─ FR-B.1: Decrement button exists
│  └─ Test: "decrement button is present and accessible"
├─ FR-B.2: Decrement works (including negative)
│  └─ Test: "decrements count by 1 on single click"
│  └─ Test: "decrements count on multiple clicks"
│  └─ Test: "allows count to go negative"
├─ FR-B.3: Reset button exists
│  └─ Test: "reset button is present and accessible"
├─ FR-B.4: Reset works from any state
│  └─ Test: "resets from positive number"
│  └─ Test: "resets from negative number"
└─ FR-B.5: Buttons independent
   └─ Test: "buttons operate independently in sequence"
   └─ Test: "reset button works after complex pattern"
   └─ Test: "each button click independently updates"
   └─ Test: "multiple resets maintain zero state"

Accessibility (a11y):
├─ Keyboard navigation
│  └─ Test: "buttons are keyboard navigable (Tab key)"
├─ Keyboard activation
│  └─ Test: "buttons can be activated with Enter/Space"
└─ Semantic HTML & ARIA
   └─ Test: "buttons have semantic HTML with accessible labels"

Edge Cases:
├─ Large positive numbers
│  └─ Test: "handles very large positive numbers"
└─ Large negative numbers
   └─ Test: "handles very large negative numbers"
```

### 4.3 Traceability Matrix

| AC | Test ID | Test File | Expected | Status |
|----|---------|-----------|----------|--------|
| FR-A.1 | T01 | Counter.test.tsx:18 | PASS | RED→GREEN |
| FR-A.2 | T02 | Counter.test.tsx:25 | PASS | RED→GREEN |
| FR-A.3 | T03 | Counter.test.tsx:32 | PASS | RED→GREEN |
| FR-A.3 | T04 | Counter.test.tsx:41 | PASS | RED→GREEN |
| FR-A.3 | T05 | Counter.test.tsx:53 | PASS | RED→GREEN |
| FR-A.4 | T06 | Counter.test.tsx:32-51 | PASS | RED→GREEN |
| FR-B.1 | T07 | Counter.test.tsx:57 | PASS | RED→GREEN |
| FR-B.2 | T08 | Counter.test.tsx:64 | PASS | RED→GREEN |
| FR-B.2 | T09 | Counter.test.tsx:73 | PASS | RED→GREEN |
| FR-B.2 | T10 | Counter.test.tsx:83 | PASS | RED→GREEN |
| FR-B.3 | T11 | Counter.test.tsx:91 | PASS | RED→GREEN |
| FR-B.4 | T12 | Counter.test.tsx:96 | PASS | RED→GREEN |
| FR-B.4 | T13 | Counter.test.tsx:108 | PASS | RED→GREEN |
| FR-B.5 | T14 | Counter.test.tsx:127 | PASS | RED→GREEN |
| FR-B.5 | T15 | Counter.test.tsx:148 | PASS | RED→GREEN |
| FR-B.5 | T16 | Counter.test.tsx:170 | PASS | RED→GREEN |
| FR-B.5 | T17 | Counter.test.tsx:183 | PASS | RED→GREEN |
| A11y | T18 | Counter.test.tsx:197 | PASS | RED→GREEN |
| A11y | T19 | Counter.test.tsx:214 | PASS | RED→GREEN |
| A11y | T20 | Counter.test.tsx:230 | PASS | RED→GREEN |
| Edge | T21 | Counter.test.tsx:244 | PASS | RED→GREEN |
| Edge | T22 | Counter.test.tsx:256 | PASS | RED→GREEN |

---

## 5. RISK-BASED TESTING

### 5.1 Identified Risks & Mitigation

#### Risk 1: TDD Discipline Not Followed
**Severity**: CRITICAL (Process validation concern)
**Description**: Developer implements component before tests (violates TDD)

**Risk Indicators**:
- Component file created before test file
- No git commit showing tests first
- Implementation changes tests during RED phase

**Mitigation Strategy**:
1. QA Lead creates test file FIRST (Day 1)
2. Testing specialist verifies tests FAIL (RED phase)
3. Code review examines git log: `git log --oneline --graph`
   - Expected: `Counter.test.tsx` commit → `Counter.tsx` commit
4. Any deviation triggers "TDD FAILURE" in sprint review

**Verification**:
```bash
# Check commit order
git log --name-only --reverse | grep -E "Counter\.(test\.)?tsx"
# Expected output:
# Counter.test.tsx ← Created first
# Counter.tsx      ← Created second (after tests fail)
```

---

#### Risk 2: Coverage Falls Below 95%
**Severity**: HIGH (Validation metric)
**Description**: Untested code paths (edge cases, error handling)

**Risk Indicators**:
- Coverage report shows < 95% statements or branches
- Tests don't validate all button interactions
- Missing edge case tests (negative numbers, rapid clicks)

**Mitigation Strategy**:
1. Define coverage targets in Phase 1 (this document)
2. Generate coverage report after GREEN phase
3. Code review gates on >= 95% coverage
4. Any branch with < 95% requires additional tests

**Verification**:
```bash
npm test -- --coverage Counter.test.tsx
# Must show: 95%+ statements, 95%+ branches
```

---

#### Risk 3: Accessibility Violations
**Severity**: HIGH (NFR-5)
**Description**: Buttons not keyboard accessible, focus states missing, WCAG violations

**Risk Indicators**:
- axe scan reports violations
- Keyboard Tab navigation doesn't work
- Focus outline missing or < 3px
- Color contrast < 4.5:1

**Mitigation Strategy**:
1. Include 3 a11y tests in test suite (keyboard navigation, ARIA, semantic HTML)
2. Manual axe DevTools scan before code review
3. Keyboard navigation test (Tab, Enter, Space keys)
4. Code review checklist includes a11y verification

**Verification**:
```bash
# Step 1: Run a11y tests
npm test -- Counter.test.tsx -t "Accessibility"
# Expected: 3 tests pass

# Step 2: Manual axe scan
# Open browser → Extensions → axe DevTools → Scan
# Expected: "0 violations" message
```

---

#### Risk 4: Tests Flaky or Inconsistent
**Severity**: MEDIUM (Validation process)
**Description**: Tests pass sometimes, fail other times (race conditions, async issues)

**Risk Indicators**:
- Test passes on first run, fails on second
- Intermittent failures in CI/CD
- Race conditions with state updates

**Mitigation Strategy**:
1. Use `@testing-library/user-event` (not `fireEvent`)
2. Avoid `setTimeout` or manual `waitFor` (component is synchronous)
3. Run tests multiple times: `npm test -- --passWithNoTests`
4. No async operations in Counter component

**Verification**:
```bash
# Run tests 5 times
for i in {1..5}; do npm test -- Counter.test.tsx || exit 1; done
# All 5 runs must pass (0 failures)
```

---

#### Risk 5: Component Not Isolated (Testing Issues)
**Severity**: MEDIUM (Testing pattern)
**Description**: Component depends on parent context or props, can't test independently

**Risk Indicators**:
- Tests require Provider wrapping
- Component needs props to work
- Cannot render `<Counter />` in isolation

**Mitigation Strategy**:
1. Design Sprint 1: NO props, NO context (keep simple)
2. All tests render: `render(<Counter />)` (no Provider)
3. Code review verifies standalone design
4. Future sprints can add props/context

**Verification**:
```bash
# Verify component renders standalone
npm test -- Counter.test.tsx --verbose
# All tests should pass with `render(<Counter />)` only
```

---

#### Risk 6: Performance Regression
**Severity**: LOW (Counter is trivial)
**Description**: Component renders slowly, button clicks lag

**Risk Indicators**:
- Initial render > 100ms
- Button click update > 16ms
- DevTools shows excessive re-renders

**Mitigation Strategy**:
1. Counter is simple component (no optimization needed for Sprint 1)
2. Manual performance check in DevTools
3. No React.memo or useMemo required
4. Performance targets in Section 7 of technical_design

**Verification**:
```bash
# Manual DevTools profiling
# 1. Open Chrome DevTools → Performance
# 2. Record 5-10 button clicks
# 3. Expected: all renders < 16ms
```

---

### 5.2 Risk Testing Matrix

| Risk | Probability | Impact | Mitigation | Test Evidence |
|------|-------------|--------|-----------|----------------|
| TDD not followed | MEDIUM | CRITICAL | Commit history check | git log verification |
| Coverage < 95% | LOW | HIGH | Coverage gates | Jest coverage report |
| A11y violations | LOW | HIGH | a11y tests + axe scan | Test pass + axe zero violations |
| Flaky tests | LOW | MEDIUM | Use userEvent | All tests pass 5+ times |
| Not isolated | LOW | MEDIUM | No props design | Standalone render |
| Performance slow | VERY LOW | LOW | Simple component | DevTools profile |

---

## 6. QUALITY GATES: DEFINITION OF DONE FOR TESTING

### 6.1 Pre-Code-Review Gates (Testing Lead)

**All must PASS before code review**:

- [ ] **Test File Complete**
  - [ ] File created: `src/components/Counter.test.tsx`
  - [ ] All 19 tests present and documented
  - [ ] Tests follow RTL best practices (query by role/text)
  - [ ] No hardcoded test IDs or implementation details

- [ ] **RED Phase Verified**
  - [ ] Tests fail initially (Red phase confirmed)
  - [ ] Error message: "Cannot find module './Counter'"
  - [ ] All 19 tests show as "FAIL"
  - [ ] Screenshot/log attached to sprint review

- [ ] **GREEN Phase Achieved**
  - [ ] Implementation complete: `src/components/Counter.tsx`
  - [ ] All 19 tests PASS (0 failures)
  - [ ] No test modifications during implementation
  - [ ] Coverage report generated

- [ ] **Coverage Validated**
  - [ ] Statements >= 95%
  - [ ] Branches >= 95%
  - [ ] Functions >= 95%
  - [ ] Lines >= 95%
  - [ ] Coverage report attached to PR

- [ ] **Accessibility Tests Pass**
  - [ ] Keyboard navigation test passes
  - [ ] Keyboard activation test passes (Enter/Space)
  - [ ] Semantic HTML test passes
  - [ ] All 3 a11y tests passing

### 6.2 Code Review Gates (Lead Engineer)

**Code review must verify**:

- [ ] **Component Structure**
  - [ ] Functional component using React Hooks
  - [ ] TypeScript: `useState<number>(0)` typed correctly
  - [ ] No unused imports or variables
  - [ ] Follows naming conventions (camelCase functions)
  - [ ] Single responsibility principle

- [ ] **State Management**
  - [ ] Uses `useState` only (no Context/Redux)
  - [ ] State updates are synchronous
  - [ ] No direct state mutation
  - [ ] Default count = 0

- [ ] **Button Handlers**
  - [ ] `handleIncrement` increments by 1
  - [ ] `handleDecrement` decrements by 1
  - [ ] `handleReset` sets to 0
  - [ ] All handlers are pure functions

- [ ] **UI/Styling**
  - [ ] Tailwind CSS classes used
  - [ ] Layout: flex container, centered display
  - [ ] Buttons: Blue (Increment), Red (Decrement), Gray (Reset)
  - [ ] Focus outline: 4px ring with offset-2
  - [ ] Hover states: shadow and color change

- [ ] **Accessibility**
  - [ ] All buttons have accessible labels (not aria-label)
  - [ ] Semantic HTML: `<button>` elements (not `<div>`)
  - [ ] Focus states visible (3px+ outline)
  - [ ] Keyboard navigable (Tab support)
  - [ ] axe scan: 0 violations

- [ ] **Testing**
  - [ ] Test file comprehensive (19 tests)
  - [ ] Coverage >= 95%
  - [ ] All tests pass
  - [ ] No test modifications after implementation
  - [ ] Tests follow RTL patterns

- [ ] **Code Quality**
  - [ ] TypeScript: `tsc --noEmit` passes (0 errors)
  - [ ] ESLint: `npm run lint` passes (0 errors, 0 warnings)
  - [ ] Prettier: auto-formatted
  - [ ] No console.log in production code
  - [ ] JSDoc comments present (recommended)

- [ ] **Requirements Mapping**
  - [ ] All FR-A requirements met (FR-A.1 through FR-A.4)
  - [ ] All FR-B requirements met (FR-B.1 through FR-B.5)
  - [ ] All NFR requirements met (NFR-1 through NFR-5)
  - [ ] Traceability matrix complete

### 6.3 Code Review Approval Criteria

**Approval requires**:
- [ ] Code review: APPROVED (0 required changes)
- [ ] All tests: PASSING (19/19)
- [ ] Coverage: >= 95% (all metrics)
- [ ] a11y: 0 axe violations
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] Performance: < 100ms initial, < 16ms updates

**Rejection criteria** (requires rework):
- Any test failure
- Coverage < 95%
- a11y violations
- TypeScript errors
- Code review "required changes"

### 6.4 Sprint Review Gates

**Before sprint review presentation**:

- [ ] All code committed with clear messages
- [ ] PR created with test strategy linked
- [ ] Test file visible in repository
- [ ] Coverage report generated and visible
- [ ] axe scan report generated and visible
- [ ] Component demo working in browser
- [ ] Git log shows TDD workflow (tests → implementation)

---

## 7. TEST EXECUTION SCHEDULE

### 7.1 Timeline

```
Sprint Week 1: Counter Component TDD Validation
├── Day 1 (Friday)
│   ├── Morning (2 hours):
│   │   └─ QA Lead: Create test file with 19 failing tests
│   │
│   ├── Afternoon (2 hours):
│   │   ├─ Testing Specialist: Verify RED phase (all tests fail)
│   │   ├─ Accessibility Specialist: Define styling specs
│   │   └─ React Developer: Prepare for implementation
│   │
│   └─ EOD Deliverable: Counter.test.tsx with 19 FAILING tests
│
├── Day 2 (Monday)
│   ├── Morning (3 hours):
│   │   └─ React Developer: Implement Counter.tsx (GREEN phase)
│   │
│   ├── Afternoon (2 hours):
│   │   └─ Testing Specialist: Verify GREEN phase (all tests pass)
│   │
│   └─ EOD Deliverable: Counter.tsx with 19 PASSING tests
│
├── Day 3 (Tuesday)
│   ├── Morning (2 hours):
│   │   └─ React Developer: Code cleanup & optimization
│   │
│   ├── Afternoon (1 hour):
│   │   ├─ Accessibility Specialist: axe scan validation
│   │   └─ Testing Specialist: Coverage report generation
│   │
│   └─ EOD Deliverable: Refactored code, coverage report
│
├── Day 4 (Wednesday)
│   ├── Morning (2 hours):
│   │   └─ Lead Engineer: Code review against checklist
│   │
│   ├── Afternoon (1 hour):
│   │   └─ QA Lead: Final test validation & sign-off
│   │
│   └─ EOD Deliverable: Code review approved, PR ready
│
└── Day 5 (Thursday)
    ├── Morning (1 hour):
    │   └─ QA Lead: Test strategy document completion
    │
    ├── Afternoon (1 hour):
    │   └─ Team: Sprint review & demo
    │
    └─ EOD Status: READY FOR SCRUM MASTER CONSOLIDATION
```

### 7.2 Test Execution Checklist

**Day 1 - RED Phase**:
```bash
# QA Lead creates test file
touch src/components/Counter.test.tsx
# Add all 19 tests (see section 2.2)

# Verify RED phase
npm test -- Counter.test.tsx
# Expected: 19 failed, 0 passed
# Copy output and attach to sprint review
```

**Day 2 - GREEN Phase**:
```bash
# React Developer creates component
touch src/components/Counter.tsx
# Implement Counter component (see section 2.4 template)

# Verify GREEN phase
npm test -- Counter.test.tsx
# Expected: 19 passed, 0 failed
# Copy output and attach to PR
```

**Day 3 - REFACTOR Phase**:
```bash
# Run full test suite
npm test -- Counter.test.tsx

# Generate coverage report
npm test -- --coverage Counter.test.tsx
# Verify >= 95% on all metrics
# Screenshot and attach to PR

# Type check
npx tsc --noEmit
# Expected: 0 errors

# Lint check
npm run lint src/components/Counter.tsx
# Expected: 0 errors, 0 warnings
```

**Day 4-5 - Code Review & Sign-Off**:
```bash
# Final verification
npm test -- Counter.test.tsx
npm test -- --coverage Counter.test.tsx
npx tsc --noEmit
npm run lint src/components/Counter.tsx

# All must PASS
```

---

## 8. TEST DOCUMENTATION & REPORTING

### 8.1 Test Case Documentation

Each test in Counter.test.tsx includes:

**Structure**:
```typescript
test('should [behavior] when [condition]', async () => {
  // SETUP: Arrange (render component, prepare state)
  render(<Counter />);

  // ACT: Act (user interaction)
  const button = screen.getByRole('button', { name: /increment/i });
  await user.click(button);

  // ASSERT: Assert (verify result)
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

**Naming Convention**:
- Test name = requirement (user-centric, not implementation-centric)
- Good: `"increments count by 1 on single click"`
- Bad: `"setCount called with count + 1"`

### 8.2 Coverage Report Template

**Report to attach to PR**:

```
Jest Coverage Report: Counter Component
Generated: 2026-01-10 (Date)

────────────────────────────────────────────────────────────────────
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
────────────────────────────────────────────────────────────────────
Counter.tsx│   100   |   100    |   100   |   100   |      -
────────────────────────────────────────────────────────────────────
All files  │   100   |   100    |   100   |   100   |
────────────────────────────────────────────────────────────────────

Summary:
- Statements: 100% (100/100)
- Branches: 100% (all if/else paths tested)
- Functions: 100% (all handlers tested)
- Lines: 100% (all lines executed)

Target: >= 95% ✓ PASS
Status: EXCEEDED TARGET
```

### 8.3 Test Results Documentation

**RED Phase Report**:
```
Test Run #1 (RED Phase)
Date: 2026-01-10
Time: Before implementation

FAIL src/components/Counter.test.tsx

● Counter Component - TDD Red Phase

  ✕ FR-A.1: Initial State Display (1 test)
  ✕ FR-A.2 & FR-A.3: Increment Button (4 tests)
  ✕ FR-B.1 & FR-B.2: Decrement Button (4 tests)
  ✕ FR-B.3 & FR-B.4: Reset Button (3 tests)
  ✕ FR-B.5: Button Independence (4 tests)
  ✕ Accessibility: Keyboard Navigation (3 tests)
  ✕ Edge Cases (2 tests)

Test Suites: 1 failed, 1 total
Tests:       19 failed, 19 total
Snapshots:   0 total

Error: Cannot find module './Counter'
  at imports (Counter.test.tsx:5:28)

✓ RED PHASE VALIDATED
  All tests fail as expected (component not yet created)
```

**GREEN Phase Report**:
```
Test Run #1 (GREEN Phase)
Date: 2026-01-10
Time: After implementation

PASS src/components/Counter.test.tsx

✓ FR-A.1: Initial State Display (1 test)
✓ FR-A.2 & FR-A.3: Increment Button (4 tests)
✓ FR-B.1 & FR-B.2: Decrement Button (4 tests)
✓ FR-B.3 & FR-B.4: Reset Button (3 tests)
✓ FR-B.5: Button Independence (4 tests)
✓ Accessibility: Keyboard Navigation (3 tests)
✓ Edge Cases (2 tests)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total

Coverage Summary:
Statements   : 100% (target: >= 95%)
Branches     : 100% (target: >= 95%)
Functions    : 100% (target: >= 95%)
Lines        : 100% (target: >= 95%)

✓ GREEN PHASE VALIDATED
  All tests pass, coverage exceeds target
```

---

## 9. SPECIALIZED TEST CASES: DEEP DIVE

### 9.1 Unit Test: Increment Validation

**Test Case: "increments count by 1 on single click"**

**Requirement**: FR-A.3 - Increment button increases count by exactly 1

**Test Code**:
```typescript
test('increments count by 1 on single click', async () => {
  // SETUP
  const user = userEvent.setup();
  render(<Counter />);

  // Find button using accessible query
  const button = screen.getByRole('button', { name: /increment/i });
  expect(button).toBeInTheDocument(); // Verify button exists

  // ACT
  await user.click(button); // User interaction

  // ASSERT
  expect(screen.getByText('1')).toBeInTheDocument();
  // Verify display updated from 0 to 1
});
```

**Why this test matters**:
- Validates core functionality (increment logic)
- Uses RTL best practices (query by role)
- No implementation details leaked
- User-centric (click → display changes)

**Expected**: FAIL in RED phase, PASS in GREEN phase

---

### 9.2 Integration Test: Multi-Button Sequence

**Test Case: "buttons operate independently in sequence"**

**Requirement**: FR-B.5 - Multiple buttons work in sequence without interference

**Test Code**:
```typescript
test('buttons operate independently in sequence: increment → decrement → reset', async () => {
  // SETUP
  const user = userEvent.setup();
  render(<Counter />);
  const incButton = screen.getByRole('button', { name: /increment/i });
  const decButton = screen.getByRole('button', { name: /decrement/i });
  const resetButton = screen.getByRole('button', { name: /reset/i });

  // STEP 1: Increment 3 times
  await user.click(incButton);
  await user.click(incButton);
  await user.click(incButton);
  expect(screen.getByText('3')).toBeInTheDocument();

  // STEP 2: Decrement 1 time
  await user.click(decButton);
  expect(screen.getByText('2')).toBeInTheDocument();

  // STEP 3: Reset
  await user.click(resetButton);
  expect(screen.getByText('0')).toBeInTheDocument();
});
```

**Why this test matters**:
- Validates button independence (no coupling)
- Tests realistic user workflow
- Covers state persistence between actions
- Ensures handlers don't interfere with each other

**Expected**: FAIL in RED phase, PASS in GREEN phase

---

### 9.3 Accessibility Test: Keyboard Navigation

**Test Case: "buttons are keyboard navigable (Tab key)"**

**Requirement**: NFR-5 (a11y) - Component supports keyboard navigation

**Test Code**:
```typescript
test('buttons are keyboard navigable (Tab key)', async () => {
  // SETUP
  const user = userEvent.setup();
  render(<Counter />);

  const incButton = screen.getByRole('button', { name: /increment/i });
  const decButton = screen.getByRole('button', { name: /decrement/i });
  const resetButton = screen.getByRole('button', { name: /reset/i });

  // ACT: Simulate keyboard Tab navigation
  await user.tab(); // Focus first button
  expect(incButton).toHaveFocus();

  await user.tab(); // Focus second button
  expect(decButton).toHaveFocus();

  await user.tab(); // Focus third button
  expect(resetButton).toHaveFocus();
});
```

**Why this test matters**:
- Validates keyboard-only user support
- Tests a11y requirement (WCAG 2.1 AA)
- Ensures Tab order is logical
- No mouse required

**Expected**: FAIL in RED phase, PASS in GREEN phase

---

### 9.4 Edge Case Test: Stress Testing

**Test Case: "handles very large positive numbers"**

**Requirement**: Counter should work reliably at scale

**Test Code**:
```typescript
test('handles very large positive numbers', async () => {
  // SETUP
  const user = userEvent.setup({ delay: null }); // Rapid fire clicks
  render(<Counter />);
  const incButton = screen.getByRole('button', { name: /increment/i });

  // ACT: Click 100 times rapidly
  for (let i = 0; i < 100; i++) {
    await user.click(incButton);
  }

  // ASSERT
  expect(screen.getByText('100')).toBeInTheDocument();
  // Verify count is accurate after rapid clicks
});
```

**Why this test matters**:
- Validates component handles stress
- Tests edge case (very large numbers)
- Ensures state accuracy after many operations
- No race conditions

**Expected**: FAIL in RED phase, PASS in GREEN phase

---

## 10. HANDLING FLAKY TESTS

### 10.1 Flaky Test Symptoms

**Signs of flaky tests**:
- Test passes on first run, fails on second
- Inconsistent failures in CI/CD
- Pass rate drops on repeated runs
- Async timing issues

### 10.2 Prevention Strategies

**For Counter component (synchronous, simple)**:

1. **Use userEvent instead of fireEvent**
   ```typescript
   // Good (userEvent - handles async properly)
   await user.click(button);

   // Bad (fireEvent - doesn't handle async)
   fireEvent.click(button);
   ```

2. **No setTimeout or waitFor**
   ```typescript
   // Bad - unnecessary waiting (component is sync)
   await waitFor(() => {
     expect(screen.getByText('1')).toBeInTheDocument();
   });

   // Good - query immediately (component is sync)
   expect(screen.getByText('1')).toBeInTheDocument();
   ```

3. **Avoid implementation details**
   ```typescript
   // Bad - depends on internal state
   expect(component.state.count).toBe(1);

   // Good - test user-visible output
   expect(screen.getByText('1')).toBeInTheDocument();
   ```

### 10.3 Flaky Test Detection

**Run tests multiple times**:
```bash
# Run same test 5 times
for run in {1..5}; do
  npm test -- Counter.test.tsx --testNamePattern="increments count"
  if [ $? -ne 0 ]; then
    echo "FLAKY: Test failed on run $run"
    exit 1
  fi
done

echo "✓ All 5 runs passed - test is stable"
```

---

## 11. TEST MAINTENANCE & EVOLUTION

### 11.1 Test Modification Policy

**When to modify tests**:
- Acceptance criteria change
- Bug discovered in tests (logic error)
- New a11y requirement discovered
- Performance targets change

**When NOT to modify tests**:
- Implementation changes (tests stay the same)
- Refactoring code (tests stay the same)
- Code review feedback (tests are already approved)
- Just trying to make tests pass (this means implementation is wrong)

### 11.2 Test Pattern Library

**Reusable patterns for future components**:

**Pattern 1: Query by Role**
```typescript
// Use for: Buttons, inputs, selects (semantic HTML)
const button = screen.getByRole('button', { name: /label/i });
```

**Pattern 2: User Interaction**
```typescript
// Use for: Click, type, keyboard events
const user = userEvent.setup();
await user.click(button);
```

**Pattern 3: Integration Test**
```typescript
// Use for: Multi-step workflows
// Arrange → Act (step 1) → Assert → Act (step 2) → Assert
render(<Component />);
await user.interact();
expect(result).toBe(expected);
```

**Pattern 4: Accessibility Test**
```typescript
// Use for: Keyboard nav, ARIA, semantic HTML
await user.tab();
expect(element).toHaveFocus();
```

### 11.3 Test Documentation

**For future QA leads** (documentation in code):

```typescript
describe('Counter Component', () => {
  /**
   * Test Suite: Counter Component
   *
   * Purpose: Validate TDD implementation of simple counter
   *
   * Test Categories:
   * 1. Unit Tests (10): Individual button handlers
   * 2. Integration Tests (4): Multi-button workflows
   * 3. Accessibility Tests (3): Keyboard nav, ARIA
   * 4. Edge Cases (2): Stress testing, boundaries
   *
   * Coverage Target: >= 95% (all metrics)
   * TDD Workflow: RED → GREEN → REFACTOR
   *
   * Dependencies:
   * - @testing-library/react
   * - @testing-library/user-event
   * - Jest
   *
   * Maintenance:
   * - Update tests if FR-A or FR-B requirements change
   * - DO NOT modify tests during implementation
   * - Tests validate user behavior, not implementation
   */
});
```

---

## 12. SPRINT REVIEW PRESENTATION

### 12.1 Presentation Agenda

**Sprint Review: Counter Component TDD Validation (30 minutes)**

```
1. TDD Workflow Overview (5 min)
   ├─ RED phase: All tests fail initially (screenshot)
   ├─ GREEN phase: All tests pass (screenshot)
   ├─ REFACTOR phase: Code cleaned, tests still pass
   └─ Git log: Commit history shows TDD order

2. Test Coverage Metrics (5 min)
   ├─ Coverage report: 100% statements/branches
   ├─ 19 tests total: Unit, Integration, a11y, Edge cases
   ├─ All tests passing (0 failures)
   └─ Coverage targets exceeded (>= 95%)

3. Acceptance Criteria Validation (5 min)
   ├─ FR-A: Display & Increment (4 tests)
   ├─ FR-B: Decrement & Reset (5 tests)
   ├─ NFR: Accessibility (3 tests)
   └─ Traceability matrix complete

4. Quality Assurance (5 min)
   ├─ TypeScript: 0 errors (tsc --noEmit)
   ├─ ESLint: 0 errors (npm run lint)
   ├─ Accessibility: 0 axe violations
   └─ Code review: APPROVED

5. Live Demo (5 min)
   ├─ Component renders correctly
   ├─ Buttons work (increment, decrement, reset)
   ├─ Keyboard navigation works (Tab, Enter, Space)
   └─ Accessibility verified (axe scan)

6. Lessons Learned & Next Steps (5 min)
   ├─ TDD process validation: SUCCESSFUL
   ├─ Team feedback: [from retrospective]
   ├─ Improvements for Sprint 2: [if any]
   └─ Readiness for next component
```

### 12.2 Artifacts to Present

**Visual Evidence**:
1. **RED Phase Screenshot**: Test failure output
   ```
   ✕ 19 failed, 0 passed
   Cannot find module './Counter'
   ```

2. **GREEN Phase Screenshot**: Test pass output
   ```
   ✓ 19 passed, 0 failed
   Coverage: 100%
   ```

3. **Coverage Report**: HTML or table showing >= 95%

4. **axe Scan Report**: "0 violations" message

5. **Git Log**: Showing TDD commit order
   ```
   commit X: feat: Write Counter component tests (RED)
   commit Y: feat: Implement Counter component (GREEN)
   commit Z: refactor: Clean up Counter code (REFACTOR)
   ```

6. **Code Review**: Approval checklist (all items checked)

7. **Live Component**: Working counter in browser

---

## 13. CONCLUSION & HANDOFF STATUS

### 13.1 Test Strategy Summary

This test strategy document provides:

1. **Comprehensive Test Coverage**: 19 tests covering all acceptance criteria
2. **TDD Validation**: RED-GREEN-REFACTOR workflow documented
3. **Quality Gates**: Definition of Done for testing
4. **Risk Management**: 6 identified risks with mitigation strategies
5. **Accessibility Focus**: 3 a11y tests ensuring WCAG 2.1 AA compliance
6. **Documentation**: Test cases, patterns, and maintenance guidelines

### 13.2 Success Criteria (QA Lead Sign-Off)

**This test strategy is complete when**:

- [ ] Test file created: `src/components/Counter.test.tsx` (19 tests)
- [ ] RED phase verified: All tests fail initially
- [ ] GREEN phase verified: All tests pass after implementation
- [ ] Coverage: >= 95% on all metrics
- [ ] Code review: APPROVED (0 required changes)
- [ ] a11y: 0 axe violations
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 errors
- [ ] Performance: < 100ms initial, < 16ms updates
- [ ] All acceptance criteria mapped to tests
- [ ] Team trained on TDD workflow
- [ ] Sprint review ready with evidence

### 13.3 Status & Handoff

**Current Status**: READY FOR SCRUM MASTER CONSOLIDATION

**What's Needed**:
1. Test file creation (QA Lead action)
2. Developer implementation (React Developer action)
3. Code review (Lead Engineer action)
4. Sprint review presentation (Team action)

**Handoff Instructions**:
1. QA Lead: Distribute this test strategy to team
2. Testing Specialist: Create `Counter.test.tsx` with all 19 tests
3. React Developer: Implement `Counter.tsx` after tests fail
4. Lead Engineer: Review against checklist (Section 6)
5. Scrum Master: Consolidate status for sprint review

**Next Phase**:
- Sprint execution (Days 1-5)
- TDD workflow validation
- Sprint review (end of week)
- Retrospective feedback
- Sprint 2 planning

---

## Appendix A: Quick Reference Test Commands

```bash
# Run all Counter tests
npm test -- Counter.test.tsx

# Run specific test (by name)
npm test -- Counter.test.tsx -t "increments count"

# Run with coverage
npm test -- --coverage Counter.test.tsx

# Run in watch mode (during development)
npm test -- Counter.test.tsx --watch

# Run 5 times (flaky test detection)
for i in {1..5}; do npm test -- Counter.test.tsx || exit 1; done

# Type check
npx tsc --noEmit

# Lint
npm run lint src/components/Counter.tsx

# All quality checks
npm test -- Counter.test.tsx && npm test -- --coverage Counter.test.tsx && npx tsc --noEmit && npm run lint src/components/Counter.tsx
```

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **RED Phase** | Write tests first (all fail, component doesn't exist) |
| **GREEN Phase** | Implement component to pass all tests |
| **REFACTOR Phase** | Clean up code while keeping tests passing |
| **TDD** | Test-Driven Development (Red → Green → Refactor) |
| **Unit Test** | Test single function/handler in isolation |
| **Integration Test** | Test multiple components working together |
| **Coverage** | Percentage of code executed by tests |
| **a11y** | Accessibility (WCAG 2.1 AA compliance) |
| **RTL** | React Testing Library (query by role/label) |
| **Acceptance Criteria** | Requirements that component must meet |

---

**Document Status**: FINAL - READY FOR SCRUM MASTER CONSOLIDATION

**Created By**: QA Lead
**Date**: 2026-01-10
**Version**: 1.0

**Next Steps**:
1. Distribute to team
2. Execute RED phase (Day 1)
3. Execute GREEN phase (Day 2-3)
4. Execute REFACTOR phase (Day 4-5)
5. Sprint review presentation (Day 5)

**For Questions**: Contact QA Lead

---

End of Test Strategy Document
