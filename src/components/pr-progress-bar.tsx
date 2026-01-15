"use client";

import { type PRProgress } from "@/lib/stores/progress-store";

interface PRProgressBarProps {
  progress: PRProgress;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * PRProgressBar - Visual indicator of PR review progress
 *
 * Shows:
 * - Green: completed files
 * - Yellow: in-progress files
 * - Gray: not started files
 * - Percentage complete label
 */
export function PRProgressBar({
  progress,
  showLabels = true,
  size = "md",
  className = "",
}: PRProgressBarProps) {
  const { completed, in_progress, not_started, total_files, percentage } =
    progress;

  // Handle edge case: no files
  if (total_files === 0) {
    return (
      <div className={`text-gray-400 dark:text-gray-500 text-sm ${className}`}>
        No files to review
      </div>
    );
  }

  // Calculate widths
  const completedWidth = (completed / total_files) * 100;
  const inProgressWidth = (in_progress / total_files) * 100;
  const notStartedWidth = (not_started / total_files) * 100;

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Progress bar */}
      <div
        className={`
          w-full ${heightClasses[size]}
          bg-gray-200 dark:bg-gray-700
          rounded-full overflow-hidden
          flex
        `}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Review progress: ${percentage}% complete`}
      >
        {/* Completed section */}
        {completed > 0 && (
          <div
            className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
            style={{ width: `${completedWidth}%` }}
          />
        )}

        {/* In progress section */}
        {in_progress > 0 && (
          <div
            className="h-full bg-yellow-500 dark:bg-yellow-400 transition-all duration-300"
            style={{ width: `${inProgressWidth}%` }}
          />
        )}

        {/* Not started section (gray background shows through) */}
        {not_started > 0 && (
          <div
            className="h-full bg-gray-300 dark:bg-gray-600 transition-all duration-300"
            style={{ width: `${notStartedWidth}%` }}
          />
        )}
      </div>

      {/* Labels */}
      {showLabels && (
        <div
          className={`flex items-center justify-between ${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}
        >
          <span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {completed}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              /{total_files}
            </span>{" "}
            files reviewed
          </span>
          <span
            className={`font-medium ${
              percentage === 100
                ? "text-green-600 dark:text-green-400"
                : percentage > 50
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {percentage}%
          </span>
        </div>
      )}

      {/* Legend (optional, for larger sizes) */}
      {size === "lg" && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Reviewed ({completed})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            In progress ({in_progress})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            Not started ({not_started})
          </span>
        </div>
      )}
    </div>
  );
}
