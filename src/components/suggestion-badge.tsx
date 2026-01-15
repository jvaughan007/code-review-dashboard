"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { type Suggestion, type Severity } from "@/lib/patterns/engine";

interface SuggestionBadgeProps {
  suggestions: Suggestion[];
  compact?: boolean;
  className?: string;
}

/**
 * SuggestionBadge - Displays pattern analysis suggestions
 *
 * Modes:
 * - compact: just shows icon with count (for inline diff display)
 * - expanded: shows full details with suggestions
 */
export function SuggestionBadge({
  suggestions,
  compact = true,
  className = "",
}: SuggestionBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (suggestions.length === 0) return null;

  // Get highest severity
  const highestSeverity: Severity = suggestions.some((s) => s.severity === "error")
    ? "error"
    : suggestions.some((s) => s.severity === "warning")
      ? "warning"
      : "info";

  const severityConfig = {
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  };

  const config = severityConfig[highestSeverity];
  const Icon = config.icon;

  // Compact mode: just icon with count
  if (compact) {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          inline-flex items-center gap-1
          px-1.5 py-0.5 rounded
          ${config.bgColor} ${config.textColor}
          hover:opacity-80 transition-opacity
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${className}
        `}
        title={`${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""}`}
        aria-label={`${suggestions.length} code suggestions`}
      >
        <Icon size={12} />
        {suggestions.length > 1 && (
          <span className="text-xs font-medium">{suggestions.length}</span>
        )}
      </button>
    );
  }

  // Expanded mode: full details
  return (
    <div
      className={`
        rounded-lg border ${config.borderColor} ${config.bgColor}
        overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2
          ${config.textColor}
          hover:bg-black/5 dark:hover:bg-white/5
          transition-colors
        `}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span className="font-medium text-sm">
            {suggestions.length} Suggestion{suggestions.length > 1 ? "s" : ""}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Details */}
      {isExpanded && (
        <div className="border-t border-inherit">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.ruleId}-${index}`}
              className={`
                px-3 py-2
                ${index > 0 ? "border-t border-inherit" : ""}
              `}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`
                    text-xs font-medium px-1.5 py-0.5 rounded
                    ${severityConfig[suggestion.severity].bgColor}
                    ${severityConfig[suggestion.severity].textColor}
                  `}
                >
                  {suggestion.severity.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.ruleName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {suggestion.message}
                  </p>
                  {suggestion.suggestion && (
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
                      <span>{suggestion.suggestion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SuggestionSummary - Summary of all suggestions for a file
 */
interface SuggestionSummaryProps {
  counts: {
    error: number;
    warning: number;
    info: number;
    total: number;
  };
  className?: string;
}

export function SuggestionSummary({
  counts,
  className = "",
}: SuggestionSummaryProps) {
  if (counts.total === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {counts.error > 0 && (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <AlertCircle size={12} />
          {counts.error}
        </span>
      )}
      {counts.warning > 0 && (
        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle size={12} />
          {counts.warning}
        </span>
      )}
      {counts.info > 0 && (
        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <Info size={12} />
          {counts.info}
        </span>
      )}
    </div>
  );
}
