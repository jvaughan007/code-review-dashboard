/**
 * Scroll Utilities
 *
 * Provides debouncing and viewport detection for smooth scroll behavior.
 */

/**
 * Check if an element is visible in the viewport
 * @param element - The DOM element to check
 * @param threshold - Percentage (0-1) of element that must be visible (default 0.5 = 50%)
 * @returns true if at least `threshold` of the element is visible
 */
export function isElementInViewport(
  element: HTMLElement,
  threshold: number = 0.5
): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Element is considered visible if at least threshold% is in viewport
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const elementHeight = rect.height;

  // Handle edge case of zero-height elements
  if (elementHeight === 0) return false;

  return visibleHeight >= elementHeight * threshold;
}

/**
 * Debounce utility for scroll operations
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

/**
 * Smart scroll that only scrolls if element is out of viewport
 * @param element - Element to scroll into view
 * @param options - ScrollIntoView options
 */
export function smartScrollIntoView(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void {
  if (!isElementInViewport(element)) {
    element.scrollIntoView(options);
  }
}

/**
 * Create a debounced smart scroll function
 * @param delay - Debounce delay in milliseconds (default 100ms)
 * @returns Debounced scroll function
 */
export function createDebouncedScroll(delay: number = 100) {
  return debounce((element: HTMLElement) => {
    smartScrollIntoView(element);
  }, delay);
}
