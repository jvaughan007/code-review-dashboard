import { create } from 'zustand';

/**
 * Presence Store - Manages who's online viewing PRs
 *
 * Architecture: Optimistic UI + Database Polling
 * - Updates are applied instantly (optimistic)
 * - Polling syncs with database every 2-3 seconds
 * - Stale data is removed after 5 minutes (cleanup function)
 */

export interface PresenceUser {
  id: string;
  session_id: string;
  user_id: string;
  pr_id: string;
  username: string;
  avatar_url: string | null;
  current_file: string | null;
  current_line: number | null;
  status: 'viewing' | 'commenting' | 'idle';
  last_heartbeat: string;
}

interface PresenceState {
  // Presence data by PR ID
  presenceByPR: Record<string, PresenceUser[]>;

  // Current user's session ID (for this PR)
  currentSessionId: string | null;

  // Loading states
  isLoading: boolean;

  // Actions
  setPresence: (prId: string, users: PresenceUser[]) => void;
  addPresence: (user: PresenceUser) => void;
  removePresence: (sessionId: string) => void;
  updatePresence: (sessionId: string, updates: Partial<PresenceUser>) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Helpers
  getPresenceForPR: (prId: string) => PresenceUser[];
  getPresenceCount: (prId: string) => number;
  isUserPresent: (prId: string, userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presenceByPR: {},
  currentSessionId: null,
  isLoading: false,

  setPresence: (prId, users) =>
    set((state) => ({
      presenceByPR: {
        ...state.presenceByPR,
        [prId]: users,
      },
    })),

  addPresence: (user) =>
    set((state) => {
      const existing = state.presenceByPR[user.pr_id] || [];
      const alreadyExists = existing.some((u) => u.session_id === user.session_id);

      if (alreadyExists) {
        // Update existing user
        return {
          presenceByPR: {
            ...state.presenceByPR,
            [user.pr_id]: existing.map((u) =>
              u.session_id === user.session_id ? user : u
            ),
          },
        };
      }

      // Add new user
      return {
        presenceByPR: {
          ...state.presenceByPR,
          [user.pr_id]: [...existing, user],
        },
      };
    }),

  removePresence: (sessionId) =>
    set((state) => {
      const newPresenceByPR = { ...state.presenceByPR };

      // Find and remove the user from all PRs
      Object.keys(newPresenceByPR).forEach((prId) => {
        newPresenceByPR[prId] = newPresenceByPR[prId].filter(
          (u) => u.session_id !== sessionId
        );
      });

      return { presenceByPR: newPresenceByPR };
    }),

  updatePresence: (sessionId, updates) =>
    set((state) => {
      const newPresenceByPR = { ...state.presenceByPR };

      // Find and update the user
      Object.keys(newPresenceByPR).forEach((prId) => {
        newPresenceByPR[prId] = newPresenceByPR[prId].map((u) =>
          u.session_id === sessionId ? { ...u, ...updates } : u
        );
      });

      return { presenceByPR: newPresenceByPR };
    }),

  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

  setLoading: (loading) => set({ isLoading: loading }),

  // Helper methods
  getPresenceForPR: (prId) => {
    return get().presenceByPR[prId] || [];
  },

  getPresenceCount: (prId) => {
    return get().getPresenceForPR(prId).length;
  },

  isUserPresent: (prId, userId) => {
    return get().getPresenceForPR(prId).some((u) => u.user_id === userId);
  },
}));
