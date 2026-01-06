import { create } from 'zustand';

/**
 * Cursor Store - Manages live cursor positions
 *
 * Architecture: Optimistic UI + Throttled Database Updates
 * - Local cursor updates are instant (no latency)
 * - Remote cursors are polled every 2-3 seconds
 * - Updates are throttled to max 60fps (16ms intervals)
 * - Cursors fade out after 3s of inactivity
 */

export interface CursorPosition {
  id: string;
  session_id: string;
  user_id: string;
  pr_id: string;
  file_path: string;
  x: number; // X coordinate (px)
  y: number; // Y coordinate (px)
  line_number: number | null; // Which line cursor is on
  color: string; // Hex color (assigned per user)
  username?: string; // For display (not in DB)
  avatar_url?: string | null; // For display (not in DB)
  updated_at: string;
}

interface CursorState {
  // Cursors by PR and file
  cursorsByPRFile: Record<string, CursorPosition[]>;

  // Current user's cursor color (assigned once)
  myColor: string | null;

  // Actions
  setCursors: (prId: string, filePath: string, cursors: CursorPosition[]) => void;
  updateCursor: (cursor: CursorPosition) => void;
  removeCursor: (sessionId: string, filePath: string) => void;
  setMyColor: (color: string) => void;

  // Helpers
  getCursorsForFile: (prId: string, filePath: string) => CursorPosition[];
  getMyColor: () => string;
}

// Generate cursor color from username (deterministic)
export function generateCursorColor(username: string): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Salmon
    '#98D8C8', // Mint
    '#F7B731', // Yellow
    '#5F27CD', // Purple
    '#00D2D3', // Cyan
    '#FF9FF3', // Pink
    '#54A0FF', // Light Blue
  ];

  // Hash username to get consistent color
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export const useCursorStore = create<CursorState>((set, get) => ({
  cursorsByPRFile: {},
  myColor: null,

  setCursors: (prId, filePath, cursors) => {
    const key = `${prId}:${filePath}`;
    set((state) => ({
      cursorsByPRFile: {
        ...state.cursorsByPRFile,
        [key]: cursors,
      },
    }));
  },

  updateCursor: (cursor) => {
    const key = `${cursor.pr_id}:${cursor.file_path}`;
    set((state) => {
      const existing = state.cursorsByPRFile[key] || [];
      const index = existing.findIndex((c) => c.session_id === cursor.session_id);

      if (index >= 0) {
        // Update existing cursor
        const updated = [...existing];
        updated[index] = cursor;
        return {
          cursorsByPRFile: {
            ...state.cursorsByPRFile,
            [key]: updated,
          },
        };
      } else {
        // Add new cursor
        return {
          cursorsByPRFile: {
            ...state.cursorsByPRFile,
            [key]: [...existing, cursor],
          },
        };
      }
    });
  },

  removeCursor: (sessionId, filePath) => {
    set((state) => {
      const newCursorsByPRFile = { ...state.cursorsByPRFile };

      // Remove cursor from all matching keys
      Object.keys(newCursorsByPRFile).forEach((key) => {
        if (key.endsWith(`:${filePath}`)) {
          newCursorsByPRFile[key] = newCursorsByPRFile[key].filter(
            (c) => c.session_id !== sessionId
          );
        }
      });

      return { cursorsByPRFile: newCursorsByPRFile };
    });
  },

  setMyColor: (color) => set({ myColor: color }),

  // Helper methods
  getCursorsForFile: (prId, filePath) => {
    const key = `${prId}:${filePath}`;
    return get().cursorsByPRFile[key] || [];
  },

  getMyColor: () => {
    return get().myColor || '#FF6B6B'; // Default red
  },
}));
