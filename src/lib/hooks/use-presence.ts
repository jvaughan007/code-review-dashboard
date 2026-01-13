"use client";

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePresenceStore, type PresenceUser } from '@/lib/stores/presence-store';

/**
 * usePresence - Manages presence data with database polling
 *
 * Features:
 * - Polls database every 3 seconds for updates
 * - Sends heartbeat every 10 seconds
 * - Automatically joins/leaves PR sessions
 * - Cleans up on unmount
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param enabled - Whether to enable presence tracking (default: true)
 */

interface UsePresenceOptions {
  prId: string;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 3000)
  heartbeatInterval?: number; // ms (default: 10000)
}

export function usePresence({
  prId,
  enabled = true,
  pollingInterval = 3000,
  heartbeatInterval = 10000,
}: UsePresenceOptions) {
  const supabase = createClient();
  const {
    setPresence,
    setCurrentSessionId,
    currentSessionId,
    getPresenceForPR,
    getPresenceCount,
  } = usePresenceStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Join PR session on mount
  useEffect(() => {
    if (!enabled || !prId) return;

    let isMounted = true;

    async function joinSession() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        // Create or update session (without .single() to avoid PGRST116 errors)
        const { data: sessionData, error: sessionError } = await supabase
          .from('pr_sessions')
          .upsert(
            {
              pr_id: prId,
              user_id: user.id,
              last_seen_at: new Date().toISOString(),
              is_active: true,
            },
            {
              onConflict: 'pr_id,user_id',
            }
          )
          .select();

        if (sessionError) {
          console.error('Error creating session:', {
            error: sessionError,
            code: sessionError?.code,
            message: sessionError?.message,
            details: sessionError?.details,
            hint: sessionError?.hint,
            prId,
            userId: user.id,
          });
          return;
        }

        if (!sessionData || sessionData.length === 0) {
          console.error('No session returned but no error either', { prId, userId: user.id });
          return;
        }

        const session = sessionData[0];

        if (!isMounted) return;

        // CRITICAL: Create presence entry FIRST, then set sessionId
        // This ensures presence data exists when cursor polling starts
        const { error: presenceError } = await supabase
          .from('presence')
          .upsert(
            {
              session_id: session.id,
              user_id: user.id,
              pr_id: prId,
              username: user.user_metadata.user_name || user.email?.split('@')[0] || 'Anonymous',
              avatar_url: user.user_metadata.avatar_url || null,
              status: 'viewing',
              last_heartbeat: new Date().toISOString(),
            },
            {
              onConflict: 'session_id',
            }
          );

        if (presenceError) {
          console.error('Error creating presence:', presenceError);
          return; // Don't set sessionId if presence creation failed
        }

        // Set sessionId AFTER presence is created to prevent race condition
        // This triggers useCursors to start polling, which will now find presence data
        setCurrentSessionId(session.id);
      } catch (error) {
        console.error('Error joining session:', error);
      }
    }

    joinSession();

    return () => {
      isMounted = false;
    };
  }, [prId, enabled, supabase, setCurrentSessionId]);

  // Poll for presence updates
  useEffect(() => {
    if (!enabled || !prId) return;

    async function pollPresence() {
      try {
        const { data, error } = await supabase
          .from('presence')
          .select('*')
          .eq('pr_id', prId)
          .gte('last_heartbeat', new Date(Date.now() - 30 * 1000).toISOString()) // Last 30 seconds
          .order('username', { ascending: true }); // Stable sort order prevents avatar shuffling

        if (error) {
          console.error('Error polling presence:', error);
          return;
        }

        setPresence(prId, data as PresenceUser[]);
      } catch (error) {
        console.error('Error in presence polling:', error);
      }
    }

    // Initial poll
    pollPresence();

    // Set up polling interval
    pollingRef.current = setInterval(pollPresence, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [prId, enabled, pollingInterval, supabase, setPresence]);

  // Send heartbeat
  useEffect(() => {
    if (!enabled || !currentSessionId) return;

    async function sendHeartbeat() {
      try {
        await supabase
          .from('presence')
          .update({
            last_heartbeat: new Date().toISOString(),
          })
          .eq('session_id', currentSessionId);
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }

    // Set up heartbeat interval
    heartbeatRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [currentSessionId, enabled, heartbeatInterval, supabase]);

  // Leave session on unmount
  useEffect(() => {
    return () => {
      if (!currentSessionId) return;

      // Async cleanup
      (async () => {
        try {
          // Mark session as inactive
          await supabase
            .from('pr_sessions')
            .update({ is_active: false })
            .eq('id', currentSessionId);

          // Delete presence
          await supabase.from('presence').delete().eq('session_id', currentSessionId);
        } catch (error) {
          console.error('Error leaving session:', error);
        }
      })();
    };
  }, [currentSessionId, supabase]);

  // Note: beforeunload cleanup removed (Decision Council #6)
  //
  // Rationale: Browsers don't wait for async operations in beforeunload handlers.
  // The page closes immediately, so Supabase DELETE requests never complete.
  //
  // Current cleanup mechanism: Server-side TTL with 30-second heartbeat threshold
  // - Polling query filters out presence where last_heartbeat > 30 seconds old
  // - Cleanup latency: 23-27 seconds (within acceptable 30s requirement)
  // - Industry standard: Slack and Discord use 30-60s TTL patterns
  //
  // Future enhancement (Week 2 Day 4-5 or Week 3): Database trigger + cron job
  // - See: decisions/cleanup_strategy_decision.md (Option C)
  // - Estimated latency: <10 seconds with zero security risk
  // - Implementation time: 2-3 hours

  return {
    presence: getPresenceForPR(prId),
    presenceCount: getPresenceCount(prId),
    sessionId: currentSessionId,
  };
}
