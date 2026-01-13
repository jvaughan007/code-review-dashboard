"use client";

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  useCursorStore,
  generateCursorColor,
  type CursorPosition,
} from '@/lib/stores/cursor-store';

/**
 * useCursors - Manages live cursor positions with database polling
 *
 * Features:
 * - Throttles cursor updates to max 60fps (16ms intervals)
 * - Polls database every 2 seconds for other users' cursors
 * - Assigns consistent color per user
 * - Automatically cleans up old cursors
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param filePath - Current file being viewed
 * @param sessionId - Current user's session ID
 * @param enabled - Whether to enable cursor tracking (default: true)
 */

interface UseCursorsOptions {
  prId: string;
  filePath: string;
  sessionId: string | null;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 2000)
  throttleDelay?: number; // ms (default: 200 = 5 updates/sec)
  spatialThreshold?: number; // px (default: 10 = require 10px movement)
  inactivityTimeout?: number; // ms (default: 10000 = 10 seconds)
}

export function useCursors({
  prId,
  filePath,
  sessionId,
  enabled = true,
  pollingInterval = 2000,
  throttleDelay = 200,
  spatialThreshold = 10,
  inactivityTimeout = 10000,
}: UseCursorsOptions) {
  const supabase = createClient();
  const { setCursors, updateCursor, getCursorsForFile, myColor, setMyColor } =
    useCursorStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const pendingUpdateRef = useRef<CursorPosition | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set cursor color on mount
  useEffect(() => {
    if (!myColor) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const username = user.user_metadata.user_name || user.email?.split('@')[0] || 'Anonymous';
          setMyColor(generateCursorColor(username));
        }
      });
    }
  }, [myColor, setMyColor, supabase]);

  // Clean up old cursors from previous sessions on mount
  useEffect(() => {
    if (!enabled || !sessionId) return;

    async function cleanupOldCursors() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('[CURSORS] Cleaning up old cursors for user:', user.id, 'session:', sessionId);

        // Delete any old cursors from this user's previous sessions
        // (Keep only the current session's cursor)
        const { data: deleted, error } = await supabase
          .from('cursors')
          .delete()
          .eq('user_id', user.id)
          .eq('file_path', filePath)
          .neq('session_id', sessionId)
          .select();

        if (error) {
          console.error('[CURSORS] Error cleaning up old cursors:', error);
        } else {
          console.log('[CURSORS] Deleted', deleted?.length || 0, 'old cursor(s)');
        }
      } catch (error) {
        console.error('Error cleaning up old cursors:', error);
      }
    }

    cleanupOldCursors();
  }, [enabled, sessionId, filePath, supabase]);

  // Poll for cursor updates
  useEffect(() => {
    if (!enabled || !prId || !filePath || !sessionId) {
      // Clear cursors if session not ready
      setCursors(prId, filePath, []);
      return;
    }

    async function pollCursors() {
      try {
        // Get current user to filter out ALL their cursors (not just current session)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[CURSORS] No user found for cursor polling');
          return;
        }

        console.log('[CURSORS] Polling cursors - excluding user_id:', user.id);

        // Fetch cursor positions (excluding ALL of current user's cursors)
        const { data: cursorsData, error: cursorsError } = await supabase
          .from('cursors')
          .select('*')
          .eq('pr_id', prId)
          .eq('file_path', filePath)
          .neq('user_id', user.id) // CRITICAL: Exclude ALL cursors from current user (all sessions/tabs)
          .gte('updated_at', new Date(Date.now() - inactivityTimeout).toISOString()); // Recent cursors only

        if (cursorsError) {
          console.error('[CURSORS] Error polling cursors:', cursorsError);
          return;
        }

        console.log('[CURSORS] Fetched', cursorsData?.length || 0, 'cursor(s):', cursorsData);

        if (!cursorsData || cursorsData.length === 0) {
          setCursors(prId, filePath, []);
          return;
        }

        // Fetch presence data for these sessions to get username/avatar
        const sessionIds = cursorsData.map((c) => c.session_id);
        const { data: presenceData, error: presenceError } = await supabase
          .from('presence')
          .select('session_id, username, avatar_url')
          .in('session_id', sessionIds);

        if (presenceError) {
          console.error('Error fetching presence for cursors:', presenceError);
          // Still show cursors, just without usernames
          setCursors(prId, filePath, cursorsData as CursorPosition[]);
          return;
        }

        // Merge cursor data with presence data
        const cursorsWithUsernames = cursorsData.map((cursor) => {
          const presence = presenceData?.find((p) => p.session_id === cursor.session_id);
          return {
            ...cursor,
            username: presence?.username || 'Anonymous',
            avatar_url: presence?.avatar_url || null,
          } as CursorPosition;
        });

        setCursors(prId, filePath, cursorsWithUsernames);
      } catch (error) {
        console.error('Error in cursor polling:', error);
      }
    }

    // Initial poll
    pollCursors();

    // Set up polling interval
    pollingRef.current = setInterval(pollCursors, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [prId, filePath, sessionId, enabled, pollingInterval, inactivityTimeout, supabase, setCursors]);

  // Update cursor position (dual throttled: spatial + temporal)
  const updateCursorPosition = useCallback(
    async (x: number, y: number, lineNumber: number | null = null) => {
      if (!enabled || !sessionId || !myColor) return;

      // ALWAYS reset inactivity timer on any mouse movement (even if throttled)
      // This prevents cursor from disappearing while user is actively moving
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(async () => {
        // Remove cursor after inactivity timeout
        try {
          await supabase
            .from('cursors')
            .delete()
            .eq('session_id', sessionId)
            .eq('file_path', filePath);
        } catch (error) {
          console.error('Error removing cursor after inactivity:', error);
        }
      }, inactivityTimeout);

      const now = Date.now();
      const lastUpdate = lastUpdateRef.current;

      // Spatial throttling: Check if moved >10px
      const dx = Math.abs(x - lastUpdate.x);
      const dy = Math.abs(y - lastUpdate.y);
      const movedEnough = dx > spatialThreshold || dy > spatialThreshold;

      // Temporal throttling: Check if >200ms passed
      const timePassed = now - lastUpdate.time > throttleDelay;

      if (!movedEnough || !timePassed) {
        // Store pending update
        pendingUpdateRef.current = {
          id: '',
          session_id: sessionId,
          user_id: '',
          pr_id: prId,
          file_path: filePath,
          x,
          y,
          line_number: lineNumber,
          color: myColor,
          updated_at: new Date().toISOString(),
        };
        return;
      }

      // Update last position
      lastUpdateRef.current = { x, y, time: now };

      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const cursorData = pendingUpdateRef.current || {
          x,
          y,
          line_number: lineNumber,
        };

        // CRITICAL: Do NOT call updateCursor() for own cursor
        // Optimistic updates would show your own cursor before polling filters it out
        // Only write to database, let polling handle displaying remote cursors

        // Update database only
        await supabase
          .from('cursors')
          .upsert(
            {
              session_id: sessionId,
              user_id: user.user.id,
              pr_id: prId,
              file_path: filePath,
              x: cursorData.x,
              y: cursorData.y,
              line_number: cursorData.line_number,
              color: myColor,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'session_id,file_path',
            }
          );

        pendingUpdateRef.current = null;
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    },
    [enabled, sessionId, myColor, prId, filePath, throttleDelay, spatialThreshold, inactivityTimeout, updateCursor, supabase]
  );

  // Cleanup cursor on unmount
  useEffect(() => {
    return () => {
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (!sessionId || !filePath) return;

      // Async cleanup
      (async () => {
        try {
          await supabase
            .from('cursors')
            .delete()
            .eq('session_id', sessionId)
            .eq('file_path', filePath);
        } catch (error) {
          console.error('Error cleaning up cursor:', error);
        }
      })();
    };
  }, [sessionId, filePath, supabase]);

  return {
    cursors: getCursorsForFile(prId, filePath),
    updateCursorPosition,
    myColor: myColor || '#FF6B6B',
  };
}
