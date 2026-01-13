import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

/**
 * Keyboard Shortcuts Hook Tests
 *
 * Tests the keyboard shortcuts hook for navigation and actions
 * in the PR diff viewer.
 */

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    // Reset document.activeElement mock
    vi.spyOn(document, "activeElement", "get").mockReturnValue(document.body);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("shortcuts list", () => {
    it("should return list of available shortcuts", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.shortcuts).toBeDefined();
      expect(result.current.shortcuts.length).toBeGreaterThan(0);
    });

    it("should include navigation shortcuts", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      const shortcuts = result.current.shortcuts;
      const keys = shortcuts.map((s) => s.key);

      expect(keys).toContain("j");
      expect(keys).toContain("k");
    });

    it("should include comment shortcuts", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      const shortcuts = result.current.shortcuts;
      const keys = shortcuts.map((s) => s.key);

      expect(keys).toContain("c");
      expect(keys).toContain("r");
    });

    it("should include help shortcut", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      const shortcuts = result.current.shortcuts;
      const helpShortcut = shortcuts.find((s) => s.key === "?");

      expect(helpShortcut).toBeDefined();
      expect(helpShortcut?.modifiers?.shift).toBe(true);
    });
  });

  describe("isTyping detection", () => {
    it("should return false when focused on body", () => {
      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.isTyping()).toBe(false);
    });

    it("should return true when focused on input", () => {
      const input = document.createElement("input");
      vi.spyOn(document, "activeElement", "get").mockReturnValue(input);

      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.isTyping()).toBe(true);
    });

    it("should return true when focused on textarea", () => {
      const textarea = document.createElement("textarea");
      vi.spyOn(document, "activeElement", "get").mockReturnValue(textarea);

      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.isTyping()).toBe(true);
    });

    it("should return true when focused on contenteditable", () => {
      const div = document.createElement("div");
      div.setAttribute("contenteditable", "true");
      vi.spyOn(document, "activeElement", "get").mockReturnValue(div);

      const { result } = renderHook(() => useKeyboardShortcuts());

      expect(result.current.isTyping()).toBe(true);
    });
  });

  describe("key handlers", () => {
    it("should call onNextFile when j is pressed", () => {
      const onNextFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile }));

      // Simulate keydown event
      const event = new KeyboardEvent("keydown", { key: "j" });
      document.dispatchEvent(event);

      expect(onNextFile).toHaveBeenCalledTimes(1);
    });

    it("should call onPrevFile when k is pressed", () => {
      const onPrevFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onPrevFile }));

      const event = new KeyboardEvent("keydown", { key: "k" });
      document.dispatchEvent(event);

      expect(onPrevFile).toHaveBeenCalledTimes(1);
    });

    it("should call onOpenComment when c is pressed", () => {
      const onOpenComment = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onOpenComment }));

      const event = new KeyboardEvent("keydown", { key: "c" });
      document.dispatchEvent(event);

      expect(onOpenComment).toHaveBeenCalledTimes(1);
    });

    it("should call onReply when r is pressed", () => {
      const onReply = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onReply }));

      const event = new KeyboardEvent("keydown", { key: "r" });
      document.dispatchEvent(event);

      expect(onReply).toHaveBeenCalledTimes(1);
    });

    it("should call onToggleHelp when ? is pressed", () => {
      const onToggleHelp = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onToggleHelp }));

      const event = new KeyboardEvent("keydown", { key: "?" });
      document.dispatchEvent(event);

      expect(onToggleHelp).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when Escape is pressed", () => {
      const onCancel = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onCancel }));

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled state", () => {
    it("should not call handlers when disabled", () => {
      const onNextFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile, enabled: false }));

      const event = new KeyboardEvent("keydown", { key: "j" });
      document.dispatchEvent(event);

      expect(onNextFile).not.toHaveBeenCalled();
    });

    it("should not call handlers when typing (except Escape)", () => {
      const input = document.createElement("input");
      vi.spyOn(document, "activeElement", "get").mockReturnValue(input);

      const onNextFile = vi.fn();
      const onCancel = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile, onCancel }));

      // j should not work when typing
      const jEvent = new KeyboardEvent("keydown", { key: "j" });
      document.dispatchEvent(jEvent);
      expect(onNextFile).not.toHaveBeenCalled();

      // Escape should still work
      const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escEvent);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("modifier keys", () => {
    it("should not trigger shortcuts when Ctrl is pressed", () => {
      const onNextFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile }));

      const event = new KeyboardEvent("keydown", { key: "j", ctrlKey: true });
      document.dispatchEvent(event);

      expect(onNextFile).not.toHaveBeenCalled();
    });

    it("should not trigger shortcuts when Meta is pressed", () => {
      const onNextFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile }));

      const event = new KeyboardEvent("keydown", { key: "j", metaKey: true });
      document.dispatchEvent(event);

      expect(onNextFile).not.toHaveBeenCalled();
    });

    it("should not trigger shortcuts when Alt is pressed", () => {
      const onNextFile = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onNextFile }));

      const event = new KeyboardEvent("keydown", { key: "j", altKey: true });
      document.dispatchEvent(event);

      expect(onNextFile).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const onNextFile = vi.fn();
      const { unmount } = renderHook(() => useKeyboardShortcuts({ onNextFile }));

      unmount();

      const event = new KeyboardEvent("keydown", { key: "j" });
      document.dispatchEvent(event);

      expect(onNextFile).not.toHaveBeenCalled();
    });
  });
});
