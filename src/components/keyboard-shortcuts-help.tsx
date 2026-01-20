"use client";

import { X, Keyboard } from "lucide-react";
import type { KeyboardShortcut } from "@/lib/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}

/**
 * KeyboardShortcutsHelp - Modal displaying available keyboard shortcuts
 *
 * Features:
 * - Lists all keyboard shortcuts
 * - Shows key and description
 * - Displays modifier keys if any
 * - Closes on Escape or click outside
 */
export function KeyboardShortcutsHelp({
  shortcuts,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-foreground">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.modifiers?.shift && (
                    <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-foreground">
                      Shift
                    </kbd>
                  )}
                  {shortcut.modifiers?.ctrl && (
                    <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-foreground">
                      Ctrl
                    </kbd>
                  )}
                  {shortcut.modifiers?.meta && (
                    <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-foreground">
                      Cmd
                    </kbd>
                  )}
                  {shortcut.modifiers?.alt && (
                    <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-foreground">
                      Alt
                    </kbd>
                  )}
                  {(shortcut.modifiers?.shift ||
                    shortcut.modifiers?.ctrl ||
                    shortcut.modifiers?.meta ||
                    shortcut.modifiers?.alt) && (
                    <span className="text-muted-foreground mx-1">+</span>
                  )}
                  <kbd className="px-2 py-1 text-xs font-mono rounded border border-border bg-muted text-foreground min-w-[2rem] text-center">
                    {shortcut.key}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted rounded-b-lg">
          <p className="text-xs text-center text-muted-foreground">
            Press{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono rounded border border-border bg-secondary text-foreground">
              ?
            </kbd>{" "}
            anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
