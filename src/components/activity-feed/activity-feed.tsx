"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useActivities } from '@/lib/hooks/use-activities';
import { ActivityItem } from './activity-item';
import { groupActivities } from '@/lib/utils/activity-utils';
import { filterActivitiesByPreferences } from '@/lib/utils/activity-filter';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  prId: string;
}

export function ActivityFeed({ prId }: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevActivityIdsRef = useRef<Set<string>>(new Set());
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewItems, setHasNewItems] = useState(false);
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());

  const { activities, isLoading } = useActivities({
    prId,
    enabled: true,
    pollingInterval: 3000,
  });

  // Get notification settings for filtering - Sprint 8 Story #1
  const notificationSettings = useSettingsStore((state) => state.notifications);

  // Group activities and filter based on user preferences
  const groupedActivities = filterActivitiesByPreferences(
    groupActivities(activities),
    notificationSettings
  );

  // Track scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "near bottom" if within 100px
    const nearBottom = scrollBottom < 100;
    setIsNearBottom(nearBottom);

    // Clear "new items" indicator when user scrolls to bottom
    if (nearBottom) {
      setHasNewItems(false);
    }
  };

  // Auto-scroll when new items arrive (only if near bottom)
  useEffect(() => {
    if (groupedActivities.length === 0) return;

    const currentIds = new Set(groupedActivities.map((a) => a.id));
    const currentIdsString = Array.from(currentIds).sort().join(',');
    const prevIdsString = Array.from(prevActivityIdsRef.current).sort().join(',');

    if (currentIdsString !== prevIdsString) {
      const newIds = Array.from(currentIds).filter((id) => !prevActivityIdsRef.current.has(id));

      if (newIds.length > 0) {
        setNewActivityIds(new Set(newIds));

        if (isNearBottom) {
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 100);
        } else {
          setHasNewItems(true);
        }
      }

      prevActivityIdsRef.current = currentIds;
    }
  }, [groupedActivities, isNearBottom]);

  // Scroll to bottom on button click
  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setHasNewItems(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      {/* Scrollable activity list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {groupedActivities.length > 0 ? (
          <div className="divide-y">
            {groupedActivities.map((activity) => {
              const isNew = newActivityIds.has(activity.id);
              return (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isNew={isNew}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No activity yet
            </p>
            <p className="text-xs text-muted-foreground">
              Activity will appear here as users join and interact
            </p>
          </div>
        )}
      </div>

      {/* "New items" floating button */}
      {hasNewItems && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2",
            "flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg",
            "transition-all hover:scale-105"
          )}
        >
          <ArrowDown className="h-4 w-4" />
          New activity
        </button>
      )}

      {/* Sync indicator */}
      <div className="border-t bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
        Updates every 3 seconds
      </div>
    </div>
  );
}
