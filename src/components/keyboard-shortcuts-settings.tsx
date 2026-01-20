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
          <Keyboard size={20} style={{ color: 'hsl(var(--foreground))' }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Keyboard Shortcuts
          </h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Reset all to defaults"
        >
          <RotateCcw size={14} />
          Reset All
        </button>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg border"
          style={{
            borderColor: '#eab308',
            backgroundColor: 'hsl(48 96% 89%)',
          }}
        >
          <AlertTriangle
            size={16}
            className="mt-0.5 flex-shrink-0"
            style={{ color: '#a16207' }}
          />
          <div className="text-sm">
            <p className="font-medium" style={{ color: '#713f12' }}>
              Shortcut Conflicts Detected
            </p>
            <p className="mt-0.5" style={{ color: '#854d0e' }}>
              {conflicts.map((c) => c.actions.join(", ")).join("; ")} share the
              same key binding.
            </p>
          </div>
        </div>
      )}

      {/* Recording overlay */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="rounded-xl p-6 shadow-xl max-w-sm mx-4 text-center"
            style={{
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
            }}
          >
            <Keyboard
              size={48}
              className="mx-auto mb-4"
              style={{ color: 'hsl(var(--primary))' }}
            />
            <h4
              className="text-lg font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Press a key combination
            </h4>
            <p
              className="text-sm mt-2"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Recording shortcut for{" "}
              <span
                className="font-medium"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                {recordingAction}
              </span>
            </p>
            <button
              onClick={stopRecording}
              className="mt-4 px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Shortcuts by category */}
      {Object.entries(categories).map(([category, actionKeys]) => (
        <div key={category} className="space-y-2">
          <h4
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--foreground))' }}
          >
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
  const [isHovered, setIsHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg transition-colors"
      style={{
        backgroundColor: hasConflict
          ? 'hsl(48 96% 89%)'
          : isHovered
          ? 'hsl(var(--muted))'
          : 'transparent',
      }}
      onMouseEnter={() => {
        setShowReset(true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setShowReset(false);
        setIsHovered(false);
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {showReset && (
          <button
            onClick={onReset}
            className="p-1"
            style={{
              color: buttonHovered
                ? 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            title="Reset to default"
          >
            <RotateCcw size={14} />
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-2 py-1 rounded font-mono text-xs font-medium transition-colors"
          style={{
            backgroundColor: hasConflict ? '#fef08a' : 'hsl(var(--muted))',
            color: hasConflict ? '#713f12' : 'hsl(var(--foreground))',
          }}
          title="Click to change"
        >
          {formattedKey}
        </button>
      </div>
    </div>
  );
}
