"use client";

import { useEffect, useRef } from 'react';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

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

export interface DiffViewerProps {
  patch: string;
  filename: string;
  className?: string;
  /** Callback when a line number is clicked (for line comments) */
  onLineClick?: (lineInfo: LineClickInfo) => void;
  /** Map of line numbers to comment counts (for indicators) */
  lineCommentCounts?: Map<number, number>;
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
}: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !patch) return;

    // Store cleanup functions for event listeners
    const cleanupFns: (() => void)[] = [];

    try {
      // Generate diff HTML using diff2html
      const diffHtml = Diff2Html.html(patch, {
        drawFileList: false,
        matching: 'lines',
        outputFormat: 'side-by-side',
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
  }, [patch, filename, onLineClick, lineCommentCounts]);

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
    <div className={`diff-viewer-wrapper ${className}`}>
      {/* Filename header */}
      <div className="px-4 py-2 border-b bg-muted/50">
        <h3 className="text-sm font-mono font-medium">{filename}</h3>
      </div>

      {/* Diff content */}
      <div
        ref={containerRef}
        className="diff-content overflow-x-auto"
        data-testid="diff-viewer"
      />

      <style jsx global>{`
        /* Custom diff viewer styles */
        .diff-viewer-wrapper {
          @apply rounded-lg border bg-card overflow-hidden;
        }

        .diff-content {
          @apply w-full;
        }

        /* Override diff2html styles for dark mode support */
        .d2h-wrapper {
          @apply bg-transparent;
        }

        .d2h-file-header {
          @apply hidden; /* We show our own header */
        }

        .d2h-code-side-linenumber {
          @apply text-muted-foreground bg-muted/30 relative;
        }

        /* Clickable line numbers for comments */
        .line-number-clickable {
          @apply cursor-pointer transition-colors duration-150;
        }

        .line-number-clickable:hover {
          @apply bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400;
        }

        .line-number-clickable:hover::before {
          content: '+';
          @apply absolute left-1 text-blue-500 font-bold text-xs;
        }

        /* Comment count badge */
        .line-comment-badge {
          @apply absolute right-1 top-1/2 -translate-y-1/2;
          @apply inline-flex items-center justify-center;
          @apply min-w-4 h-4 px-1 text-xs font-medium;
          @apply bg-blue-500 text-white rounded-full;
          @apply cursor-pointer;
        }

        .line-comment-badge:hover {
          @apply bg-blue-600;
        }

        .d2h-code-side-line {
          @apply text-sm font-mono;
        }

        .d2h-ins {
          @apply bg-green-50 dark:bg-green-900/20;
        }

        .d2h-del {
          @apply bg-red-50 dark:bg-red-900/20;
        }

        .d2h-info {
          @apply bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100;
        }

        /* Ensure diff table is responsive */
        .d2h-diff-table {
          @apply w-full;
        }

        /* Syntax highlighting overrides */
        .token.comment {
          @apply text-gray-500;
        }

        .token.keyword {
          @apply text-purple-600 dark:text-purple-400;
        }

        .token.string {
          @apply text-green-600 dark:text-green-400;
        }

        .token.function {
          @apply text-blue-600 dark:text-blue-400;
        }

        .token.number {
          @apply text-orange-600 dark:text-orange-400;
        }
      `}</style>
    </div>
  );
}
