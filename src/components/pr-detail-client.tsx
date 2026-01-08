"use client";

import { useEffect } from 'react';
import { usePresence } from '@/lib/hooks/use-presence';
import { useCursors } from '@/lib/hooks/use-cursors';
import { CursorsLayer } from '@/components/cursors-layer';

interface PRDetailClientProps {
  prId: string;
}

/**
 * PRDetailClient - Client-side wrapper for PR detail page real-time features
 *
 * Integrates:
 * - Presence tracking (already working)
 * - Live cursors (new integration)
 *
 * Architecture:
 * - Uses sessionId from presence store for cursor coordination
 * - Tracks mouse position on the entire document
 * - Renders cursors layer as absolute overlay
 *
 * Performance:
 * - Throttled cursor updates (200ms, 10px threshold)
 * - Polling every 2s for remote cursors
 * - Proper cleanup on unmount
 */
export function PRDetailClient({ prId }: PRDetailClientProps) {
  // Get sessionId from presence hook
  const { sessionId } = usePresence({ prId, enabled: true });

  // Set up live cursors (use "overview" as default filePath for PR overview page)
  const { cursors, updateCursorPosition } = useCursors({
    prId,
    filePath: 'overview', // For PR overview; could be dynamic for file-specific views
    sessionId,
    enabled: true,
  });

  // Track mouse movement on the entire document
  useEffect(() => {
    if (!sessionId) return; // Don't track until we have a session

    function handleMouseMove(e: MouseEvent) {
      // Get coordinates relative to viewport (since cursors are rendered in viewport)
      const x = e.clientX;
      const y = e.clientY;

      updateCursorPosition(x, y, null);
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [updateCursorPosition, sessionId]);

  return (
    <>
      {/* Live cursors overlay - fixed positioning to cover viewport */}
      <CursorsLayer cursors={cursors} />
    </>
  );
}
