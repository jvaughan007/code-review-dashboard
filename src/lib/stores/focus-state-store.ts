import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Focus State Store - Manages keyboard navigation focus
 *
 * Tracks which file and line is currently focused for keyboard navigation.
 * Uses actual line numbers from diff patches for accurate navigation.
 *
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

  // Available line numbers per file (keyed by file index)
  fileLineNumbers: Map<number, number[]>;

  // Actions
  setCurrentFile: (index: number) => void;
  setCurrentLine: (lineNumber: number | null) => void;
  setTotalFiles: (count: number) => void;
  setEnabled: (enabled: boolean) => void;
  setFileLineNumbers: (fileIndex: number, lineNumbers: number[]) => void;

  // Navigation
  nextFile: () => void;
  prevFile: () => void;
  nextLine: () => void;
  prevLine: () => void;

  // Selectors
  getCurrentFileLineNumbers: () => number[];

  // Reset
  reset: () => void;
}

const initialState = {
  currentFileIndex: 0,
  currentLineNumber: null as number | null,
  totalFiles: 0,
  isEnabled: true,
  fileLineNumbers: new Map<number, number[]>(),
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

      setFileLineNumbers: (fileIndex, lineNumbers) =>
        set(
          (state) => {
            const newMap = new Map(state.fileLineNumbers);
            newMap.set(fileIndex, lineNumbers);
            return { fileLineNumbers: newMap };
          },
          false,
          "setFileLineNumbers"
        ),

      getCurrentFileLineNumbers: () => {
        const { currentFileIndex, fileLineNumbers } = get();
        return fileLineNumbers.get(currentFileIndex) || [];
      },

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
        const { currentLineNumber, isEnabled, currentFileIndex, fileLineNumbers } = get();
        if (!isEnabled) return;

        const availableLines = fileLineNumbers.get(currentFileIndex) || [];

        if (availableLines.length === 0) {
          // Fallback: no line numbers available, just increment
          const nextLine = currentLineNumber === null ? 1 : currentLineNumber + 1;
          set({ currentLineNumber: nextLine }, false, "nextLine");
          return;
        }

        if (currentLineNumber === null) {
          // Start at first available line
          set({ currentLineNumber: availableLines[0] }, false, "nextLine");
          return;
        }

        // Find next line number in the available lines
        const currentIndex = availableLines.indexOf(currentLineNumber);
        if (currentIndex === -1) {
          // Current line not in list, find closest higher line
          const nextLine = availableLines.find((l) => l > currentLineNumber);
          set(
            { currentLineNumber: nextLine || availableLines[availableLines.length - 1] },
            false,
            "nextLine"
          );
        } else if (currentIndex < availableLines.length - 1) {
          // Move to next line
          set({ currentLineNumber: availableLines[currentIndex + 1] }, false, "nextLine");
        }
        // If at last line, stay there
      },

      prevLine: () => {
        const { currentLineNumber, isEnabled, currentFileIndex, fileLineNumbers } = get();
        if (!isEnabled) return;

        const availableLines = fileLineNumbers.get(currentFileIndex) || [];

        if (availableLines.length === 0) {
          // Fallback: no line numbers available
          const prevLine = currentLineNumber === null || currentLineNumber <= 1 ? 1 : currentLineNumber - 1;
          set({ currentLineNumber: prevLine }, false, "prevLine");
          return;
        }

        if (currentLineNumber === null) {
          // Start at first available line
          set({ currentLineNumber: availableLines[0] }, false, "prevLine");
          return;
        }

        // Find previous line number in the available lines
        const currentIndex = availableLines.indexOf(currentLineNumber);
        if (currentIndex === -1) {
          // Current line not in list, find closest lower line
          const prevLine = [...availableLines].reverse().find((l) => l < currentLineNumber);
          set(
            { currentLineNumber: prevLine || availableLines[0] },
            false,
            "prevLine"
          );
        } else if (currentIndex > 0) {
          // Move to previous line
          set({ currentLineNumber: availableLines[currentIndex - 1] }, false, "prevLine");
        }
        // If at first line, stay there
      },

      reset: () => set({ ...initialState, fileLineNumbers: new Map() }, false, "reset"),
    }),
    { name: "FocusStateStore" }
  )
);
