import { describe, it, expect, beforeEach } from 'vitest';
import { useShortcutsStore, KeyboardShortcut, ShortcutAction } from './shortcuts-store';

describe('Shortcuts Store - RED PHASE', () => {
  const defaultShortcuts: Record<ShortcutAction, KeyboardShortcut> = {
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

  beforeEach(() => {
    // Reset store between tests
    useShortcutsStore.setState({
      shortcuts: { ...defaultShortcuts },
      isRecording: false,
      recordingAction: null,
      conflicts: [],
    });
  });

  describe('getShortcut', () => {
    it('should return shortcut for an action', () => {
      // Act
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');

      // Assert
      expect(shortcut).toBeDefined();
      expect(shortcut.key).toBe('j');
      expect(shortcut.modifiers).toEqual([]);
    });

    it('should return shortcut with modifiers', () => {
      // Act
      const shortcut = useShortcutsStore.getState().getShortcut('submitComment');

      // Assert
      expect(shortcut.key).toBe('Enter');
      expect(shortcut.modifiers).toContain('ctrl');
    });
  });

  describe('updateShortcut', () => {
    it('should update shortcut key', () => {
      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'l', modifiers: [] });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.key).toBe('l');
    });

    it('should update shortcut with modifiers', () => {
      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'j', modifiers: ['ctrl'] });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.modifiers).toContain('ctrl');
    });

    it('should preserve description when updating', () => {
      // Arrange
      const originalDesc = useShortcutsStore.getState().getShortcut('nextFile').description;

      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'l', modifiers: [] });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.description).toBe(originalDesc);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflicting shortcuts', () => {
      // Act - set nextFile to same key as prevFile
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'k', modifiers: [] });

      // Assert
      const conflicts = useShortcutsStore.getState().getConflicts();
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts).toContainEqual(
        expect.objectContaining({
          key: 'k',
          actions: expect.arrayContaining(['nextFile', 'prevFile']),
        })
      );
    });

    it('should NOT detect conflict when modifiers differ', () => {
      // Act - same key but different modifiers
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'j', modifiers: ['ctrl'] });
      useShortcutsStore.getState().updateShortcut('prevFile', { key: 'j', modifiers: ['shift'] });

      // Assert
      const conflicts = useShortcutsStore.getState().getConflicts();
      const jConflicts = conflicts.filter(c => c.key === 'j');
      expect(jConflicts).toHaveLength(0);
    });

    it('should clear conflicts when resolved', () => {
      // Arrange - create conflict
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'k', modifiers: [] });
      expect(useShortcutsStore.getState().getConflicts().length).toBeGreaterThan(0);

      // Act - resolve conflict
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'j', modifiers: [] });

      // Assert
      const conflicts = useShortcutsStore.getState().getConflicts();
      const kConflicts = conflicts.filter(c => c.key === 'k' && c.actions.includes('nextFile'));
      expect(kConflicts).toHaveLength(0);
    });
  });

  describe('Recording Mode', () => {
    it('should start recording for an action', () => {
      // Act
      useShortcutsStore.getState().startRecording('nextFile');

      // Assert
      expect(useShortcutsStore.getState().isRecording).toBe(true);
      expect(useShortcutsStore.getState().recordingAction).toBe('nextFile');
    });

    it('should stop recording', () => {
      // Arrange
      useShortcutsStore.getState().startRecording('nextFile');

      // Act
      useShortcutsStore.getState().stopRecording();

      // Assert
      expect(useShortcutsStore.getState().isRecording).toBe(false);
      expect(useShortcutsStore.getState().recordingAction).toBeNull();
    });

    it('should record new shortcut and stop recording', () => {
      // Arrange
      useShortcutsStore.getState().startRecording('nextFile');

      // Act
      useShortcutsStore.getState().recordShortcut({ key: 'l', modifiers: ['ctrl'] });

      // Assert
      expect(useShortcutsStore.getState().isRecording).toBe(false);
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.key).toBe('l');
      expect(shortcut.modifiers).toContain('ctrl');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all shortcuts to defaults', () => {
      // Arrange - change shortcuts
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'x', modifiers: ['ctrl', 'shift'] });
      useShortcutsStore.getState().updateShortcut('prevFile', { key: 'y', modifiers: ['alt'] });

      // Act
      useShortcutsStore.getState().resetToDefaults();

      // Assert
      const nextFile = useShortcutsStore.getState().getShortcut('nextFile');
      const prevFile = useShortcutsStore.getState().getShortcut('prevFile');
      expect(nextFile.key).toBe('j');
      expect(nextFile.modifiers).toEqual([]);
      expect(prevFile.key).toBe('k');
      expect(prevFile.modifiers).toEqual([]);
    });

    it('should clear all conflicts after reset', () => {
      // Arrange - create conflicts
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'k', modifiers: [] });
      expect(useShortcutsStore.getState().getConflicts().length).toBeGreaterThan(0);

      // Act
      useShortcutsStore.getState().resetToDefaults();

      // Assert
      expect(useShortcutsStore.getState().getConflicts()).toHaveLength(0);
    });
  });

  describe('resetSingleShortcut', () => {
    it('should reset only one shortcut to default', () => {
      // Arrange - change multiple shortcuts
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'x', modifiers: [] });
      useShortcutsStore.getState().updateShortcut('prevFile', { key: 'y', modifiers: [] });

      // Act
      useShortcutsStore.getState().resetSingleShortcut('nextFile');

      // Assert
      const nextFile = useShortcutsStore.getState().getShortcut('nextFile');
      const prevFile = useShortcutsStore.getState().getShortcut('prevFile');
      expect(nextFile.key).toBe('j'); // reset
      expect(prevFile.key).toBe('y'); // unchanged
    });
  });

  describe('formatShortcut', () => {
    it('should format shortcut without modifiers', () => {
      // Act
      const formatted = useShortcutsStore.getState().formatShortcut('nextFile');

      // Assert
      expect(formatted).toBe('J');
    });

    it('should format shortcut with modifiers', () => {
      // Act
      const formatted = useShortcutsStore.getState().formatShortcut('submitComment');

      // Assert
      expect(formatted).toBe('Ctrl+Enter');
    });

    it('should format shortcut with multiple modifiers', () => {
      // Arrange
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'j', modifiers: ['ctrl', 'shift'] });

      // Act
      const formatted = useShortcutsStore.getState().formatShortcut('nextFile');

      // Assert
      expect(formatted).toBe('Ctrl+Shift+J');
    });
  });

  describe('getAllShortcuts', () => {
    it('should return all shortcuts as array', () => {
      // Act
      const shortcuts = useShortcutsStore.getState().getAllShortcuts();

      // Assert
      expect(shortcuts).toBeInstanceOf(Array);
      expect(shortcuts.length).toBe(12); // 12 default actions
    });

    it('should include action name with each shortcut', () => {
      // Act
      const shortcuts = useShortcutsStore.getState().getAllShortcuts();

      // Assert
      const nextFileShortcut = shortcuts.find(s => s.action === 'nextFile');
      expect(nextFileShortcut).toBeDefined();
      expect(nextFileShortcut?.key).toBe('j');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special keys (Escape, Enter, Space)', () => {
      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'Space', modifiers: [] });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.key).toBe('Space');
    });

    it('should handle function keys (F1-F12)', () => {
      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', { key: 'F1', modifiers: [] });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.key).toBe('F1');
    });

    it('should handle all modifier combinations', () => {
      // Act
      useShortcutsStore.getState().updateShortcut('nextFile', {
        key: 'j',
        modifiers: ['ctrl', 'shift', 'alt', 'meta']
      });

      // Assert
      const shortcut = useShortcutsStore.getState().getShortcut('nextFile');
      expect(shortcut.modifiers).toHaveLength(4);
      expect(shortcut.modifiers).toContain('ctrl');
      expect(shortcut.modifiers).toContain('shift');
      expect(shortcut.modifiers).toContain('alt');
      expect(shortcut.modifiers).toContain('meta');
    });
  });
});

// Expected Result: ALL TESTS FAIL (shortcuts-store.ts doesn't exist yet)
