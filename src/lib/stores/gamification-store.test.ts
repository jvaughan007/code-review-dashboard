import { describe, it, expect, beforeEach } from 'vitest';
import { useGamificationStore, POINT_VALUES, BADGE_THRESHOLDS } from './gamification-store';

/**
 * TDD RED Phase - Sprint 8 Story #5
 * Review Gamification MVP - Points, Badges, Streaks
 *
 * These tests are written FIRST and expected to FAIL
 * until the implementation is complete (GREEN phase)
 */

describe('Gamification Store - Sprint 8 Story #5', () => {
  beforeEach(() => {
    // Reset store before each test
    useGamificationStore.setState({
      userStats: null,
      leaderboard: [],
      isLoading: false,
      error: null,
    });
  });

  describe('Point Values Constants', () => {
    it('should award 5 points for file reviewed', () => {
      expect(POINT_VALUES.FILE_REVIEWED).toBe(5);
    });

    it('should award 10 points for comment posted', () => {
      expect(POINT_VALUES.COMMENT_POSTED).toBe(10);
    });

    it('should award 50 points for PR completed', () => {
      expect(POINT_VALUES.PR_COMPLETED).toBe(50);
    });

    it('should award 3 points for reply posted', () => {
      expect(POINT_VALUES.REPLY_POSTED).toBe(3);
    });
  });

  describe('Badge Thresholds Constants', () => {
    it('should have Bronze at 100 points', () => {
      expect(BADGE_THRESHOLDS.BRONZE).toBe(100);
    });

    it('should have Silver at 500 points', () => {
      expect(BADGE_THRESHOLDS.SILVER).toBe(500);
    });

    it('should have Gold at 1000 points', () => {
      expect(BADGE_THRESHOLDS.GOLD).toBe(1000);
    });
  });

  describe('Initial State', () => {
    it('should start with null userStats', () => {
      const state = useGamificationStore.getState();
      expect(state.userStats).toBeNull();
    });

    it('should start with empty leaderboard', () => {
      const state = useGamificationStore.getState();
      expect(state.leaderboard).toEqual([]);
    });

    it('should start with isLoading false', () => {
      const state = useGamificationStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setUserStats', () => {
    it('should set user stats correctly', () => {
      const stats = {
        userId: 'user1',
        totalPoints: 150,
        weeklyPoints: 50,
        filesReviewed: 10,
        commentsPosted: 5,
        prsCompleted: 2,
        currentStreak: 3,
        longestStreak: 5,
        badge: 'bronze' as const,
        lastActiveDate: '2026-01-17',
      };

      useGamificationStore.getState().setUserStats(stats);

      expect(useGamificationStore.getState().userStats).toEqual(stats);
    });
  });

  describe('addPoints', () => {
    it('should add points to user stats', () => {
      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 2,
        longestStreak: 2,
        badge: 'bronze' as const,
        lastActiveDate: '2026-01-16',
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().addPoints(POINT_VALUES.FILE_REVIEWED, 'file_reviewed');

      const state = useGamificationStore.getState();
      expect(state.userStats?.totalPoints).toBe(105);
      expect(state.userStats?.weeklyPoints).toBe(25);
      expect(state.userStats?.filesReviewed).toBe(6);
    });

    it('should increment filesReviewed counter for file_reviewed action', () => {
      const initialStats = {
        userId: 'user1',
        totalPoints: 0,
        weeklyPoints: 0,
        filesReviewed: 0,
        commentsPosted: 0,
        prsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        badge: null,
        lastActiveDate: null,
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().addPoints(POINT_VALUES.FILE_REVIEWED, 'file_reviewed');

      expect(useGamificationStore.getState().userStats?.filesReviewed).toBe(1);
    });

    it('should increment commentsPosted counter for comment_posted action', () => {
      const initialStats = {
        userId: 'user1',
        totalPoints: 0,
        weeklyPoints: 0,
        filesReviewed: 0,
        commentsPosted: 0,
        prsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        badge: null,
        lastActiveDate: null,
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().addPoints(POINT_VALUES.COMMENT_POSTED, 'comment_posted');

      expect(useGamificationStore.getState().userStats?.commentsPosted).toBe(1);
    });

    it('should increment prsCompleted counter for pr_completed action', () => {
      const initialStats = {
        userId: 'user1',
        totalPoints: 0,
        weeklyPoints: 0,
        filesReviewed: 0,
        commentsPosted: 0,
        prsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        badge: null,
        lastActiveDate: null,
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().addPoints(POINT_VALUES.PR_COMPLETED, 'pr_completed');

      expect(useGamificationStore.getState().userStats?.prsCompleted).toBe(1);
    });
  });

  describe('calculateBadge', () => {
    it('should return null for points below Bronze threshold', () => {
      const badge = useGamificationStore.getState().calculateBadge(50);
      expect(badge).toBeNull();
    });

    it('should return bronze for points at Bronze threshold', () => {
      const badge = useGamificationStore.getState().calculateBadge(100);
      expect(badge).toBe('bronze');
    });

    it('should return bronze for points between Bronze and Silver', () => {
      const badge = useGamificationStore.getState().calculateBadge(300);
      expect(badge).toBe('bronze');
    });

    it('should return silver for points at Silver threshold', () => {
      const badge = useGamificationStore.getState().calculateBadge(500);
      expect(badge).toBe('silver');
    });

    it('should return silver for points between Silver and Gold', () => {
      const badge = useGamificationStore.getState().calculateBadge(750);
      expect(badge).toBe('silver');
    });

    it('should return gold for points at Gold threshold', () => {
      const badge = useGamificationStore.getState().calculateBadge(1000);
      expect(badge).toBe('gold');
    });

    it('should return gold for points above Gold threshold', () => {
      const badge = useGamificationStore.getState().calculateBadge(2000);
      expect(badge).toBe('gold');
    });
  });

  describe('updateStreak', () => {
    it('should increment streak for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 3,
        longestStreak: 5,
        badge: 'bronze' as const,
        lastActiveDate: yesterday.toISOString().split('T')[0],
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().updateStreak();

      const state = useGamificationStore.getState();
      expect(state.userStats?.currentStreak).toBe(4);
    });

    it('should reset streak if more than 1 day gap', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 5,
        longestStreak: 5,
        badge: 'bronze' as const,
        lastActiveDate: twoDaysAgo.toISOString().split('T')[0],
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().updateStreak();

      const state = useGamificationStore.getState();
      expect(state.userStats?.currentStreak).toBe(1);
    });

    it('should update longest streak when current exceeds it', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 5,
        longestStreak: 5,
        badge: 'bronze' as const,
        lastActiveDate: yesterday.toISOString().split('T')[0],
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().updateStreak();

      const state = useGamificationStore.getState();
      expect(state.userStats?.currentStreak).toBe(6);
      expect(state.userStats?.longestStreak).toBe(6);
    });

    it('should not update longest streak if current is lower', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 2,
        longestStreak: 10,
        badge: 'bronze' as const,
        lastActiveDate: yesterday.toISOString().split('T')[0],
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().updateStreak();

      const state = useGamificationStore.getState();
      expect(state.userStats?.currentStreak).toBe(3);
      expect(state.userStats?.longestStreak).toBe(10);
    });

    it('should keep streak at 1 if same day', () => {
      const today = new Date().toISOString().split('T')[0];

      const initialStats = {
        userId: 'user1',
        totalPoints: 100,
        weeklyPoints: 20,
        filesReviewed: 5,
        commentsPosted: 3,
        prsCompleted: 1,
        currentStreak: 3,
        longestStreak: 5,
        badge: 'bronze' as const,
        lastActiveDate: today,
      };

      useGamificationStore.getState().setUserStats(initialStats);
      useGamificationStore.getState().updateStreak();

      const state = useGamificationStore.getState();
      expect(state.userStats?.currentStreak).toBe(3); // No change for same day
    });
  });

  describe('Leaderboard', () => {
    it('should set leaderboard entries', () => {
      const leaderboard = [
        { userId: 'user1', username: 'Alice', avatarUrl: null, weeklyPoints: 200, badge: 'silver' as const },
        { userId: 'user2', username: 'Bob', avatarUrl: null, weeklyPoints: 150, badge: 'bronze' as const },
        { userId: 'user3', username: 'Charlie', avatarUrl: null, weeklyPoints: 100, badge: null },
      ];

      useGamificationStore.getState().setLeaderboard(leaderboard);

      expect(useGamificationStore.getState().leaderboard).toEqual(leaderboard);
    });

    it('should return top 5 entries from leaderboard', () => {
      const leaderboard = Array.from({ length: 10 }, (_, i) => ({
        userId: `user${i}`,
        username: `User ${i}`,
        avatarUrl: null,
        weeklyPoints: 100 - i * 10,
        badge: null,
      }));

      useGamificationStore.getState().setLeaderboard(leaderboard);

      const top5 = useGamificationStore.getState().getTopLeaderboard(5);
      expect(top5).toHaveLength(5);
      expect(top5[0].weeklyPoints).toBe(100);
      expect(top5[4].weeklyPoints).toBe(60);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      useGamificationStore.getState().setLoading(true);
      expect(useGamificationStore.getState().isLoading).toBe(true);

      useGamificationStore.getState().setLoading(false);
      expect(useGamificationStore.getState().isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error message', () => {
      useGamificationStore.getState().setError('Failed to load stats');
      expect(useGamificationStore.getState().error).toBe('Failed to load stats');
    });

    it('should clear error', () => {
      useGamificationStore.getState().setError('Some error');
      useGamificationStore.getState().clearError();
      expect(useGamificationStore.getState().error).toBeNull();
    });
  });
});
