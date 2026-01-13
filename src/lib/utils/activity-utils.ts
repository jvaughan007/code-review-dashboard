import type { Activity, ActivityType } from '@/lib/stores/activity-store';

/**
 * Grouped activity for display (combines similar activities within time window)
 */
export interface GroupedActivity {
  id: string; // ID of first activity in group
  type: ActivityType;
  users: Array<{
    user_id: string;
    username: string;
    avatar_url: string | null;
  }>;
  count: number;
  metadata?: Record<string, any>;
  created_at: string; // Timestamp of most recent activity
}

/**
 * Group activities by type within 30-second windows
 *
 * Example:
 * - Input: [UserA joined, UserB joined, UserC joined] (within 30s)
 * - Output: [{ type: 'user_joined', users: [UserA, UserB, UserC], count: 3 }]
 */
export function groupActivities(activities: Activity[]): GroupedActivity[] {
  const grouped: GroupedActivity[] = [];
  const GROUPING_WINDOW_MS = 30 * 1000; // 30 seconds

  for (const activity of activities) {
    const activityTime = new Date(activity.created_at).getTime();

    // Try to find existing group within time window
    const existingGroup = grouped.find((group) => {
      const groupTime = new Date(group.created_at).getTime();
      const timeDiff = Math.abs(activityTime - groupTime);

      return group.type === activity.activity_type && timeDiff <= GROUPING_WINDOW_MS;
    });

    if (existingGroup) {
      // Add to existing group if user not already present
      const userExists = existingGroup.users.some(
        (u) => u.user_id === activity.user_id
      );

      if (!userExists) {
        const username = activity.metadata?.username || 'Unknown User';
        const avatar_url = activity.metadata?.avatar_url || null;

        existingGroup.users.push({
          user_id: activity.user_id,
          username,
          avatar_url,
        });
        existingGroup.count++;
      }

      // Update timestamp to most recent
      if (new Date(activity.created_at) > new Date(existingGroup.created_at)) {
        existingGroup.created_at = activity.created_at;
      }
    } else {
      // Create new group
      const username = activity.metadata?.username || 'Unknown User';
      const avatar_url = activity.metadata?.avatar_url || null;

      grouped.push({
        id: activity.id,
        type: activity.activity_type,
        users: [
          {
            user_id: activity.user_id,
            username,
            avatar_url,
          },
        ],
        count: 1,
        metadata: activity.metadata,
        created_at: activity.created_at,
      });
    }
  }

  return grouped;
}

/**
 * Format relative timestamp
 *
 * Examples:
 * - 5 seconds ago → "just now"
 * - 30 seconds ago → "30s ago"
 * - 2 minutes ago → "2m ago"
 * - 1 hour ago → "1h ago"
 * - 2 days ago → "2d ago"
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Generate activity message text
 *
 * Examples:
 * - "Alice joined"
 * - "Bob and Charlie commented"
 * - "Alice, Bob, and 2 others became active"
 */
export function getActivityMessage(activity: GroupedActivity): string {
  const userNames = activity.users.map((u) => u.username);

  const formattedUsers =
    userNames.length === 1
      ? userNames[0]
      : userNames.length === 2
      ? `${userNames[0]} and ${userNames[1]}`
      : `${userNames[0]}, ${userNames[1]}, and ${userNames.length - 2} other${
          userNames.length - 2 > 1 ? 's' : ''
        }`;

  switch (activity.type) {
    case 'user_joined':
      return `${formattedUsers} joined`;
    case 'user_left':
      return `${formattedUsers} left`;
    case 'comment_posted':
      return `${formattedUsers} commented`;
    case 'comment_deleted':
      return `${formattedUsers} deleted a comment`;
    case 'cursor_active':
      return `${formattedUsers} became active`;
    case 'cursor_idle':
      return `${formattedUsers} became idle`;
    default:
      return `${formattedUsers} performed an action`;
  }
}
