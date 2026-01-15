"use client";

import { useState, useEffect } from "react";
import {
  Keyboard,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  useShortcutsStore,
  type Modifier,
} from "@/lib/stores/shortcuts-store";

interface KeyboardShortcutsSettingsProps {
  className?: string;
}

/**
 * KeyboardShortcutsSettings - Configure keyboard shortcuts
 *
 * Features:
 * - View all shortcuts with formatted keys
 * - Recording mode to capture new key combinations
 * - Conflict detection and warnings
 * - Reset individual or all shortcuts
 */
export function KeyboardShortcutsSettings({
  className = "",
}: KeyboardShortcutsSettingsProps) {
  const {
    getAllShortcuts,
    getConflicts,
    formatShortcut,
    startRecording,
    stopRecording,
    recordShortcut,
    resetToDefaults,
    resetSingleShortcut,
    isRecording,
    recordingAction,
  } = useShortcutsStore();

  const shortcuts = getAllShortcuts();
  const conflicts = getConflicts();

  // Handle keydown during recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier-only presses
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
        return;
      }

      // Build modifiers array
      const modifiers: Modifier[] = [];
      if (e.ctrlKey) modifiers.push("ctrl");
      if (e.shiftKey) modifiers.push("shift");
      if (e.altKey) modifiers.push("alt");
      if (e.metaKey) modifiers.push("meta");

      // Record the shortcut
      recordShortcut({
        key: e.key,
        modifiers,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, recordShortcut]);

  // Cancel recording on Escape
  useEffect(() => {
    if (!isRecording) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleEscape, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleEscape, { capture: true });
  }, [isRecording, stopRecording]);

  // Group shortcuts by category
  const categories = {
    navigation: ["nextFile", "prevFile", "nextComment", "prevComment"],
    comments: ["addComment", "submitComment", "cancelComment"],
    files: ["toggleFileTree", "markFileReviewed", "expandAllFiles", "collapseAllFiles"],
    other: ["focusSearch"],
  };

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    comments: "Comments",
    files: "Files",
    other: "Other",
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="text-gray-500 dark:text-gray-400" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-sm text-gray-600 dark:text-gray-400
            hover:text-gray-900 dark:hover:text-gray-100
            hover:bg-gray-100 dark:hover:bg-gray-800
            rounded-lg transition-colors
          "
          title="Reset all to defaults"
        >
          <RotateCcw size={14} />
          Reset All
        </button>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle
            size={16}
            className="mt-0.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
          />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Shortcut Conflicts Detected
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 mt-0.5">
              {conflicts.map((c) => c.actions.join(", ")).join("; ")} share the
              same key binding.
            </p>
          </div>
        </div>
      )}

      {/* Recording overlay */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl max-w-sm mx-4 text-center">
            <Keyboard
              size={48}
              className="mx-auto mb-4 text-blue-500 dark:text-blue-400"
            />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Press a key combination
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Recording shortcut for{" "}
              <span className="font-medium">{recordingAction}</span>
            </p>
            <button
              onClick={stopRecording}
              className="
                mt-4 px-4 py-2
                text-sm text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-gray-100
                hover:bg-gray-100 dark:hover:bg-gray-700
                rounded-lg transition-colors
              "
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Shortcuts by category */}
      {Object.entries(categories).map(([category, actionKeys]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {categoryLabels[category]}
          </h4>
          <div className="space-y-1">
            {shortcuts
              .filter((s) => actionKeys.includes(s.action))
              .map((shortcut) => (
                <ShortcutRow
                  key={shortcut.action}
                  description={shortcut.description}
                  formattedKey={formatShortcut(shortcut.action)}
                  hasConflict={conflicts.some((c) =>
                    c.actions.includes(shortcut.action)
                  )}
                  onEdit={() => startRecording(shortcut.action)}
                  onReset={() => resetSingleShortcut(shortcut.action)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Shortcut row component
interface ShortcutRowProps {
  description: string;
  formattedKey: string;
  hasConflict: boolean;
  onEdit: () => void;
  onReset: () => void;
}

function ShortcutRow({
  description,
  formattedKey,
  hasConflict,
  onEdit,
  onReset,
}: ShortcutRowProps) {
  const [showReset, setShowReset] = useState(false);

  return (
    <div
      className={`
        flex items-center justify-between
        p-2 rounded-lg
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        transition-colors
        ${hasConflict ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}
      `}
      onMouseEnter={() => setShowReset(true)}
      onMouseLeave={() => setShowReset(false)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100">{description}</p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {showReset && (
          <button
            onClick={onReset}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Reset to default"
          >
            <RotateCcw size={14} />
          </button>
        )}
        <button
          onClick={onEdit}
          className={`
            px-2 py-1 rounded
            font-mono text-xs font-medium
            ${
              hasConflict
                ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-colors
          `}
          title="Click to change"
        >
          {formattedKey}
        </button>
      </div>
    </div>
  );
}
