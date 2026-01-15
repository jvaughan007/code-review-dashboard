import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Shortcuts Store - Manages customizable keyboard shortcuts
 *
 * Architecture: localStorage persistence
 * - Shortcuts stored locally for instant access
 * - Recording mode for capturing new key combinations
 * - Conflict detection to prevent duplicate bindings
 *
 * Sprint 7: Keyboard Shortcut Customization
 * - Customizable key bindings for all actions
 * - Real-time conflict detection
 * - Recording mode for easy rebinding
 */

export type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta';

export interface KeyboardShortcut {
  key: string;
  modifiers: Modifier[];
  description: string;
}

export type ShortcutAction =
  | 'nextFile'
  | 'prevFile'
  | 'nextComment'
  | 'prevComment'
  | 'addComment'
  | 'submitComment'
  | 'cancelComment'
  | 'toggleFileTree'
  | 'markFileReviewed'
  | 'expandAllFiles'
  | 'collapseAllFiles'
  | 'focusSearch';

export interface ShortcutConflict {
  key: string;
  modifiers: Modifier[];
  actions: ShortcutAction[];
}

export interface ShortcutWithAction extends KeyboardShortcut {
  action: ShortcutAction;
}

const DEFAULT_SHORTCUTS: Record<ShortcutAction, KeyboardShortcut> = {
  nextFile: { key: 'j', modifiers: [], description: 'Go to next file' },
  prevFile: { key: 'k', modifiers: [], description: 'Go to previous file' },
  nextComment: { key: 'n', modifiers: [], description: 'Go to next comment' },
  prevComment: { key: 'p', modifiers: [], description: 'Go to previous comment' },
  addComment: { key: 'c', modifiers: [], description: 'Add new comment' },
  submitComment: { key: 'Enter', modifiers: ['ctrl'], description: 'Submit comment' },
  cancelComment: { key: 'Escape', modifiers: [], description: 'Cancel comment' },
  toggleFileTree: { key: 'b', modifiers: [], description: 'Toggle file tree' },
  markFileReviewed: { key: 'r', modifiers: [], description: 'Mark file as reviewed' },
  expandAllFiles: { key: 'e', modifiers: ['shift'], description: 'Expand all files' },
  collapseAllFiles: { key: 'w', modifiers: ['shift'], description: 'Collapse all files' },
  focusSearch: { key: '/', modifiers: [], description: 'Focus search' },
};

interface ShortcutsState {
  shortcuts: Record<ShortcutAction, KeyboardShortcut>;
  isRecording: boolean;
  recordingAction: ShortcutAction | null;
  conflicts: ShortcutConflict[];

  // Actions
  updateShortcut: (action: ShortcutAction, shortcut: Omit<KeyboardShortcut, 'description'>) => void;
  startRecording: (action: ShortcutAction) => void;
  stopRecording: () => void;
  recordShortcut: (shortcut: Omit<KeyboardShortcut, 'description'>) => void;
  resetToDefaults: () => void;
  resetSingleShortcut: (action: ShortcutAction) => void;

  // Selectors
  getShortcut: (action: ShortcutAction) => KeyboardShortcut;
  getConflicts: () => ShortcutConflict[];
  formatShortcut: (action: ShortcutAction) => string;
  getAllShortcuts: () => ShortcutWithAction[];
}

function detectConflicts(shortcuts: Record<ShortcutAction, KeyboardShortcut>): ShortcutConflict[] {
  const conflicts: ShortcutConflict[] = [];
  const keyMap = new Map<string, ShortcutAction[]>();

  // Build a map of key+modifiers -> actions
  for (const [action, shortcut] of Object.entries(shortcuts) as [ShortcutAction, KeyboardShortcut][]) {
    const sortedModifiers = [...shortcut.modifiers].sort().join('+');
    const key = `${shortcut.key}:${sortedModifiers}`;

    if (!keyMap.has(key)) {
      keyMap.set(key, []);
    }
    keyMap.get(key)!.push(action);
  }

  // Find conflicts (more than one action per key)
  for (const [keyCombo, actions] of keyMap.entries()) {
    if (actions.length > 1) {
      const [keyPart, modifiersPart] = keyCombo.split(':');
      const modifiers = modifiersPart ? (modifiersPart.split('+') as Modifier[]) : [];
      conflicts.push({
        key: keyPart,
        modifiers,
        actions,
      });
    }
  }

  return conflicts;
}

function formatModifier(mod: Modifier): string {
  const modMap: Record<Modifier, string> = {
    ctrl: 'Ctrl',
    shift: 'Shift',
    alt: 'Alt',
    meta: 'Cmd',
  };
  return modMap[mod];
}

export const useShortcutsStore = create<ShortcutsState>()(
  devtools(
    persist(
      (set, get) => ({
        shortcuts: { ...DEFAULT_SHORTCUTS },
        isRecording: false,
        recordingAction: null,
        conflicts: [],

        updateShortcut: (action, shortcut) =>
          set((state) => {
            const existingDesc = state.shortcuts[action].description;
            const newShortcuts = {
              ...state.shortcuts,
              [action]: {
                ...shortcut,
                description: existingDesc,
              },
            };
            return {
              shortcuts: newShortcuts,
              conflicts: detectConflicts(newShortcuts),
            };
          }),

        startRecording: (action) =>
          set({
            isRecording: true,
            recordingAction: action,
          }),

        stopRecording: () =>
          set({
            isRecording: false,
            recordingAction: null,
          }),

        recordShortcut: (shortcut) =>
          set((state) => {
            if (!state.recordingAction) return state;

            const existingDesc = state.shortcuts[state.recordingAction].description;
            const newShortcuts = {
              ...state.shortcuts,
              [state.recordingAction]: {
                ...shortcut,
                description: existingDesc,
              },
            };

            return {
              shortcuts: newShortcuts,
              isRecording: false,
              recordingAction: null,
              conflicts: detectConflicts(newShortcuts),
            };
          }),

        resetToDefaults: () =>
          set({
            shortcuts: { ...DEFAULT_SHORTCUTS },
            conflicts: [],
          }),

        resetSingleShortcut: (action) =>
          set((state) => {
            const newShortcuts = {
              ...state.shortcuts,
              [action]: { ...DEFAULT_SHORTCUTS[action] },
            };
            return {
              shortcuts: newShortcuts,
              conflicts: detectConflicts(newShortcuts),
            };
          }),

        getShortcut: (action) => get().shortcuts[action],

        getConflicts: () => get().conflicts,

        formatShortcut: (action) => {
          const shortcut = get().shortcuts[action];
          const parts: string[] = [];

          // Add modifiers in order
          const modifierOrder: Modifier[] = ['ctrl', 'shift', 'alt', 'meta'];
          for (const mod of modifierOrder) {
            if (shortcut.modifiers.includes(mod)) {
              parts.push(formatModifier(mod));
            }
          }

          // Add key (uppercase for single letters)
          const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
          parts.push(key);

          return parts.join('+');
        },

        getAllShortcuts: () => {
          const shortcuts = get().shortcuts;
          return Object.entries(shortcuts).map(([action, shortcut]) => ({
            ...shortcut,
            action: action as ShortcutAction,
          }));
        },
      }),
      {
        name: 'shortcuts-store',
        partialize: (state) => ({ shortcuts: state.shortcuts }),
      }
    ),
    { name: 'ShortcutsStore' }
  )
);
