"use client";

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useActivityStore, type Activity } from '@/lib/stores/activity-store';

/**
 * useActivities - Manages activity feed with database polling
 *
 * Features:
 * - Polls database every 3 seconds for new activities
 * - Incremental fetch (only gets activities newer than last seen)
 * - Limits to last 50 activities to prevent memory leaks
 * - Follows same pattern as use-presence.ts
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param enabled - Whether to enable activity tracking (default: true)
 */

interface UseActivitiesOptions {
  prId: string;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 3000)
  initialLimit?: number; // Max activities to fetch initially (default: 50)
}

export function useActivities({
  prId,
  enabled = true,
  pollingInterval = 3000,
  initialLimit = 50,
}: UseActivitiesOptions) {
  const supabase = createClient();
  const { addActivities, getActivitiesForPR, setLoading, isLoading } =
    useActivityStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeenRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Poll for activities
  useEffect(() => {
    if (!enabled || !prId) {
      return;
    }

    async function pollActivities() {
      try {
        if (isInitialLoadRef.current) {
          setLoading(true);
        }

        // Build query
        let query = supabase
          .from('activities')
          .select('*')
          .eq('pr_id', prId)
          .order('created_at', { ascending: false });

        // Incremental fetch: Only get activities newer than last seen
        if (lastSeenRef.current && !isInitialLoadRef.current) {
          query = query.gt('created_at', lastSeenRef.current);
        } else {
          // Initial load: Get last N activities
          query = query.limit(initialLimit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[ACTIVITIES] Error polling activities:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log('[ACTIVITIES] Fetched', data.length, 'new activit(ies)');

          // Update last seen timestamp to most recent activity
          lastSeenRef.current = data[0].created_at;

          // Add to store (store handles deduplication and sorting)
          addActivities(prId, data as Activity[], initialLimit);

          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
        }
      } catch (error) {
        console.error('[ACTIVITIES] Error in activity polling:', error);
      } finally {
        if (isInitialLoadRef.current) {
          setLoading(false);
        }
      }
    }

    // Initial poll
    pollActivities();

    // Set up polling interval
    pollingRef.current = setInterval(pollActivities, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prId,
    enabled,
    pollingInterval,
    initialLimit,
  ]);

  return {
    activities: getActivitiesForPR(prId),
    isLoading,
  };
}
