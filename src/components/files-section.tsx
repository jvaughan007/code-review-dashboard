"use client";

import { useState, useEffect } from "react";
import { DiffViewer, type LineClickInfo } from "./diff-viewer";
import { LineCommentThread } from "./line-comment-thread";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { useComments } from "@/lib/hooks/use-comments";
import { useCommentsStore } from "@/lib/stores/comments-store";
import { useFocusStateStore } from "@/lib/stores/focus-state-store";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

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

  // Initialize comment polling for this PR
  useComments({
    prId,
    enabled: true,
    pollingInterval: 3000,
  });

  // Get comment summary function from store
  const { getFileCommentSummary } = useCommentsStore();

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
      <div className="divide-y">
        {files.map((file, index) => (
          <div key={index} className="p-4">
            {/* File header */}
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-sm">{file.filename}</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-600">+{file.additions}</span>
                <span className="text-red-600">-{file.deletions}</span>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  {file.status}
                </span>
              </div>
            </div>

            {/* Diff viewer with line comment and focus support */}
            {file.patch && (
              <div className="mt-3">
                <DiffViewer
                  patch={file.patch}
                  filename={file.filename}
                  onLineClick={handleLineClick}
                  lineCommentCounts={getFileCommentSummary(prId, file.filename)}
                  focusedLine={currentFileIndex === index ? currentLineNumber : null}
                  isFocusedFile={currentFileIndex === index}
                />
              </div>
            )}
          </div>
        ))}
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
