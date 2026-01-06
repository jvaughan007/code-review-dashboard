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
  throttleDelay?: number; // ms (default: 16 = 60fps)
}

export function useCursors({
  prId,
  filePath,
  sessionId,
  enabled = true,
  pollingInterval = 2000,
  throttleDelay = 16,
}: UseCursorsOptions) {
  const supabase = createClient();
  const { setCursors, updateCursor, getCursorsForFile, myColor, setMyColor } =
    useCursorStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pendingUpdateRef = useRef<CursorPosition | null>(null);

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
        const { data, error } = await supabase
          .from('cursors')
          .select('*')
          .eq('pr_id', prId)
          .eq('file_path', filePath)
          .neq('session_id', sessionId) // Exclude own cursor
          .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

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
  }, [prId, filePath, sessionId, enabled, pollingInterval, supabase, setCursors]);

  // Update cursor position (throttled)
  const updateCursorPosition = useCallback(
    async (x: number, y: number, lineNumber: number | null = null) => {
      if (!enabled || !sessionId || !myColor) return;

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Throttle updates
      if (timeSinceLastUpdate < throttleDelay) {
        // Store pending update
        pendingUpdateRef.current = {
          id: '', // Will be set by database
          session_id: sessionId,
          user_id: '', // Will be set by database
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

      lastUpdateRef.current = now;

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
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    },
    [enabled, sessionId, myColor, prId, filePath, throttleDelay, updateCursor, supabase]
  );

  // Cleanup cursor on unmount
  useEffect(() => {
    return () => {
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
