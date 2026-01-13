"use client";

import { memo } from 'react';
import { UserPlus, UserMinus, MessageSquare, MousePointer, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { GroupedActivity } from '@/lib/utils/activity-utils';
import { getActivityMessage, formatRelativeTime } from '@/lib/utils/activity-utils';

interface ActivityItemProps {
  activity: GroupedActivity;
  isNew?: boolean; // Flag for newly added items
}

// Map activity types to icons and colors
const ACTIVITY_CONFIG = {
  user_joined: {
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
  },
  user_left: {
    icon: UserMinus,
    color: 'text-gray-600',
    bgColor: 'bg-gray-600/10',
  },
  comment_posted: {
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
  },
  comment_deleted: {
    icon: MessageSquare,
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
  cursor_active: {
    icon: MousePointer,
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
  },
  cursor_idle: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
  },
} as const;

export const ActivityItem = memo<ActivityItemProps>(({ activity, isNew }) => {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;
  const message = getActivityMessage(activity);
  const relativeTime = formatRelativeTime(activity.created_at);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-all duration-300",
        "hover:bg-muted/50",
        // New item animation (slide in + highlight)
        isNew && "animate-slide-in bg-primary/5"
      )}
    >
      {/* Icon */}
      <div className={cn("rounded-full p-2 mt-0.5", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* User avatars (stacked) */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex -space-x-2">
            {activity.users.slice(0, 3).map((user) => (
              <Avatar key={user.user_id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                <AvatarFallback className="text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        {/* Message */}
        <p className="text-sm leading-tight">
          {message}
        </p>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">{relativeTime}</p>
      </div>
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';
