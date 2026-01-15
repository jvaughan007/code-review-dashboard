"use client";

import { useState, useCallback } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { type ReviewStatus } from "@/lib/stores/progress-store";

interface FileProgressCheckboxProps {
  filePath: string;
  status: ReviewStatus;
  onStatusChange: (status: ReviewStatus) => Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md";
}

/**
 * FileProgressCheckbox - Toggle file review status
 *
 * Visual states:
 * - not_started: empty circle
 * - in_progress: half-filled circle (outline)
 * - completed: filled checkmark
 *
 * Click behavior:
 * - not_started → completed
 * - in_progress → completed
 * - completed → not_started
 */
export function FileProgressCheckbox({
  filePath,
  status,
  onStatusChange,
  disabled = false,
  size = "md",
}: FileProgressCheckboxProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent file expand/collapse

      if (disabled || isUpdating) return;

      const newStatus: ReviewStatus =
        status === "completed" ? "not_started" : "completed";

      setIsUpdating(true);
      try {
        await onStatusChange(newStatus);
      } finally {
        setIsUpdating(false);
      }
    },
    [status, onStatusChange, disabled, isUpdating]
  );

  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const iconSize = size === "sm" ? 12 : 16;

  // Determine visual appearance
  const getIcon = () => {
    if (isUpdating) {
      return (
        <Loader2
          size={iconSize}
          className="animate-spin text-gray-400 dark:text-gray-500"
        />
      );
    }

    switch (status) {
      case "completed":
        return (
          <div
            className={`${sizeClasses} rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center`}
          >
            <Check size={iconSize - 4} className="text-white" strokeWidth={3} />
          </div>
        );
      case "in_progress":
        return (
          <div
            className={`${sizeClasses} rounded-full border-2 border-yellow-500 dark:border-yellow-400 flex items-center justify-center`}
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
          </div>
        );
      case "not_started":
      default:
        return (
          <Circle
            size={iconSize}
            className="text-gray-300 dark:text-gray-600"
          />
        );
    }
  };

  const getLabel = () => {
    switch (status) {
      case "completed":
        return "Reviewed";
      case "in_progress":
        return "In progress";
      case "not_started":
      default:
        return "Not reviewed";
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isUpdating}
      className={`
        flex items-center gap-2
        rounded-md px-2 py-1
        transition-colors duration-150
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        dark:focus:ring-offset-gray-900
      `}
      title={`${getLabel()} - Click to ${status === "completed" ? "reset" : "mark as reviewed"}`}
      aria-label={`${filePath}: ${getLabel()}`}
    >
      {getIcon()}
      <span
        className={`
        text-xs font-medium
        ${status === "completed" ? "text-green-600 dark:text-green-400" : ""}
        ${status === "in_progress" ? "text-yellow-600 dark:text-yellow-400" : ""}
        ${status === "not_started" ? "text-gray-400 dark:text-gray-500" : ""}
      `}
      >
        {getLabel()}
      </span>
    </button>
  );
}
