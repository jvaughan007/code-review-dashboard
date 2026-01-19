"use client";

import { useEffect, useRef } from 'react';
import * as Diff2Html from 'diff2html';
import Prism from 'prismjs';
// CSS imports moved to globals.css for reliable bundling

/**
 * Check if an element is visible in the viewport
 */
function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Element is considered visible if at least 50% is in viewport
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const elementHeight = rect.height;

  return visibleHeight >= elementHeight * 0.5;
}

/**
 * Debounce utility for scroll operations
 */
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Import common language syntaxes
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

export type LineClickInfo = {
  filePath: string;
  lineNumber: number;
  lineType: 'addition' | 'deletion' | 'context';
  lineContent: string;
};

export type DiffViewMode = 'side-by-side' | 'unified';

export interface DiffViewerProps {
  patch: string;
  filename: string;
  className?: string;
  /** Callback when a line number is clicked (for line comments) */
  onLineClick?: (lineInfo: LineClickInfo) => void;
  /** Map of line numbers to comment counts (for indicators) */
  lineCommentCounts?: Map<number, number>;
  /** Currently focused line number for keyboard navigation */
  focusedLine?: number | null;
  /** Whether this file is the focused file for keyboard navigation */
  isFocusedFile?: boolean;
  /** View mode: side-by-side or unified (default: side-by-side) */
  viewMode?: DiffViewMode;
}

/**
 * DiffViewer - Renders syntax-highlighted git diffs
 *
 * Features:
 * - Syntax highlighting via Prism.js
 * - Side-by-side or unified view
 * - Line numbers
 * - Color-coded additions/deletions
 * - Responsive design
 *
 * Uses diff2html for diff parsing and rendering
 */
