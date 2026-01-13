import { describe, it, expect, beforeEach } from "vitest";
import { useFocusStateStore } from "./focus-state-store";

/**
 * Focus State Store Tests
 *
 * Tests keyboard navigation state management including
 * file/line tracking and bounds checking.
 */

describe("Focus State Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useFocusStateStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have default values", () => {
      const state = useFocusStateStore.getState();

      expect(state.currentFileIndex).toBe(0);
      expect(state.currentLineNumber).toBeNull();
      expect(state.totalFiles).toBe(0);
      expect(state.isEnabled).toBe(true);
    });
  });

  describe("setCurrentFile", () => {
    it("should set current file index", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(2);

      expect(useFocusStateStore.getState().currentFileIndex).toBe(2);
    });

    it("should clamp to valid range", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(3);
      store.setCurrentFile(10);

      expect(useFocusStateStore.getState().currentFileIndex).toBe(2);
    });

    it("should not go below 0", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(3);
      store.setCurrentFile(-5);

      expect(useFocusStateStore.getState().currentFileIndex).toBe(0);
    });

    it("should reset line number when changing file", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentLine(10);
      store.setCurrentFile(2);

      expect(useFocusStateStore.getState().currentLineNumber).toBeNull();
    });
  });

  describe("setCurrentLine", () => {
    it("should set current line number", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(42);

      expect(useFocusStateStore.getState().currentLineNumber).toBe(42);
    });

    it("should allow null to clear line", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(42);
      store.setCurrentLine(null);

      expect(useFocusStateStore.getState().currentLineNumber).toBeNull();
    });
  });

  describe("setTotalFiles", () => {
    it("should set total files count", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(10);

      expect(useFocusStateStore.getState().totalFiles).toBe(10);
    });

    it("should clamp current index if out of bounds", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(10);
      store.setCurrentFile(8);
      store.setTotalFiles(5);

      expect(useFocusStateStore.getState().currentFileIndex).toBe(4);
    });
  });

  describe("nextFile", () => {
    it("should increment file index", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(0);
      store.nextFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(1);
    });

    it("should not exceed total files", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(3);
      store.setCurrentFile(2);
      store.nextFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(2);
    });

    it("should reset line number", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentLine(10);
      store.nextFile();

      expect(useFocusStateStore.getState().currentLineNumber).toBeNull();
    });

    it("should not navigate when disabled", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(0);
      store.setEnabled(false);
      store.nextFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(0);
    });

    it("should not navigate when no files", () => {
      const store = useFocusStateStore.getState();
      store.nextFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(0);
    });
  });

  describe("prevFile", () => {
    it("should decrement file index", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(3);
      store.prevFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(2);
    });

    it("should not go below 0", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(3);
      store.setCurrentFile(0);
      store.prevFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(0);
    });

    it("should reset line number", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(3);
      store.setCurrentLine(10);
      store.prevFile();

      expect(useFocusStateStore.getState().currentLineNumber).toBeNull();
    });

    it("should not navigate when disabled", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(5);
      store.setCurrentFile(3);
      store.setEnabled(false);
      store.prevFile();

      expect(useFocusStateStore.getState().currentFileIndex).toBe(3);
    });
  });

  describe("nextLine", () => {
    it("should increment line number", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(5);
      store.nextLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(6);
    });

    it("should start at line 1 if no line selected", () => {
      const store = useFocusStateStore.getState();
      store.nextLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(1);
    });

    it("should not navigate when disabled", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(5);
      store.setEnabled(false);
      store.nextLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(5);
    });
  });

  describe("prevLine", () => {
    it("should decrement line number", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(5);
      store.prevLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(4);
    });

    it("should not go below 1", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(1);
      store.prevLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(1);
    });

    it("should start at line 1 if no line selected", () => {
      const store = useFocusStateStore.getState();
      store.prevLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(1);
    });

    it("should not navigate when disabled", () => {
      const store = useFocusStateStore.getState();
      store.setCurrentLine(5);
      store.setEnabled(false);
      store.prevLine();

      expect(useFocusStateStore.getState().currentLineNumber).toBe(5);
    });
  });

  describe("setEnabled", () => {
    it("should enable/disable navigation", () => {
      const store = useFocusStateStore.getState();
      store.setEnabled(false);

      expect(useFocusStateStore.getState().isEnabled).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const store = useFocusStateStore.getState();
      store.setTotalFiles(10);
      store.setCurrentFile(5);
      store.setCurrentLine(20);
      store.setEnabled(false);

      store.reset();

      const state = useFocusStateStore.getState();
      expect(state.currentFileIndex).toBe(0);
      expect(state.currentLineNumber).toBeNull();
      expect(state.totalFiles).toBe(0);
      expect(state.isEnabled).toBe(true);
    });
  });
});
