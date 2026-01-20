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
      <div
        className="rounded-lg border shadow-xl max-w-md w-full mx-4"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderColor: 'hsl(var(--border))',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2">
            <Keyboard
              className="h-5 w-5"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors"
            style={{
              color: 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--muted))';
              e.currentTarget.style.color = 'hsl(var(--foreground))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            }}
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
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                <span
                  className="text-sm"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.modifiers?.shift && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Shift
                    </kbd>
                  )}
                  {shortcut.modifiers?.ctrl && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Ctrl
                    </kbd>
                  )}
                  {shortcut.modifiers?.meta && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Cmd
                    </kbd>
                  )}
                  {shortcut.modifiers?.alt && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Alt
                    </kbd>
                  )}
                  {(shortcut.modifiers?.shift ||
                    shortcut.modifiers?.ctrl ||
                    shortcut.modifiers?.meta ||
                    shortcut.modifiers?.alt) && (
                    <span
                      className="mx-1"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      +
                    </span>
                  )}
                  <kbd
                    className="px-2 py-1 text-xs font-mono rounded border min-w-[2rem] text-center"
                    style={{
                      borderColor: 'hsl(var(--border))',
                      backgroundColor: 'hsl(var(--muted))',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t rounded-b-lg"
          style={{
            borderColor: 'hsl(var(--border))',
            backgroundColor: 'hsl(var(--muted))',
          }}
        >
          <p
            className="text-xs text-center"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Press{" "}
            <kbd
              className="px-1.5 py-0.5 text-xs font-mono rounded border"
              style={{
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
              }}
            >
              ?
            </kbd>{" "}
            anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
