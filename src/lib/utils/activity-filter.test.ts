import { describe, it, expect } from 'vitest';
import { filterActivitiesByPreferences, mapActivityTypeToSetting } from './activity-filter';
import type { GroupedActivity } from './activity-utils';
import type { NotificationSettings } from '@/lib/stores/settings-store';

/**
 * TDD RED Phase - Sprint 8 Story #1
 * Activity Feed filtering based on notification preferences
 *
 * These tests are written FIRST and expected to FAIL
 * until the implementation is complete (GREEN phase)
 */

const createMockActivity = (type: GroupedActivity['type'], overrides = {}): GroupedActivity => ({
  id: `activity-${Math.random()}`,
  type,
  users: [{ user_id: 'user1', username: 'testuser', avatar_url: null }],
  count: 1,
  created_at: new Date().toISOString(),
  ...overrides,
});

const DEFAULT_SETTINGS: NotificationSettings = {
  newComments: true,
  mentionedInComment: true,
  prUpdates: true,
  reviewAssigned: true,
  soundEnabled: false,
  browserNotifications: false,
};

describe('Activity Filter Utils - Sprint 8 Story #1', () => {
  describe('mapActivityTypeToSetting', () => {
    it('should map comment_posted to newComments setting', () => {
      expect(mapActivityTypeToSetting('comment_posted')).toBe('newComments');
    });

    it('should map comment_deleted to newComments setting', () => {
      expect(mapActivityTypeToSetting('comment_deleted')).toBe('newComments');
    });

    it('should map user_joined to prUpdates setting', () => {
      expect(mapActivityTypeToSetting('user_joined')).toBe('prUpdates');
    });

    it('should map user_left to prUpdates setting', () => {
      expect(mapActivityTypeToSetting('user_left')).toBe('prUpdates');
    });

    it('should map cursor_active to prUpdates setting', () => {
      expect(mapActivityTypeToSetting('cursor_active')).toBe('prUpdates');
    });

    it('should map cursor_idle to prUpdates setting', () => {
      expect(mapActivityTypeToSetting('cursor_idle')).toBe('prUpdates');
    });

    it('should return null for unknown activity types', () => {
      expect(mapActivityTypeToSetting('unknown_type' as any)).toBeNull();
    });
  });

  describe('filterActivitiesByPreferences', () => {
    it('should return all activities when all settings are enabled', () => {
      const activities: GroupedActivity[] = [
        createMockActivity('comment_posted'),
        createMockActivity('user_joined'),
        createMockActivity('cursor_active'),
      ];

      const result = filterActivitiesByPreferences(activities, DEFAULT_SETTINGS);
      expect(result).toHaveLength(3);
    });

    it('should filter out comment activities when newComments is disabled', () => {
      const activities: GroupedActivity[] = [
        createMockActivity('comment_posted'),
        createMockActivity('comment_deleted'),
        createMockActivity('user_joined'),
      ];

      const settings: NotificationSettings = {
        ...DEFAULT_SETTINGS,
        newComments: false,
      };

      const result = filterActivitiesByPreferences(activities, settings);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('user_joined');
    });

    it('should filter out presence activities when prUpdates is disabled', () => {
      const activities: GroupedActivity[] = [
        createMockActivity('comment_posted'),
        createMockActivity('user_joined'),
        createMockActivity('user_left'),
        createMockActivity('cursor_active'),
      ];

      const settings: NotificationSettings = {
        ...DEFAULT_SETTINGS,
        prUpdates: false,
      };

      const result = filterActivitiesByPreferences(activities, settings);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('comment_posted');
    });

    it('should return empty array when all relevant settings are disabled', () => {
      const activities: GroupedActivity[] = [
        createMockActivity('comment_posted'),
        createMockActivity('user_joined'),
      ];

      const settings: NotificationSettings = {
        ...DEFAULT_SETTINGS,
        newComments: false,
        prUpdates: false,
      };

      const result = filterActivitiesByPreferences(activities, settings);
      expect(result).toHaveLength(0);
    });

    it('should handle empty activities array', () => {
      const result = filterActivitiesByPreferences([], DEFAULT_SETTINGS);
      expect(result).toHaveLength(0);
    });

    it('should preserve activity order after filtering', () => {
      const activities: GroupedActivity[] = [
        createMockActivity('comment_posted', { id: 'first' }),
        createMockActivity('user_joined', { id: 'second' }),
        createMockActivity('comment_deleted', { id: 'third' }),
      ];

      const settings: NotificationSettings = {
        ...DEFAULT_SETTINGS,
        prUpdates: false, // Filter out user_joined
      };

      const result = filterActivitiesByPreferences(activities, settings);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('first');
      expect(result[1].id).toBe('third');
    });
  });
});
