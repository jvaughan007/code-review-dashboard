"use client";

import { memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LiveCursor } from './live-cursor';
import type { CursorPosition } from '@/lib/stores/cursor-store';

interface CursorsLayerProps {
  cursors: CursorPosition[];
}

/**
 * CursorsLayer - Container for all live cursors
 *
 * Features:
 * - Absolute positioning overlay for cursor rendering
 * - AnimatePresence for smooth cursor enter/exit animations
 * - Filters out stale cursors (>3s old)
 * - React.memo optimization to prevent unnecessary re-renders
 *
 * Usage:
 * ```tsx
 * const { cursors } = useCursors({ prId, filePath, sessionId });
 *
 * <div className="relative" ref={containerRef}>
 *   <CursorsLayer cursors={cursors} />
 *   {/* Your content *\/}
 * </div>
 * ```
 *
 * Architecture:
 * - Renders as absolute overlay (full viewport coverage)
 * - Each cursor is positioned absolutely within this layer
 * - Parent container should have position: relative
 */
export const CursorsLayer = memo<CursorsLayerProps>(({ cursors }) => {
  // Filter out stale cursors (>3s old)
  const now = Date.now();
  const activeCursors = cursors.filter((cursor) => {
    const age = now - new Date(cursor.updated_at).getTime();
    return age <= 3000;
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 999,
        willChange: 'contents',
      }}
      role="presentation"
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout">
        {activeCursors.map((cursor) => (
          <LiveCursor key={cursor.session_id} cursor={cursor} />
        ))}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo optimization
  // Only re-render if cursor count changes or cursor data changes
  if (prevProps.cursors.length !== nextProps.cursors.length) {
    return false;
  }

  // Check if any cursor position or timestamp changed
  for (let i = 0; i < prevProps.cursors.length; i++) {
    const prev = prevProps.cursors[i];
    const next = nextProps.cursors[i];

    if (
      prev.x !== next.x ||
      prev.y !== next.y ||
      prev.session_id !== next.session_id ||
      prev.updated_at !== next.updated_at
    ) {
      return false;
    }
  }

  return true;
});

CursorsLayer.displayName = 'CursorsLayer';
