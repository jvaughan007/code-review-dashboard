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
        style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" style={{ color: '#6b7280' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#000' }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" style={{ color: '#374151' }} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: '#e5e7eb' }}
              >
                <span className="text-sm" style={{ color: '#374151' }}>
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.modifiers?.shift && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        backgroundColor: '#e5e7eb',
                        borderColor: '#d1d5db',
                        color: '#1f2937',
                      }}
                    >
                      Shift
                    </kbd>
                  )}
                  {shortcut.modifiers?.ctrl && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        backgroundColor: '#e5e7eb',
                        borderColor: '#d1d5db',
                        color: '#1f2937',
                      }}
                    >
                      Ctrl
                    </kbd>
                  )}
                  {shortcut.modifiers?.meta && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        backgroundColor: '#e5e7eb',
                        borderColor: '#d1d5db',
                        color: '#1f2937',
                      }}
                    >
                      Cmd
                    </kbd>
                  )}
                  {shortcut.modifiers?.alt && (
                    <kbd
                      className="px-2 py-1 text-xs font-mono rounded border"
                      style={{
                        backgroundColor: '#e5e7eb',
                        borderColor: '#d1d5db',
                        color: '#1f2937',
                      }}
                    >
                      Alt
                    </kbd>
                  )}
                  {(shortcut.modifiers?.shift ||
                    shortcut.modifiers?.ctrl ||
                    shortcut.modifiers?.meta ||
                    shortcut.modifiers?.alt) && (
                    <span style={{ color: '#6b7280' }} className="mx-1">+</span>
                  )}
                  <kbd
                    className="px-2 py-1 text-xs font-mono rounded border min-w-[2rem] text-center"
                    style={{
                      backgroundColor: '#e5e7eb',
                      borderColor: '#d1d5db',
                      color: '#1f2937',
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
          style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
        >
          <p className="text-xs text-center" style={{ color: '#6b7280' }}>
            Press{" "}
            <kbd
              className="px-1.5 py-0.5 text-xs font-mono rounded border"
              style={{
                backgroundColor: '#e5e7eb',
                borderColor: '#d1d5db',
                color: '#1f2937',
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
