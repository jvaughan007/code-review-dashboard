import { create } from 'zustand';

/**
 * Activity Store - Manages activity feed data
 *
 * Architecture: Similar to cursor-store and presence-store
 * - Activities are organized by PR
 * - Polling hook updates store with new activities
 * - Store maintains last 50 activities per PR (prevents memory leaks)
 */

export type ActivityType =
  | 'user_joined'
  | 'user_left'
  | 'comment_posted'
  | 'comment_deleted'
  | 'cursor_active'
  | 'cursor_idle';

export interface Activity {
  id: string;
  pr_id: string;
  user_id: string;
  session_id: string | null;
  activity_type: ActivityType;
  metadata: Record<string, any>;
  created_at: string;
}

interface ActivityState {
  // Activities by PR (sorted by created_at DESC)
  activitiesByPR: Record<string, Activity[]>;

  // Loading state
  isLoading: boolean;

  // Actions
  setActivities: (prId: string, activities: Activity[], limit?: number) => void;
  addActivities: (prId: string, newActivities: Activity[], limit?: number) => void;
  clearActivities: (prId: string) => void;
  setLoading: (loading: boolean) => void;

  // Helpers
  getActivitiesForPR: (prId: string) => Activity[];
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activitiesByPR: {},
  isLoading: false,

  setActivities: (prId, activities, limit = 50) => {
    set((state) => ({
      activitiesByPR: {
        ...state.activitiesByPR,
        [prId]: activities.slice(0, limit), // Limit to prevent memory leaks
      },
    }));
  },

  addActivities: (prId, newActivities, limit = 50) => {
    set((state) => {
      const existing = state.activitiesByPR[prId] || [];

      // Merge new activities, remove duplicates by id, sort by created_at DESC
      const merged = [...newActivities, ...existing];
      const deduped = Array.from(
        new Map(merged.map((a) => [a.id, a])).values()
      );
      const sorted = deduped.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        activitiesByPR: {
          ...state.activitiesByPR,
          [prId]: sorted.slice(0, limit), // Limit to prevent memory leaks
        },
      };
    });
  },

  clearActivities: (prId) => {
    set((state) => {
      const newActivitiesByPR = { ...state.activitiesByPR };
      delete newActivitiesByPR[prId];
      return { activitiesByPR: newActivitiesByPR };
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getActivitiesForPR: (prId) => {
    return get().activitiesByPR[prId] || [];
  },
}));
