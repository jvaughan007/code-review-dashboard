"use client";

import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  description: string;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

export interface UseKeyboardShortcutsOptions {
  /** Navigate to previous file */
  onPrevFile?: () => void;
  /** Navigate to next file */
  onNextFile?: () => void;
  /** Open comment on current line */
  onOpenComment?: () => void;
  /** Reply to focused comment */
  onReply?: () => void;
  /** Toggle help overlay */
  onToggleHelp?: () => void;
  /** Navigate to previous line */
  onPrevLine?: () => void;
  /** Navigate to next line */
  onNextLine?: () => void;
  /** Submit focused form */
  onSubmit?: () => void;
  /** Cancel/close current modal */
  onCancel?: () => void;
  /** Whether keyboard shortcuts are enabled */
  enabled?: boolean;
}

/**
 * Keyboard shortcuts for navigating and interacting with PRs
 *
 * Default shortcuts:
 * - j: Next file
 * - k: Previous file
 * - c: Open comment on line
 * - r: Reply to comment
 * - ?: Toggle help overlay
 * - Arrow Up/Down: Navigate lines
 * - Enter: Submit form
 * - Escape: Close modal/cancel
 *
 * Shortcuts are disabled when:
 * - Focus is in a text input/textarea
 * - A modal is open (except Escape)
 */
export function useKeyboardShortcuts({
  onPrevFile,
  onNextFile,
  onOpenComment,
  onReply,
  onToggleHelp,
  onPrevLine,
  onNextLine,
  onSubmit,
  onCancel,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}) {
  const lastKeyTime = useRef<number>(0);
  const debounceMs = 100; // Prevent rapid key repeats

  // Check if user is currently typing in an input
  const isTyping = useCallback((): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toLowerCase();
    const isInput = tagName === "input" || tagName === "textarea";
    const isEditable = activeElement.getAttribute("contenteditable") === "true";

    return isInput || isEditable;
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;

      // Escape always works immediately (for closing modals) - no debounce
      if (key === "escape" && onCancel) {
        event.preventDefault();
        onCancel();
        return;
      }

      // Debounce rapid key presses (except Escape which was handled above)
      const now = Date.now();
      if (now - lastKeyTime.current < debounceMs) return;
      lastKeyTime.current = now;

      // Skip other shortcuts when typing (except Escape)
      if (isTyping()) {
        // Allow Shift+Enter for submit in text areas if onSubmit is defined
        if (key === "enter" && event.shiftKey && onSubmit) {
          // Don't prevent - let the form handle it
        }
        return;
      }

      // Don't trigger shortcuts with modifier keys (except for ? which needs Shift)
      if (hasModifier) return;

      switch (key) {
        case "j":
          if (onNextFile) {
            event.preventDefault();
            onNextFile();
          }
          break;

        case "k":
          if (onPrevFile) {
            event.preventDefault();
            onPrevFile();
          }
          break;

        case "c":
          if (onOpenComment) {
            event.preventDefault();
            onOpenComment();
          }
          break;

        case "r":
          if (onReply) {
            event.preventDefault();
            onReply();
          }
          break;

        case "?":
          if (onToggleHelp) {
            event.preventDefault();
            onToggleHelp();
          }
          break;

        case "arrowup":
          if (onPrevLine) {
            event.preventDefault();
            onPrevLine();
          }
          break;

        case "arrowdown":
          if (onNextLine) {
            event.preventDefault();
            onNextLine();
          }
          break;

        case "enter":
          if (onSubmit) {
            event.preventDefault();
            onSubmit();
          }
          break;
      }
    },
    [
      enabled,
      isTyping,
      onPrevFile,
      onNextFile,
      onOpenComment,
      onReply,
      onToggleHelp,
      onPrevLine,
      onNextLine,
      onSubmit,
      onCancel,
    ]
  );

  // Attach event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Return list of available shortcuts for help display
  const shortcuts: KeyboardShortcut[] = [
    { key: "j", description: "Next file" },
    { key: "k", description: "Previous file" },
    { key: "c", description: "Comment on line" },
    { key: "r", description: "Reply to comment" },
    { key: "?", description: "Show keyboard shortcuts", modifiers: { shift: true } },
    { key: "\u2191", description: "Previous line" }, // ↑
    { key: "\u2193", description: "Next line" }, // ↓
    { key: "Enter", description: "Submit" },
    { key: "Esc", description: "Cancel / Close" },
  ];

  return {
    shortcuts,
    isTyping,
  };
}
