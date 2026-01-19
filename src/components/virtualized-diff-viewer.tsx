"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { parseDiffPatch, type DiffLine } from "@/lib/utils/diff-parser";
import type { LineClickInfo, DiffViewMode } from "./diff-viewer";

interface VirtualizedDiffViewerProps {
  patch: string;
  filename: string;
  className?: string;
  onLineClick?: (lineInfo: LineClickInfo) => void;
  lineCommentCounts?: Map<number, number>;
  focusedLine?: number | null;
  isFocusedFile?: boolean;
  /** View mode - virtualized viewer always uses unified style */
  viewMode?: DiffViewMode;
}

// Line height in pixels (must match CSS)
const LINE_HEIGHT = 24;
// Overscan for smooth scrolling
const OVERSCAN = 10;

/**
 * VirtualizedDiffLine - Memoized individual diff line component
 */
const VirtualizedDiffLine = memo(function VirtualizedDiffLine({
  line,
  filename,
  onLineClick,
  commentCount,
  isFocused,
}: {
  line: DiffLine;
  filename: string;
  onLineClick?: (lineInfo: LineClickInfo) => void;
  commentCount?: number;
  isFocused: boolean;
}) {
  const handleClick = useCallback(() => {
    if (onLineClick && line.lineNumber !== null && line.type !== "header") {
      onLineClick({
        filePath: filename,
        lineNumber: line.lineNumber,
        lineType: line.type === "addition" ? "addition" : line.type === "deletion" ? "deletion" : "context",
        lineContent: line.content,
      });
    }
  }, [onLineClick, line, filename]);

  // Header lines
  if (line.type === "header") {
    return (
      <div
        className="flex items-center h-6 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 text-xs font-mono"
        style={{ height: LINE_HEIGHT }}
      >
        <span className="select-none">{line.content}</span>
      </div>
    );
  }

  // Get line type styles
  const getLineStyles = () => {
    switch (line.type) {
      case "addition":
        return "bg-green-50 dark:bg-green-900/20";
      case "deletion":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "";
    }
  };

  const getLineNumberStyles = () => {
    switch (line.type) {
      case "addition":
        return "text-green-700 dark:text-green-400";
      case "deletion":
        return "text-red-700 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getPrefix = () => {
    switch (line.type) {
      case "addition":
        return "+";
      case "deletion":
        return "-";
      default:
        return " ";
    }
  };

  return (
    <div
      className={`
        flex items-center h-6 text-sm font-mono
        ${getLineStyles()}
        ${isFocused ? "bg-yellow-100 dark:bg-yellow-900/30" : ""}
      `}
      style={{ height: LINE_HEIGHT }}
    >
      {/* Line number - clickable */}
      <button
        onClick={handleClick}
        className={`
          relative w-12 px-2 text-xs text-right select-none shrink-0
          ${getLineNumberStyles()}
          hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400
          cursor-pointer transition-colors
          ${isFocused ? "bg-yellow-200 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-200" : "bg-muted/30"}
        `}
        disabled={line.lineNumber === null}
        style={{ height: LINE_HEIGHT }}
        aria-label={`Line ${line.lineNumber}${commentCount ? `, ${commentCount} comments` : ""}`}
      >
        {line.newLineNumber || line.oldLineNumber || ""}
        {/* Comment count badge */}
        {commentCount && commentCount > 0 && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center min-w-4 h-4 px-1 text-xs font-medium bg-blue-500 text-white rounded-full">
            {commentCount}
          </span>
        )}
      </button>

      {/* Line content */}
      <div className="flex-1 px-2 overflow-x-auto whitespace-pre">
        <span className={`select-none ${getLineNumberStyles()}`}>{getPrefix()}</span>
        <span>{line.content}</span>
      </div>
    </div>
  );
});

/**
 * VirtualizedDiffViewer - High-performance diff viewer using virtualization
 *
 * Features:
 * - Only renders visible lines (virtualization)
 * - Smooth 60fps scrolling with large diffs
 * - Line click handlers for comments
 * - Focus highlighting for keyboard navigation
 * - Comment count badges
 */
export function VirtualizedDiffViewer({
  patch,
  filename,
  className = "",
  onLineClick,
  lineCommentCounts,
  focusedLine,
  isFocusedFile = false,
}: VirtualizedDiffViewerProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Parse the diff
  const parsedDiff = parseDiffPatch(patch);

  // Virtual list configuration
  const virtualizer = useVirtualizer({
    count: parsedDiff.lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LINE_HEIGHT,
    overscan: OVERSCAN,
  });

  // Scroll to focused line when it changes
  useEffect(() => {
    if (isFocusedFile && focusedLine !== null && focusedLine !== undefined) {
      // Find the index of the focused line
      const lineIndex = parsedDiff.lines.findIndex(
        (line) => line.newLineNumber === focusedLine || line.oldLineNumber === focusedLine
      );

      if (lineIndex !== -1) {
        virtualizer.scrollToIndex(lineIndex, { align: "center", behavior: "smooth" });
      }
    }
  }, [focusedLine, isFocusedFile, parsedDiff.lines, virtualizer]);

  // Handle empty patch
  if (!patch || patch.trim() === "") {
    return (
      <div className="p-8 text-center rounded-lg border bg-muted">
        <p className="text-sm text-muted-foreground">No changes in {filename}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card overflow-hidden ${isFocusedFile ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${className}`}>
      {/* Filename header */}
      <div className={`px-4 py-2 border-b ${isFocusedFile ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted/50"}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-medium truncate">{filename}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-2">
            <span className="text-green-600">+{parsedDiff.additions}</span>
            <span className="text-red-600">-{parsedDiff.deletions}</span>
            <span>{parsedDiff.totalLines} lines</span>
          </div>
        </div>
      </div>

      {/* Virtualized diff content */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: Math.min(parsedDiff.totalLines * LINE_HEIGHT, 600) }}
      >
        <div
          className="relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const line = parsedDiff.lines[virtualRow.index];
            const lineNum = line.newLineNumber || line.oldLineNumber;
            const commentCount = lineNum ? lineCommentCounts?.get(lineNum) : undefined;
            const isFocused = isFocusedFile && (line.newLineNumber === focusedLine || line.oldLineNumber === focusedLine);

            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <VirtualizedDiffLine
                  line={line}
                  filename={filename}
                  onLineClick={onLineClick}
                  commentCount={commentCount}
                  isFocused={isFocused}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance indicator */}
      <div className="px-4 py-1 border-t bg-muted/30 text-xs text-muted-foreground text-center">
        Virtualized view ({parsedDiff.totalLines} lines)
      </div>
    </div>
  );
}
