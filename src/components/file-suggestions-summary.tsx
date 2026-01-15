"use client";

import { useMemo } from "react";
import { parseDiffPatch } from "@/lib/utils/diff-parser";
import { usePatternSuggestions } from "@/lib/hooks/use-pattern-suggestions";
import { SuggestionSummary, SuggestionBadge } from "./suggestion-badge";
import type { DiffLine as PatternDiffLine } from "@/lib/patterns/engine";

interface FileSuggestionsSummaryProps {
  patch: string;
  filename: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * FileSuggestionsSummary - Analyzes a file's diff and shows pattern suggestions
 *
 * Features:
 * - Parses diff patch and runs pattern analysis
 * - Shows compact summary (counts by severity)
 * - Optional detailed view with full suggestions
 */
export function FileSuggestionsSummary({
  patch,
  filename,
  showDetails = false,
  className = "",
}: FileSuggestionsSummaryProps) {
  // Parse the diff into lines
  const diffLines = useMemo(() => {
    const parsed = parseDiffPatch(patch);
    // Convert to pattern engine's DiffLine format
    return parsed.lines
      .filter((line) => line.type !== "header")
      .map((line): PatternDiffLine => ({
        type: line.type as "addition" | "deletion" | "context",
        lineNumber: line.lineNumber ?? 0,
        content: line.content,
      }));
  }, [patch]);

  // Detect language from filename
  const language = useMemo(() => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      go: "go",
      java: "java",
      rb: "ruby",
      rs: "rust",
    };
    return langMap[ext] || ext;
  }, [filename]);

  // Run pattern analysis
  const { suggestions, severityCounts, isAnalyzing } = usePatternSuggestions({
    code: patch, // Full patch as code (pattern engine uses diffLines)
    diffLines,
    language,
    filePath: filename,
    enabled: true,
  });

  // Don't show anything if no suggestions
  if (severityCounts.total === 0 && !isAnalyzing) {
    return null;
  }

  // Loading state
  if (isAnalyzing) {
    return (
      <span className={`text-xs text-muted-foreground ${className}`}>
        Analyzing...
      </span>
    );
  }

  // Show detailed view or summary
  if (showDetails && suggestions.length > 0) {
    return (
      <SuggestionBadge
        suggestions={suggestions}
        compact={false}
        className={className}
      />
    );
  }

  return <SuggestionSummary counts={severityCounts} className={className} />;
}
