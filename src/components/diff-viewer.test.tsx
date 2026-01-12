import { render, screen } from '@testing-library/react';
import { DiffViewer } from './diff-viewer';

/**
 * TDD RED Phase: Tests for DiffViewer component
 *
 * These tests should FAIL initially because DiffViewer doesn't exist yet.
 * Expected: ❌ 15 failed, 0 passed
 *
 * Coverage target: >= 85% for components
 */

describe('DiffViewer Component', () => {
  // Test Group 1: Basic Rendering (FR-A.1, FR-A.2)
  describe('Basic Rendering', () => {
    it('should render diff viewer with patch content', () => {
      const patch = `@@ -1,3 +1,4 @@
 function hello() {
-  console.log('old');
+  console.log('new');
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      // Should render the diff container
      const diffContainer = screen.getByTestId('diff-viewer');
      expect(diffContainer).toBeInTheDocument();
    });

    it('should display filename in header', () => {
      const patch = `@@ -1,3 +1,4 @@
 function hello() {}`;

      render(<DiffViewer patch={patch} filename="src/utils/helper.ts" />);

      // Filename should be visible
      expect(screen.getByText(/helper\.ts/)).toBeInTheDocument();
    });

    it('should handle empty patch gracefully', () => {
      render(<DiffViewer patch="" filename="empty.ts" />);

      // Should show "No changes" message
      expect(screen.getByText(/no changes/i)).toBeInTheDocument();
    });
  });

  // Test Group 2: Line Numbers (FR-A.2)
  describe('Line Numbers', () => {
    it('should display old line numbers', () => {
      const patch = `@@ -10,3 +10,4 @@
 function test() {
-  const old = 1;
+  const new = 1;
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      // Old line numbers should be visible
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display new line numbers', () => {
      const patch = `@@ -10,3 +11,4 @@
 function test() {
+  const added = 1;
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      // New line numbers should be visible
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });

  // Test Group 3: Color-Coded Changes (FR-A.3)
  describe('Color-Coded Change Indicators', () => {
    it('should highlight added lines with green background', () => {
      const patch = `@@ -1,3 +1,4 @@
 function hello() {
+  const newLine = 'added';
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      const addedLine = screen.getByText(/newLine/);
      const lineElement = addedLine.closest('[data-testid="diff-line"]');

      // Added lines should have green background class
      expect(lineElement).toHaveClass('bg-green-50');
    });

    it('should highlight deleted lines with red background', () => {
      const patch = `@@ -1,3 +1,2 @@
 function hello() {
-  const oldLine = 'deleted';
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      const deletedLine = screen.getByText(/oldLine/);
      const lineElement = deletedLine.closest('[data-testid="diff-line"]');

      // Deleted lines should have red background class
      expect(lineElement).toHaveClass('bg-red-50');
    });

    it('should display unchanged lines with neutral background', () => {
      const patch = `@@ -1,3 +1,3 @@
 function hello() {
   const unchanged = 'same';
 }`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      const unchangedLine = screen.getByText(/unchanged/);
      const lineElement = unchangedLine.closest('[data-testid="diff-line"]');

      // Unchanged lines should have neutral background
      expect(lineElement).toHaveClass('bg-white');
    });
  });

  // Test Group 4: Syntax Highlighting (FR-A.4)
  describe('Syntax Highlighting', () => {
    it('should apply syntax highlighting for TypeScript', () => {
      const patch = `@@ -1,3 +1,4 @@
+const message: string = 'hello';
 function test() {}`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      // Should have syntax highlighted elements
      const codeElement = screen.getByText(/const/);
      expect(codeElement).toHaveClass('token');
    });

    it('should apply syntax highlighting for JavaScript', () => {
      const patch = `@@ -1,3 +1,4 @@
+function hello() { return 'world'; }`;

      render(<DiffViewer patch={patch} filename="test.js" />);

      const codeElement = screen.getByText(/function/);
      expect(codeElement).toHaveClass('token');
    });

    it('should handle unsupported file types without errors', () => {
      const patch = `@@ -1,3 +1,4 @@
+Some binary content here
 Binary file changed`;

      // Should not throw error
      expect(() => {
        render(<DiffViewer patch={patch} filename="image.png" />);
      }).not.toThrow();
    });
  });

  // Test Group 5: Edge Cases (FR-A.5)
  describe('Edge Cases', () => {
    it('should handle large diffs (500+ lines) efficiently', () => {
      // Generate 500-line diff
      const lines = Array.from({ length: 500 }, (_, i) => `+  line ${i + 1}`).join('\n');
      const largePatch = `@@ -1,1 +1,500 @@
${lines}`;

      const startTime = performance.now();
      render(<DiffViewer patch={largePatch} filename="large.ts" />);
      const renderTime = performance.now() - startTime;

      // Should render in < 500ms (NFR-1.1)
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle malformed patch gracefully', () => {
      const malformedPatch = 'This is not a valid patch format';

      // Should not throw error
      expect(() => {
        render(<DiffViewer patch={malformedPatch} filename="test.ts" />);
      }).not.toThrow();

      // Should show error message
      expect(screen.getByText(/invalid patch/i)).toBeInTheDocument();
    });

    it('should handle very long single lines (> 200 chars)', () => {
      const longLine = 'x'.repeat(300);
      const patch = `@@ -1,1 +1,1 @@
-${longLine}
+${longLine}y`;

      render(<DiffViewer patch={patch} filename="test.ts" />);

      // Should render with horizontal scroll
      const diffContainer = screen.getByTestId('diff-viewer');
      expect(diffContainer).toHaveClass('overflow-x-auto');
    });
  });

  // Test Group 6: Responsive Design (FR-A.6)
  describe('Responsive Design', () => {
    it('should be responsive on mobile viewports', () => {
      const patch = `@@ -1,3 +1,4 @@
+const mobile = true;`;

      // Set mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<DiffViewer patch={patch} filename="test.ts" />);

      const diffContainer = screen.getByTestId('diff-viewer');

      // Should have mobile-friendly classes
      expect(diffContainer).toHaveClass('w-full');
    });
  });
});

/**
 * Expected Test Results (RED Phase):
 * ❌ 15 failed, 0 passed
 *
 * Failure reason: Cannot find module './diff-viewer'
 *
 * Next: GREEN Phase - Implement DiffViewer component to pass these tests
 */
