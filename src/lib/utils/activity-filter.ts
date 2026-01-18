import type { GroupedActivity } from './activity-utils';
import type { NotificationSettings, NotificationKey } from '@/lib/stores/settings-store';

/**
 * Activity Filter Utils - Sprint 8 Story #1
 *
 * Filters Activity Feed items based on user notification preferences.
 * Maps activity types to notification settings for filtering.
 */

type ActivityType = GroupedActivity['type'];

/**
 * Maps activity types to their corresponding notification setting keys.
 *
 * Mapping logic:
 * - comment_posted, comment_deleted → newComments
 * - user_joined, user_left, cursor_active, cursor_idle → prUpdates
 */
export function mapActivityTypeToSetting(activityType: ActivityType): NotificationKey | null {
  switch (activityType) {
    case 'comment_posted':
    case 'comment_deleted':
      return 'newComments';

    case 'user_joined':
    case 'user_left':
    case 'cursor_active':
    case 'cursor_idle':
      return 'prUpdates';

    default:
      return null;
  }
}

/**
 * Filters activities based on user notification preferences.
 *
 * @param activities - Array of grouped activities to filter
 * @param settings - User's notification preferences
 * @returns Filtered array of activities that match enabled preferences
 */
export function filterActivitiesByPreferences(
  activities: GroupedActivity[],
  settings: NotificationSettings
): GroupedActivity[] {
  return activities.filter((activity) => {
    const settingKey = mapActivityTypeToSetting(activity.type);

    // If no mapping exists, include the activity (unknown types pass through)
    if (settingKey === null) {
      return true;
    }

    // Check if the corresponding notification setting is enabled
    return settings[settingKey] === true;
  });
}
