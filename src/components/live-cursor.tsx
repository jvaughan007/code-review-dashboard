"use client";

import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CursorPosition } from '@/lib/stores/cursor-store';

interface LiveCursorProps {
  cursor: CursorPosition;
}

/**
 * Linear interpolation helper for smooth cursor movement
 * @param start - Starting value
 * @param end - Target value
 * @param t - Interpolation factor (0 to 1)
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * LiveCursor - Renders a single user's cursor with smooth animation
 *
 * Features:
 * - 200ms lerp animation (60fps via requestAnimationFrame)
 * - Fade out after 2.5s of inactivity
 * - Automatic cleanup after 3s (handled by parent)
 * - React.memo optimization to prevent unnecessary re-renders
 *
 * Performance:
 * - Uses requestAnimationFrame for 60fps animation
 * - Memoized to only re-render when cursor data changes
 * - Proper cleanup of animation frames on unmount
 */
export const LiveCursor = memo<LiveCursorProps>(({ cursor }) => {
  const [position, setPosition] = useState({ x: cursor.x, y: cursor.y });
  const animationFrameRef = useRef<number | null>(null);
  const startPosRef = useRef({ x: cursor.x, y: cursor.y });
  const targetPosRef = useRef({ x: cursor.x, y: cursor.y });
  const startTimeRef = useRef(Date.now());

  // Update target position when cursor data changes
  useEffect(() => {
    startPosRef.current = position;
    targetPosRef.current = { x: cursor.x, y: cursor.y };
    startTimeRef.current = Date.now();
  }, [cursor.x, cursor.y, position]);

  // Animate cursor position with lerp (200ms smooth transition)
  useEffect(() => {
    const duration = 200; // 200ms lerp duration

    function animate() {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1); // Clamp to 0-1

      const newX = lerp(startPosRef.current.x, targetPosRef.current.x, t);
      const newY = lerp(startPosRef.current.y, targetPosRef.current.y, t);

      setPosition({ x: newX, y: newY });

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cursor.x, cursor.y]);

  // Calculate fade-out based on age
  const now = Date.now();
  const updatedAt = new Date(cursor.updated_at).getTime();
  const age = now - updatedAt;

  // Fade out starts at 8s (before 10s cleanup) - more gradual
  const fadeStart = 8000;
  const fadeEnd = 10000;
  const shouldFadeOut = age > fadeStart;
  const opacity = shouldFadeOut ? Math.max(0, 1 - (age - fadeStart) / (fadeEnd - fadeStart)) : 1;

  // Don't render stale cursors (>10s old)
  if (age > fadeEnd) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 100,
        willChange: 'transform, opacity',
      }}
      className="flex items-start gap-1"
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Username Label */}
      <div
        style={{
          backgroundColor: cursor.color,
        }}
        className="px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-md"
      >
        {cursor.username || 'Anonymous'}
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo optimization
  return (
    prevProps.cursor.x === nextProps.cursor.x &&
    prevProps.cursor.y === nextProps.cursor.y &&
    prevProps.cursor.session_id === nextProps.cursor.session_id &&
    prevProps.cursor.updated_at === nextProps.cursor.updated_at
  );
});

LiveCursor.displayName = 'LiveCursor';
