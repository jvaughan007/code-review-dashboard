import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isElementInViewport, debounce, smartScrollIntoView } from "./scroll-utils";

describe("scroll-utils", () => {
  describe("isElementInViewport", () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      // Mock window dimensions
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 800,
      });

      // Create mock element
      mockElement = document.createElement("div");
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      document.body.removeChild(mockElement);
    });

    it("should return true when element is fully visible", () => {
      // Mock getBoundingClientRect - element fully visible at top of viewport
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        bottom: 200,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(true);
    });

    it("should return true when at least 50% is visible (default threshold)", () => {
      // Element partially visible - 60% in viewport
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: -40, // 40px above viewport
        bottom: 60, // 60px visible
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: -40,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(true);
    });

    it("should return false when less than 50% is visible", () => {
      // Element mostly above viewport - only 30% visible
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: -70, // 70px above viewport
        bottom: 30, // only 30px visible
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: -70,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(false);
    });

    it("should return false when element is fully above viewport", () => {
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: -200,
        bottom: -100,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: -200,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(false);
    });

    it("should return false when element is fully below viewport", () => {
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 900,
        bottom: 1000,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 900,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(false);
    });

    it("should respect custom threshold", () => {
      // 70% visible, 80% threshold - should return false
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: -30,
        bottom: 70,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: -30,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement, 0.8)).toBe(false);
      expect(isElementInViewport(mockElement, 0.6)).toBe(true);
    });

    it("should return false for zero-height elements", () => {
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        bottom: 100,
        height: 0,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });

      expect(isElementInViewport(mockElement)).toBe(false);
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should debounce function calls", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Function should not have been called yet
      expect(fn).not.toHaveBeenCalled();

      // Advance time past debounce delay
      vi.advanceTimersByTime(100);

      // Now function should have been called once
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to debounced function", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn("arg1", "arg2");

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should reset timer on each call", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);

      debouncedFn(); // Reset timer
      vi.advanceTimersByTime(50);

      // Should not have been called yet (timer was reset)
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);

      // Now should have been called
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should allow cancellation", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);

      // Should not have been called due to cancellation
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("smartScrollIntoView", () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 800,
      });

      mockElement = document.createElement("div");
      mockElement.scrollIntoView = vi.fn();
      document.body.appendChild(mockElement);
    });

    afterEach(() => {
      document.body.removeChild(mockElement);
    });

    it("should scroll when element is out of viewport", () => {
      // Element below viewport
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 900,
        bottom: 1000,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 900,
        toJSON: () => ({}),
      });

      smartScrollIntoView(mockElement);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });

    it("should NOT scroll when element is in viewport", () => {
      // Element fully visible
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 100,
        bottom: 200,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      });

      smartScrollIntoView(mockElement);

      expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should accept custom scroll options", () => {
      vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
        top: 900,
        bottom: 1000,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 900,
        toJSON: () => ({}),
      });

      smartScrollIntoView(mockElement, { behavior: "instant", block: "start" });

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "instant",
        block: "start",
      });
    });
  });
});
