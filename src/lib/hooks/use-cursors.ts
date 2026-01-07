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
  inactivityTimeout?: number; // ms (default: 3000 = 3 seconds)
}

export function useCursors({
  prId,
  filePath,
  sessionId,
  enabled = true,
  pollingInterval = 2000,
  throttleDelay = 200,
  spatialThreshold = 10,
  inactivityTimeout = 3000,
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

  // Poll for cursor updates
  useEffect(() => {
    if (!enabled || !prId || !filePath || !sessionId) return;

    async function pollCursors() {
      try {
        const { data, error} = await supabase
          .from('cursors')
          .select('*')
          .eq('pr_id', prId)
          .eq('file_path', filePath)
          .neq('session_id', sessionId) // Exclude own cursor
          .gte('updated_at', new Date(Date.now() - inactivityTimeout).toISOString()); // Last 3 seconds

        if (error) {
          console.error('Error polling cursors:', error);
          return;
        }

        setCursors(prId, filePath, data as CursorPosition[]);
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
          id: '',
          session_id: sessionId,
          user_id: user.user.id,
          pr_id: prId,
          file_path: filePath,
          x,
          y,
          line_number: lineNumber,
          color: myColor,
          updated_at: new Date().toISOString(),
        };

        // Optimistically update local store
        updateCursor(cursorData);

        // Update database
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

        // Reset inactivity timer
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
