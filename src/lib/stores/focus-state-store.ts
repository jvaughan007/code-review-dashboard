import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Focus State Store - Manages keyboard navigation focus
 *
 * Tracks which file and line is currently focused for keyboard navigation.
 * Used by:
 * - FilesSection to highlight current file
 * - DiffViewer to highlight current line
 * - useKeyboardShortcuts to navigate
 */

interface FocusState {
  // Current state
  currentFileIndex: number;
  currentLineNumber: number | null;
  totalFiles: number;
  isEnabled: boolean;

  // Actions
  setCurrentFile: (index: number) => void;
  setCurrentLine: (lineNumber: number | null) => void;
  setTotalFiles: (count: number) => void;
  setEnabled: (enabled: boolean) => void;

  // Navigation
  nextFile: () => void;
  prevFile: () => void;
  nextLine: () => void;
  prevLine: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentFileIndex: 0,
  currentLineNumber: null,
  totalFiles: 0,
  isEnabled: true,
};

export const useFocusStateStore = create<FocusState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentFile: (index) =>
        set(
          (state) => ({
            currentFileIndex: Math.max(0, Math.min(index, state.totalFiles - 1)),
            currentLineNumber: null, // Reset line when changing file
          }),
          false,
          "setCurrentFile"
        ),

      setCurrentLine: (lineNumber) =>
        set({ currentLineNumber: lineNumber }, false, "setCurrentLine"),

      setTotalFiles: (count) =>
        set(
          (state) => ({
            totalFiles: count,
            // Clamp current index if out of bounds
            currentFileIndex: Math.min(state.currentFileIndex, Math.max(0, count - 1)),
          }),
          false,
          "setTotalFiles"
        ),

      setEnabled: (enabled) =>
        set({ isEnabled: enabled }, false, "setEnabled"),

      nextFile: () => {
        const { currentFileIndex, totalFiles, isEnabled } = get();
        if (!isEnabled || totalFiles === 0) return;

        set(
          {
            currentFileIndex: Math.min(currentFileIndex + 1, totalFiles - 1),
            currentLineNumber: null,
          },
          false,
          "nextFile"
        );
      },

      prevFile: () => {
        const { currentFileIndex, isEnabled } = get();
        if (!isEnabled) return;

        set(
          {
            currentFileIndex: Math.max(currentFileIndex - 1, 0),
            currentLineNumber: null,
          },
          false,
          "prevFile"
        );
      },

      nextLine: () => {
        const { currentLineNumber, isEnabled } = get();
        if (!isEnabled) return;

        // If no line selected, start at line 1
        const nextLine = currentLineNumber === null ? 1 : currentLineNumber + 1;
        set({ currentLineNumber: nextLine }, false, "nextLine");
      },

      prevLine: () => {
        const { currentLineNumber, isEnabled } = get();
        if (!isEnabled) return;

        // If no line selected or at line 1, stay at 1
        const prevLine = currentLineNumber === null || currentLineNumber <= 1 ? 1 : currentLineNumber - 1;
        set({ currentLineNumber: prevLine }, false, "prevLine");
      },

      reset: () => set(initialState, false, "reset"),
    }),
    { name: "FocusStateStore" }
  )
);
