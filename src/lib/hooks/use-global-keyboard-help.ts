import { useState, useEffect, useCallback } from 'react';

/**
 * useGlobalKeyboardHelp - Sprint 8 Story #2
 *
 * Global keyboard shortcut hook that:
 * - Listens for `?` key to toggle keyboard shortcuts help modal
 * - Handles Escape to close modal
 * - Ignores keypresses when typing in input/textarea/contentEditable
 */

interface UseGlobalKeyboardHelpOptions {
  enabled?: boolean;
}

interface UseGlobalKeyboardHelpReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Check if the target element is an editable element
 * (input, textarea, or contentEditable)
 */
function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  // Check for input and textarea
  if (tagName === 'input' || tagName === 'textarea') {
    return true;
  }

  // Check for contentEditable (using getAttribute for compatibility)
  if (target.isContentEditable || target.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

export function useGlobalKeyboardHelp(
  options: UseGlobalKeyboardHelpOptions = {}
): UseGlobalKeyboardHelpReturn {
  const { enabled = true } = options;
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger when typing in editable elements
      if (isEditableElement(event.target)) {
        return;
      }

      // Handle `?` key to toggle modal
      if (event.key === '?') {
        event.preventDefault();
        toggle();
        return;
      }

      // Handle Escape to close modal (only if open)
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        close();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, isOpen, toggle, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
