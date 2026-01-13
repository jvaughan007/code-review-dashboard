import { describe, it, expect, beforeEach } from 'vitest';
import { useCursorStore, generateCursorColor, type CursorPosition } from './cursor-store';

/**
 * Cursor Store Tests
 *
 * Tests the Zustand store that manages cursor state and the
 * generateCursorColor utility function.
 */

// Helper to create mock cursor
const createMockCursor = (overrides: Partial<CursorPosition> = {}): CursorPosition => ({
  id: 'cursor-1',
  session_id: 'session-1',
  user_id: 'user-1',
  pr_id: 'owner/repo/1',
  file_path: 'src/index.ts',
  x: 100,
  y: 200,
  line_number: 10,
  color: '#FF6B6B',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('Cursor Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCursorStore.setState({
      cursorsByPRFile: {},
      myColor: null,
    });
  });

  describe('setCursors', () => {
    it('should set cursors for a PR/file combination', () => {
      const store = useCursorStore.getState();
      const cursors = [createMockCursor(), createMockCursor({ id: 'cursor-2', session_id: 'session-2' })];

      store.setCursors('owner/repo/1', 'src/index.ts', cursors);

      expect(store.getCursorsForFile('owner/repo/1', 'src/index.ts')).toHaveLength(2);
    });

    it('should replace existing cursors', () => {
      const store = useCursorStore.getState();

      // Set initial cursors
      store.setCursors('owner/repo/1', 'src/index.ts', [createMockCursor()]);

      // Replace with empty array
      store.setCursors('owner/repo/1', 'src/index.ts', []);

      expect(store.getCursorsForFile('owner/repo/1', 'src/index.ts')).toHaveLength(0);
    });
  });

  describe('getCursorsForFile', () => {
    it('should return empty array for unknown PR/file', () => {
      const store = useCursorStore.getState();

      const result = store.getCursorsForFile('unknown/repo/1', 'unknown.ts');

      expect(result).toEqual([]);
    });

    it('should return cursors for known PR/file', () => {
      const store = useCursorStore.getState();
      const cursor = createMockCursor({ x: 150, y: 250 });

      store.setCursors('owner/repo/1', 'src/index.ts', [cursor]);
      const result = store.getCursorsForFile('owner/repo/1', 'src/index.ts');

      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(150);
      expect(result[0].y).toBe(250);
    });
  });

  describe('updateCursor', () => {
    it('should add new cursor if not exists', () => {
      const store = useCursorStore.getState();
      const cursor = createMockCursor();

      store.updateCursor(cursor);

      expect(store.getCursorsForFile('owner/repo/1', 'src/index.ts')).toHaveLength(1);
    });

    it('should update existing cursor by session_id', () => {
      const store = useCursorStore.getState();
      const cursor = createMockCursor({ x: 100, y: 100 });

      store.setCursors('owner/repo/1', 'src/index.ts', [cursor]);
      store.updateCursor({ ...cursor, x: 200, y: 300 });

      const result = store.getCursorsForFile('owner/repo/1', 'src/index.ts');
      expect(result).toHaveLength(1);
      expect(result[0].x).toBe(200);
      expect(result[0].y).toBe(300);
    });
  });

  describe('removeCursor', () => {
    it('should remove cursor by session_id and file_path', () => {
      const store = useCursorStore.getState();

      store.setCursors('owner/repo/1', 'src/index.ts', [
        createMockCursor({ session_id: 'session-1' }),
        createMockCursor({ session_id: 'session-2', id: 'cursor-2' }),
      ]);

      store.removeCursor('session-1', 'src/index.ts');

      const result = store.getCursorsForFile('owner/repo/1', 'src/index.ts');
      expect(result).toHaveLength(1);
      expect(result[0].session_id).toBe('session-2');
    });
  });

  describe('setMyColor', () => {
    it('should set user color', () => {
      const store = useCursorStore.getState();

      store.setMyColor('#4ECDC4');

      expect(useCursorStore.getState().myColor).toBe('#4ECDC4');
    });
  });

  describe('getMyColor', () => {
    it('should return default color if not set', () => {
      const store = useCursorStore.getState();

      expect(store.getMyColor()).toBe('#FF6B6B');
    });

    it('should return set color', () => {
      const store = useCursorStore.getState();

      store.setMyColor('#45B7D1');

      expect(store.getMyColor()).toBe('#45B7D1');
    });
  });
});

describe('generateCursorColor', () => {
  it('should return a hex color string', () => {
    const color = generateCursorColor('testuser');

    expect(color).toMatch(/^#[A-F0-9]{6}$/i);
  });

  it('should return consistent color for same username', () => {
    const color1 = generateCursorColor('alice');
    const color2 = generateCursorColor('alice');

    expect(color1).toBe(color2);
  });

  it('should return different colors for different usernames', () => {
    const colorAlice = generateCursorColor('alice');
    const colorBob = generateCursorColor('bob');
    const colorCharlie = generateCursorColor('charlie');

    // At least 2 of 3 should be different (probabilistically)
    const colors = new Set([colorAlice, colorBob, colorCharlie]);
    expect(colors.size).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty string', () => {
    const color = generateCursorColor('');

    expect(color).toMatch(/^#[A-F0-9]{6}$/i);
  });

  it('should handle special characters', () => {
    const color = generateCursorColor('user@example.com');

    expect(color).toMatch(/^#[A-F0-9]{6}$/i);
  });
});
