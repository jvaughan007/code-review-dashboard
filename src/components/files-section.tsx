"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Columns2, List } from "lucide-react";
import { SmartDiffViewer, type LineClickInfo, type DiffViewMode } from "./smart-diff-viewer";
import { LineCommentThread } from "./line-comment-thread";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { FileProgressCheckbox } from "./file-progress-checkbox";
import { PRProgressBar } from "./pr-progress-bar";
import { FileSuggestionsSummary } from "./file-suggestions-summary";
import { useComments } from "@/lib/hooks/use-comments";
import { useCommentsStore } from "@/lib/stores/comments-store";
import { useFocusStateStore } from "@/lib/stores/focus-state-store";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useReviewProgress } from "@/lib/hooks/use-review-progress";

interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface FilesSectionProps {
  files: FileChange[];
  prId: string;
}

/**
 * FilesSection - Client component for rendering PR files with line comments
 *
 * Features:
 * - Renders DiffViewer for each file with line comment support
 * - Handles line click to open LineCommentThread modal
 * - Shows comment count badges on lines with comments
 * - Polls for comment updates via useComments hook
 * - Keyboard navigation (j/k for files, arrows for lines)
 * - Focus state visual indicators
 */
export function FilesSection({ files, prId }: FilesSectionProps) {
  const [selectedLine, setSelectedLine] = useState<LineClickInfo | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  // Diff view mode: side-by-side or unified - Sprint 8 Story
  const [viewMode, setViewMode] = useState<DiffViewMode>('side-by-side');
  // Track collapsed state per file - default: first 3 files expanded, rest collapsed
  const [collapsedFiles, setCollapsedFiles] = useState<Set<number>>(() => {
    const collapsed = new Set<number>();
    files.forEach((_, index) => {
      if (index >= 3) collapsed.add(index);
    });
    return collapsed;
  });

  // Toggle file collapsed state
  const toggleFileCollapsed = (index: number) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Collapse/expand all files
  const expandAll = () => setCollapsedFiles(new Set());
  const collapseAll = () => setCollapsedFiles(new Set(files.map((_, i) => i)));

  // Initialize comment polling for this PR
  useComments({
    prId,
    enabled: true,
    pollingInterval: 3000,
  });

  // Get comment summary function from store
  const { getFileCommentSummary } = useCommentsStore();

  // Initialize review progress tracking
  const {
    getFileStatus,
    getPRProgress,
    toggleFileCompleted,
  } = useReviewProgress({
    prId,
    enabled: true,
    pollingInterval: 5000,
  });

  // Get current progress stats
  const progressStats = getPRProgress(files.length);

  // Focus state for keyboard navigation
  const {
    currentFileIndex,
    currentLineNumber,
    setTotalFiles,
    nextFile,
    prevFile,
    nextLine,
    prevLine,
    setCurrentLine,
  } = useFocusStateStore();

  // Initialize total files count
  useEffect(() => {
    setTotalFiles(files.length);
  }, [files.length, setTotalFiles]);

  // Handle line click - open comment thread modal
  const handleLineClick = (lineInfo: LineClickInfo) => {
    setSelectedLine(lineInfo);
  };

  // Close the comment thread modal
  const handleCloseCommentThread = () => {
    setSelectedLine(null);
  };

  // Open comment on currently focused line
  const handleOpenComment = () => {
    if (currentLineNumber && files[currentFileIndex]) {
      const currentFile = files[currentFileIndex];
      setSelectedLine({
        filePath: currentFile.filename,
        lineNumber: currentLineNumber,
        lineType: "context", // Default to context since we don't know from focus
        lineContent: "", // Will be populated from the modal
      });
    }
  };

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onNextFile: nextFile,
    onPrevFile: prevFile,
    onNextLine: nextLine,
    onPrevLine: prevLine,
    onOpenComment: handleOpenComment,
    onToggleHelp: () => setShowHelp(!showHelp),
    onCancel: () => {
      if (showHelp) {
        setShowHelp(false);
      } else if (selectedLine) {
        setSelectedLine(null);
      } else {
        // Clear line focus
        setCurrentLine(null);
      }
    },
    enabled: true,
  });

  return (
    <>
      {/* Progress bar and controls header */}
      <div className="p-3 border-b bg-muted/30 space-y-3">
        {/* Progress bar */}
        <PRProgressBar progress={progressStats} size="md" />

        {/* File count and controls */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} changed
          </span>
          <div className="flex gap-2">
            {/* View mode toggle - Sprint 8 */}
            <div className="flex rounded-md border overflow-hidden">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`min-h-[44px] px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                aria-pressed={viewMode === 'side-by-side'}
                aria-label="Side-by-side view"
                title="Side-by-side view"
              >
                <Columns2 className="h-4 w-4" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`min-h-[44px] px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors border-l ${
                  viewMode === 'unified'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                aria-pressed={viewMode === 'unified'}
                aria-label="Unified view"
                title="Unified view"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Unified</span>
              </button>
            </div>
            <button
              onClick={expandAll}
              className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-md border hover:bg-muted transition-colors"
              aria-label="Expand all files"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium rounded-md border hover:bg-muted transition-colors"
              aria-label="Collapse all files"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {files.map((file, index) => {
          const isCollapsed = collapsedFiles.has(index);
          const isFocused = currentFileIndex === index;

          return (
            <div key={index} className={`${isFocused ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}>
              {/* File header - Touch friendly tap target */}
              <div className="flex items-center min-h-[44px] p-3 sm:p-4 gap-2 hover:bg-muted/50 transition-colors">
                {/* Collapse toggle button */}
                <button
                  onClick={() => toggleFileCollapsed(index)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
                  aria-expanded={!isCollapsed}
                  aria-controls={`file-${index}-content`}
                  aria-label={isCollapsed ? "Expand file" : "Collapse file"}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {/* File info - Clickable to toggle collapse */}
                <button
                  onClick={() => toggleFileCollapsed(index)}
                  className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 text-left"
                >
                  <span className="font-mono text-sm truncate">{file.filename}</span>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm flex-shrink-0">
                    <span className="text-green-600">+{file.additions}</span>
                    <span className="text-red-600">-{file.deletions}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs hidden sm:inline">
                      {file.status}
                    </span>
                  </div>
                </button>

                {/* Pattern suggestions summary */}
                {file.patch && (
                  <div className="flex-shrink-0">
                    <FileSuggestionsSummary
                      patch={file.patch}
                      filename={file.filename}
                    />
                  </div>
                )}

                {/* Progress checkbox - separate click target */}
                <div className="flex-shrink-0">
                  <FileProgressCheckbox
                    filePath={file.filename}
                    status={getFileStatus(file.filename)}
                    onStatusChange={() => toggleFileCompleted(file.filename)}
                    size="sm"
                  />
                </div>
              </div>

              {/* Diff viewer - Collapsible with horizontal scroll */}
              {!isCollapsed && file.patch && (
                <div
                  id={`file-${index}-content`}
                  className="px-3 sm:px-4 pb-4 overflow-x-auto"
                >
                  <SmartDiffViewer
                    patch={file.patch}
                    filename={file.filename}
                    onLineClick={handleLineClick}
                    lineCommentCounts={getFileCommentSummary(prId, file.filename)}
                    focusedLine={currentFileIndex === index ? currentLineNumber : null}
                    isFocusedFile={currentFileIndex === index}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="p-4 text-center border-t">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">?</kbd> for keyboard shortcuts
          {" • "}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">j</kbd>/<kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">k</kbd> navigate files
          {" • "}
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">c</kbd> comment
        </p>
      </div>

      {/* Line comment thread modal */}
      {selectedLine && (
        <LineCommentThread
          prId={prId}
          lineInfo={selectedLine}
          onClose={handleCloseCommentThread}
        />
      )}

      {/* Keyboard shortcuts help modal */}
      {showHelp && (
        <KeyboardShortcutsHelp
          shortcuts={shortcuts}
          onClose={() => setShowHelp(false)}
        />
      )}
    </>
  );
}
