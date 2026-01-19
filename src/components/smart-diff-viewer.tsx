"use client";

import { useMemo } from "react";
import { DiffViewer, type DiffViewerProps } from "./diff-viewer";
import { VirtualizedDiffViewer } from "./virtualized-diff-viewer";
import { shouldVirtualize } from "@/lib/utils/diff-parser";

// Threshold for when to switch to virtualized view
const VIRTUALIZATION_THRESHOLD = 500;

/**
 * SmartDiffViewer - Automatically chooses the best diff viewer based on diff size
 *
 * Features:
 * - Uses regular diff2html viewer for small diffs (better syntax highlighting)
 * - Uses virtualized viewer for large diffs (500+ lines) for performance
 * - Maintains same API as DiffViewer
 */
export function SmartDiffViewer(props: DiffViewerProps) {
  const { patch } = props;

  // Determine if we should use virtualization
  const useVirtualization = useMemo(() => {
    return shouldVirtualize(patch, VIRTUALIZATION_THRESHOLD);
  }, [patch]);

  // Choose the appropriate viewer
  if (useVirtualization) {
    return <VirtualizedDiffViewer {...props} />;
  }

  return <DiffViewer {...props} />;
}

// Re-export types for convenience
export type { DiffViewerProps, LineClickInfo, DiffViewMode } from "./diff-viewer";