export function DiffViewer({
  patch,
  filename,
  className = '',
  onLineClick,
  lineCommentCounts,
  focusedLine,
  isFocusedFile = false,
  viewMode = 'side-by-side',
}: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !patch) return;

    // Store cleanup functions for event listeners
    const cleanupFns: (() => void)[] = [];

    try {
      // Format the patch with proper diff headers for diff2html
      // GitHub API returns just the patch content, but diff2html needs full unified diff format
      const formattedPatch = `diff --git a/${filename} b/${filename}
--- a/${filename}
+++ b/${filename}
${patch}`;

      // Generate diff HTML using diff2html
      const diffHtml = Diff2Html.html(formattedPatch, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: viewMode === 'unified' ? 'line-by-line' : 'side-by-side',
        renderNothingWhenEmpty: false,
      });

      // Set the HTML
      containerRef.current.innerHTML = diffHtml;

      // Apply syntax highlighting to code blocks
      const codeBlocks = containerRef.current.querySelectorAll('code');
      codeBlocks.forEach((block) => {
        Prism.highlightElement(block);
      });

      // Add click handlers to line numbers (for line comments)
      if (onLineClick) {
        const lineRows = containerRef.current.querySelectorAll('.d2h-code-side-line');
        lineRows.forEach((row) => {
          const lineNumberEl = row.querySelector('.d2h-code-side-linenumber');
          const lineContentEl = row.querySelector('.d2h-code-side-line');

          if (lineNumberEl) {
            // Extract line number from element
            const lineNumText = lineNumberEl.textContent?.trim();
            const lineNumber = lineNumText ? parseInt(lineNumText, 10) : null;

            if (lineNumber && !isNaN(lineNumber)) {
              // Determine line type from parent row classes
              const parentRow = lineNumberEl.closest('tr');
              let lineType: 'addition' | 'deletion' | 'context' = 'context';
              if (parentRow?.classList.contains('d2h-ins')) {
                lineType = 'addition';
              } else if (parentRow?.classList.contains('d2h-del')) {
                lineType = 'deletion';
              }

              // Get line content
              const lineContent = lineContentEl?.textContent?.trim() || '';

              // Add clickable styling
              (lineNumberEl as HTMLElement).classList.add('line-number-clickable');

              // Add click handler
              const handleClick = () => {
                onLineClick({
                  filePath: filename,
                  lineNumber,
                  lineType,
                  lineContent,
                });
              };

              lineNumberEl.addEventListener('click', handleClick);
              cleanupFns.push(() => lineNumberEl.removeEventListener('click', handleClick));
            }
          }
        });
      }

      // Add comment count indicators
      if (lineCommentCounts && lineCommentCounts.size > 0) {
        const lineNumbers = containerRef.current.querySelectorAll('.d2h-code-side-linenumber');
        lineNumbers.forEach((lineNumEl) => {
          const lineNumText = lineNumEl.textContent?.trim();
          const lineNumber = lineNumText ? parseInt(lineNumText, 10) : null;

          if (lineNumber && !isNaN(lineNumber)) {
            const commentCount = lineCommentCounts.get(lineNumber);
            if (commentCount && commentCount > 0) {
              // Add comment indicator badge
              const badge = document.createElement('span');
              badge.className = 'line-comment-badge';
              badge.textContent = commentCount.toString();
              badge.title = `${commentCount} comment${commentCount > 1 ? 's' : ''}`;
              lineNumEl.appendChild(badge);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error rendering diff:', error);

      // Show error message
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="p-4 rounded-lg border border-destructive bg-destructive/10">
            <p class="text-sm text-destructive">
              Failed to render diff for ${filename}
            </p>
          </div>
        `;
      }
    }

    // Cleanup event listeners on unmount or re-render
    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [patch, filename, onLineClick, lineCommentCounts, viewMode]);

  // Debounced scroll function - only scrolls if element is out of viewport
  const debouncedScrollRef = useRef<((element: HTMLElement) => void) | null>(null);

  // Initialize debounced scroll on mount
  useEffect(() => {
    debouncedScrollRef.current = debounce((element: HTMLElement) => {
      // Only scroll if element is not already visible
      if (!isElementInViewport(element)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // 100ms debounce for rapid navigation
  }, []);

  // Effect to highlight focused line
  useEffect(() => {
    if (!containerRef.current || !isFocusedFile || focusedLine === null || focusedLine === undefined) {
      // Remove any existing focus highlights
      const existing = containerRef.current?.querySelectorAll('.line-focused');
      existing?.forEach((el) => el.classList.remove('line-focused'));
      return;
    }

    // Remove existing focus highlights
    const existing = containerRef.current.querySelectorAll('.line-focused');
    existing.forEach((el) => el.classList.remove('line-focused'));

    // Find and highlight the focused line
    const lineNumbers = containerRef.current.querySelectorAll('.d2h-code-side-linenumber');
    lineNumbers.forEach((lineNumEl) => {
      const lineNumText = lineNumEl.textContent?.trim();
      const lineNumber = lineNumText ? parseInt(lineNumText, 10) : null;

      if (lineNumber === focusedLine) {
        // Highlight the entire row
        const parentRow = lineNumEl.closest('tr') as HTMLElement | null;
        if (parentRow) {
          parentRow.classList.add('line-focused');
          // Smart scroll: debounced and only if out of viewport
          if (debouncedScrollRef.current) {
            debouncedScrollRef.current(parentRow);
          }
        }
      }
    });
  }, [focusedLine, isFocusedFile]);

  // Handle empty patch
  if (!patch || patch.trim() === '') {
    return (
      <div className="p-8 text-center rounded-lg border bg-muted">
        <p className="text-sm text-muted-foreground">
          No changes in {filename}
        </p>
      </div>
    );
  }

  return (
    <div className={`diff-viewer-wrapper ${isFocusedFile ? 'file-focused' : ''} ${className}`}>
      {/* Filename header */}
      <div className={`px-4 py-2 border-b ${isFocusedFile ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-muted/50'}`}>
        <h3 className="text-sm font-mono font-medium">{filename}</h3>
      </div>

      {/* Diff content */}
      <div
        ref={containerRef}
        className="diff-content overflow-x-auto"
        data-testid="diff-viewer"
      />
    </div>
  );
}
