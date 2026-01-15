"use client";

import { useState, useEffect, useMemo } from 'react';
import { PatternEngine, type DiffLine, type Suggestion } from '@/lib/patterns/engine';

/**
 * usePatternSuggestions - Runs static pattern analysis on diff content
 *
 * Features:
 * - 100% client-side (zero-cost)
 * - Analyzes only added lines
 * - Groups suggestions by line number
 * - Memoized for performance
 *
 * @param code - Full file content
 * @param diffLines - Parsed diff lines
 * @param language - Programming language
 * @param filePath - File path for exclude patterns
 */

interface UsePatternSuggestionsOptions {
  code: string;
  diffLines: DiffLine[];
  language: string;
  filePath: string;
  enabled?: boolean;
}

interface SuggestionsByLine {
  [lineNumber: number]: Suggestion[];
}

export function usePatternSuggestions({
  code,
  diffLines,
  language,
  filePath,
  enabled = true,
}: UsePatternSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create engine instance (memoized)
  const engine = useMemo(() => new PatternEngine(), []);

  // Run analysis when inputs change
  useEffect(() => {
    if (!enabled || !code || diffLines.length === 0) {
      setSuggestions([]);
      return;
    }

    let isCancelled = false;

    async function analyze() {
      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await engine.analyze(code, diffLines, language, filePath);
        if (!isCancelled) {
          setSuggestions(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Analysis failed'));
          setSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsAnalyzing(false);
        }
      }
    }

    analyze();

    return () => {
      isCancelled = true;
    };
  }, [code, diffLines, language, filePath, enabled, engine]);

  // Group suggestions by line number
  const suggestionsByLine = useMemo<SuggestionsByLine>(() => {
    const byLine: SuggestionsByLine = {};
    for (const suggestion of suggestions) {
      if (!byLine[suggestion.lineNumber]) {
        byLine[suggestion.lineNumber] = [];
      }
      byLine[suggestion.lineNumber].push(suggestion);
    }
    return byLine;
  }, [suggestions]);

  // Get suggestions for a specific line
  const getSuggestionsForLine = (lineNumber: number): Suggestion[] => {
    return suggestionsByLine[lineNumber] || [];
  };

  // Get suggestion counts by severity
  const severityCounts = useMemo(() => {
    return {
      error: suggestions.filter((s) => s.severity === 'error').length,
      warning: suggestions.filter((s) => s.severity === 'warning').length,
      info: suggestions.filter((s) => s.severity === 'info').length,
      total: suggestions.length,
    };
  }, [suggestions]);

  // Check if a specific line has suggestions
  const hasLineSuggestions = (lineNumber: number): boolean => {
    return lineNumber in suggestionsByLine;
  };

  // Get the highest severity for a line
  const getLineSeverity = (lineNumber: number): 'error' | 'warning' | 'info' | null => {
    const lineSuggestions = suggestionsByLine[lineNumber];
    if (!lineSuggestions || lineSuggestions.length === 0) return null;

    if (lineSuggestions.some((s) => s.severity === 'error')) return 'error';
    if (lineSuggestions.some((s) => s.severity === 'warning')) return 'warning';
    return 'info';
  };

  return {
    suggestions,
    suggestionsByLine,
    getSuggestionsForLine,
    hasLineSuggestions,
    getLineSeverity,
    severityCounts,
    isAnalyzing,
    error,
  };
}
