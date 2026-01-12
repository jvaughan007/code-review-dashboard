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

export interface DiffViewerProps {
  patch: string;
  filename: string;
  className?: string;
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
export function DiffViewer({ patch, filename, className = '' }: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !patch) return;

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
  }, [patch, filename]);

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
          @apply text-muted-foreground bg-muted/30;
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
