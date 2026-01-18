import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Gamification Store - Sprint 8 Story #5
 *
 * Manages review gamification:
 * - Points system (file reviewed: +5, comment: +10, PR completed: +50)
 * - Badge tiers (Bronze: 100, Silver: 500, Gold: 1000)
 * - Streak tracking (consecutive review days)
 * - Weekly leaderboard
 */

// Point values for different actions
export const POINT_VALUES = {
  FILE_REVIEWED: 5,
  COMMENT_POSTED: 10,
  PR_COMPLETED: 50,
  REPLY_POSTED: 3,
} as const;

// Badge thresholds
export const BADGE_THRESHOLDS = {
  BRONZE: 100,
  SILVER: 500,
  GOLD: 1000,
} as const;

export type BadgeType = 'bronze' | 'silver' | 'gold' | null;
export type ActionType = 'file_reviewed' | 'comment_posted' | 'pr_completed' | 'reply_posted';

export interface UserStats {
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  filesReviewed: number;
  commentsPosted: number;
  prsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  badge: BadgeType;
  lastActiveDate: string | null;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
  weeklyPoints: number;
  badge: BadgeType;
}

interface GamificationState {
  userStats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserStats: (stats: UserStats) => void;
  addPoints: (points: number, actionType: ActionType) => void;
  updateStreak: () => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  getTopLeaderboard: (count: number) => LeaderboardEntry[];
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;

  // Selectors
  calculateBadge: (points: number) => BadgeType;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const useGamificationStore = create<GamificationState>()(
  devtools(
    (set, get) => ({
      userStats: null,
      leaderboard: [],
      isLoading: false,
      error: null,

      setUserStats: (stats) => set({ userStats: stats }),

      addPoints: (points, actionType) =>
        set((state) => {
          if (!state.userStats) return state;

          const updates: Partial<UserStats> = {
            totalPoints: state.userStats.totalPoints + points,
            weeklyPoints: state.userStats.weeklyPoints + points,
          };

          // Increment action-specific counters
          switch (actionType) {
            case 'file_reviewed':
              updates.filesReviewed = state.userStats.filesReviewed + 1;
              break;
            case 'comment_posted':
              updates.commentsPosted = state.userStats.commentsPosted + 1;
              break;
            case 'pr_completed':
              updates.prsCompleted = state.userStats.prsCompleted + 1;
              break;
            // reply_posted doesn't have its own counter
          }

          // Update badge based on new total
          const newTotal = state.userStats.totalPoints + points;
          updates.badge = get().calculateBadge(newTotal);

          return {
            userStats: {
              ...state.userStats,
              ...updates,
            },
          };
        }),

      updateStreak: () =>
        set((state) => {
          if (!state.userStats) return state;

          const today = getTodayDateString();
          const lastActive = state.userStats.lastActiveDate;

          // If no previous activity, start streak at 1
          if (!lastActive) {
            return {
              userStats: {
                ...state.userStats,
                currentStreak: 1,
                longestStreak: Math.max(1, state.userStats.longestStreak),
                lastActiveDate: today,
              },
            };
          }

          // If same day, no change
          if (lastActive === today) {
            return state;
          }

          const daysSinceLastActive = daysBetween(lastActive, today);

          let newStreak: number;
          if (daysSinceLastActive === 1) {
            // Consecutive day - increment streak
            newStreak = state.userStats.currentStreak + 1;
          } else {
            // Gap in activity - reset to 1
            newStreak = 1;
          }

          const newLongestStreak = Math.max(newStreak, state.userStats.longestStreak);

          return {
            userStats: {
              ...state.userStats,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              lastActiveDate: today,
            },
          };
        }),

      setLeaderboard: (entries) => set({ leaderboard: entries }),

      getTopLeaderboard: (count) => {
        const { leaderboard } = get();
        return leaderboard.slice(0, count);
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      calculateBadge: (points) => {
        if (points >= BADGE_THRESHOLDS.GOLD) return 'gold';
        if (points >= BADGE_THRESHOLDS.SILVER) return 'silver';
        if (points >= BADGE_THRESHOLDS.BRONZE) return 'bronze';
        return null;
      },
    }),
    { name: 'GamificationStore' }
  )
);
