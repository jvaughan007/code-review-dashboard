# Live Cursors Implementation Guide - Week 2 Day 3

**Author**: Frontend Developer Specialist
**Date**: 2026-01-07
**Project**: Code Review Dashboard - Real-Time Collaboration
**Context**: Database polling architecture (no WebSockets), zero-cost requirement

---

## Executive Summary

This document provides a complete implementation strategy for the live cursors feature using **database polling** instead of WebSockets, maintaining the zero-cost Supabase free tier requirement.

**Key Challenge**: Achieve smooth cursor animations despite 1-3 second polling intervals.

**Solution**: Client-side linear interpolation (lerp) + optimistic updates + spatial/temporal throttling.

---

## 1. Architecture Overview

### Data Flow

```
User Mouse Movement (60fps)
  ↓ Throttle (spatial + temporal)
Database Update (~1-2 seconds)
  ↓ Polling (1-2 seconds)
Other Clients Fetch Updates
  ↓ Lerp Animation (smooth 60fps)
Render Cursors (smooth appearance)
```

### Polling Strategy Recommendation

**Recommended: 2-second polling interval**

**Rationale**:
- 1s polling: 3600 requests/hour per user (too aggressive, might hit free tier limits)
- 2s polling: 1800 requests/hour per user (sweet spot)
- 3s polling: 1200 requests/hour per user (too laggy for live cursors)

**Free Tier Budget**:
- Supabase free tier: 500 MB bandwidth/month
- Average cursor payload: ~200 bytes
- 1800 requests/hour × 200 bytes = 360 KB/hour
- 360 KB × 24 hours × 30 days = 259 MB/month (within budget for 1 user)
- **5 concurrent users = still within free tier**

---

## 2. Database Schema (Already Exists)

```sql
-- From migration 001_create_realtime_schema.sql
CREATE TABLE cursors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES pr_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  x INTEGER NOT NULL,           -- X coordinate (px)
  y INTEGER NOT NULL,           -- Y coordinate (px)
  line_number INTEGER,          -- Which line cursor is on
  color TEXT NOT NULL,          -- Cursor color (hex)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cursors_unique UNIQUE (session_id, file_path)
);
```

**Key Points**:
- `x`, `y` are absolute pixel coordinates (we'll convert to percentages client-side)
- `updated_at` tracks last movement (for 3-second inactivity timeout)
- `UNIQUE (session_id, file_path)` prevents duplicate cursors per user per file

---

## 3. Implementation: Hook Design (`use-cursors.ts`)

### 3.1 Throttling Strategy

**Problem**: Mouse moves at 60fps (16ms), but we can't update DB 60 times/second.

**Solution**: Dual throttling
1. **Temporal Throttling**: Only update DB every 200ms (5 updates/second)
2. **Spatial Throttling**: Only update if cursor moved >10px (prevents jitter)

### 3.2 Coordinate Translation

**Problem**: Absolute `clientX/clientY` breaks on scroll/resize.

**Solution**: Container-relative percentages
```typescript
// Convert mouse position to percentage of container
const rect = container.getBoundingClientRect();
const xPercent = ((clientX - rect.left) / rect.width) * 100;
const yPercent = ((clientY - rect.top) / rect.height) * 100;
```

**Database Storage**: Store absolute pixels (easier to debug, no precision loss)
**Client Rendering**: Convert back to percentages for display

### 3.3 Hook Implementation Skeleton

```typescript
// src/lib/hooks/use-cursors.ts
"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCursorsStore, type Cursor } from '@/lib/stores/cursors-store';

interface UseCursorsOptions {
  prId: string;
  filePath: string;
  enabled?: boolean;
  pollingInterval?: number;     // Recommended: 2000ms
  updateThrottle?: number;       // Recommended: 200ms
  spatialThreshold?: number;     // Recommended: 10px
  inactivityTimeout?: number;    // Recommended: 3000ms
}

export function useCursors({
  prId,
  filePath,
  enabled = true,
  pollingInterval = 2000,
  updateThrottle = 200,
  spatialThreshold = 10,
  inactivityTimeout = 3000,
}: UseCursorsOptions) {
  const supabase = createClient();
  const {
    setCursors,
    addCursor,
    removeCursor,
    getCursorsForFile,
    currentSessionId
  } = useCursorsStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastUpdateRef = useRef<{ x: number; y: number; time: number }>({
    x: 0,
    y: 0,
    time: 0,
  });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse movement and update database
  useEffect(() => {
    if (!enabled || !containerRef.current || !currentSessionId) return;

    const container = containerRef.current;

    async function handleMouseMove(e: MouseEvent) {
      const now = Date.now();
      const lastUpdate = lastUpdateRef.current;

      // Spatial throttling: Check if moved >10px
      const dx = Math.abs(e.clientX - lastUpdate.x);
      const dy = Math.abs(e.clientY - lastUpdate.y);
      const movedEnough = dx > spatialThreshold || dy > spatialThreshold;

      // Temporal throttling: Check if >200ms passed
      const timePassed = now - lastUpdate.time > updateThrottle;

      if (!movedEnough || !timePassed) return;

      // Update last position
      lastUpdateRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: now,
      };

      // Get container-relative coordinates
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Detect line number (assuming line height of 20px)
      const lineNumber = Math.floor(y / 20) + 1;

      try {
        // Update database (upsert)
        await supabase
          .from('cursors')
          .upsert({
            session_id: currentSessionId,
            pr_id: prId,
            file_path: filePath,
            x: Math.floor(x),
            y: Math.floor(y),
            line_number: lineNumber,
            color: '#3b82f6', // Blue (TODO: get from user color)
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'session_id,file_path',
          });

        // Optimistic update (instant local feedback)
        addCursor({
          id: currentSessionId, // Temporary ID
          session_id: currentSessionId,
          user_id: '', // Will be filled by polling
          pr_id: prId,
          file_path: filePath,
          x: Math.floor(x),
          y: Math.floor(y),
          line_number: lineNumber,
          color: '#3b82f6',
          updated_at: new Date().toISOString(),
          username: 'You', // Will be replaced by polling
        });

        // Reset inactivity timer
        resetInactivityTimer();
      } catch (error) {
        console.error('Error updating cursor:', error);
      }
    }

    // Inactivity detection
    function resetInactivityTimer() {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(async () => {
        // Remove cursor after 3s inactivity
        try {
          await supabase
            .from('cursors')
            .delete()
            .eq('session_id', currentSessionId)
            .eq('file_path', filePath);

          removeCursor(currentSessionId);
        } catch (error) {
          console.error('Error removing cursor:', error);
        }
      }, inactivityTimeout);
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', () => {
      // Immediately remove cursor when leaving container
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [enabled, currentSessionId, prId, filePath, supabase, addCursor, removeCursor, spatialThreshold, updateThrottle, inactivityTimeout]);

  // Poll for cursor updates from other users
  useEffect(() => {
    if (!enabled || !currentSessionId) return;

    async function pollCursors() {
      try {
        const { data, error } = await supabase
          .from('cursors')
          .select(`
            *,
            pr_sessions!inner(
              user_id,
              users:auth.users(
                user_metadata
              )
            )
          `)
          .eq('pr_id', prId)
          .eq('file_path', filePath)
          .neq('session_id', currentSessionId) // Exclude own cursor
          .gte('updated_at', new Date(Date.now() - inactivityTimeout).toISOString()); // Last 3 seconds

        if (error) {
          console.error('Error polling cursors:', error);
          return;
        }

        // Transform data to include username
        const cursors = (data || []).map((cursor: any) => ({
          ...cursor,
          username: cursor.pr_sessions?.users?.user_metadata?.user_name || 'Anonymous',
        }));

        setCursors(prId, filePath, cursors);
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
  }, [enabled, currentSessionId, prId, filePath, pollingInterval, inactivityTimeout, supabase, setCursors]);

  return {
    containerRef,
    cursors: getCursorsForFile(prId, filePath),
  };
}
```

---

## 4. Implementation: Store Design (`cursors-store.ts`)

### 4.1 Store Pattern (Following presence-store.ts)

```typescript
// src/lib/stores/cursors-store.ts
import { create } from 'zustand';

export interface Cursor {
  id: string;
  session_id: string;
  user_id: string;
  pr_id: string;
  file_path: string;
  x: number;                    // Absolute pixels
  y: number;                    // Absolute pixels
  line_number: number | null;
  color: string;                // Hex color
  updated_at: string;
  username?: string;            // Joined from pr_sessions
}

interface CursorsState {
  // Cursors by PR ID, then by file path
  cursorsByPR: Record<string, Record<string, Cursor[]>>;

  // Current user's session ID
  currentSessionId: string | null;

  // Actions
  setCursors: (prId: string, filePath: string, cursors: Cursor[]) => void;
  addCursor: (cursor: Cursor) => void;
  removeCursor: (sessionId: string) => void;
  updateCursor: (sessionId: string, updates: Partial<Cursor>) => void;
  setCurrentSessionId: (sessionId: string | null) => void;

  // Helpers
  getCursorsForFile: (prId: string, filePath: string) => Cursor[];
  getCursorCount: (prId: string, filePath: string) => number;
}

export const useCursorsStore = create<CursorsState>((set, get) => ({
  cursorsByPR: {},
  currentSessionId: null,

  setCursors: (prId, filePath, cursors) =>
    set((state) => ({
      cursorsByPR: {
        ...state.cursorsByPR,
        [prId]: {
          ...(state.cursorsByPR[prId] || {}),
          [filePath]: cursors,
        },
      },
    })),

  addCursor: (cursor) =>
    set((state) => {
      const prCursors = state.cursorsByPR[cursor.pr_id] || {};
      const existing = prCursors[cursor.file_path] || [];
      const alreadyExists = existing.some((c) => c.session_id === cursor.session_id);

      if (alreadyExists) {
        // Update existing cursor
        return {
          cursorsByPR: {
            ...state.cursorsByPR,
            [cursor.pr_id]: {
              ...prCursors,
              [cursor.file_path]: existing.map((c) =>
                c.session_id === cursor.session_id ? cursor : c
              ),
            },
          },
        };
      }

      // Add new cursor
      return {
        cursorsByPR: {
          ...state.cursorsByPR,
          [cursor.pr_id]: {
            ...prCursors,
            [cursor.file_path]: [...existing, cursor],
          },
        },
      };
    }),

  removeCursor: (sessionId) =>
    set((state) => {
      const newCursorsByPR = { ...state.cursorsByPR };

      // Remove cursor from all PRs and files
      Object.keys(newCursorsByPR).forEach((prId) => {
        Object.keys(newCursorsByPR[prId]).forEach((filePath) => {
          newCursorsByPR[prId][filePath] = newCursorsByPR[prId][filePath].filter(
            (c) => c.session_id !== sessionId
          );
        });
      });

      return { cursorsByPR: newCursorsByPR };
    }),

  updateCursor: (sessionId, updates) =>
    set((state) => {
      const newCursorsByPR = { ...state.cursorsByPR };

      Object.keys(newCursorsByPR).forEach((prId) => {
        Object.keys(newCursorsByPR[prId]).forEach((filePath) => {
          newCursorsByPR[prId][filePath] = newCursorsByPR[prId][filePath].map((c) =>
            c.session_id === sessionId ? { ...c, ...updates } : c
          );
        });
      });

      return { cursorsByPR: newCursorsByPR };
    }),

  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

  // Helpers
  getCursorsForFile: (prId, filePath) => {
    return get().cursorsByPR[prId]?.[filePath] || [];
  },

  getCursorCount: (prId, filePath) => {
    return get().getCursorsForFile(prId, filePath).length;
  },
}));
```

---

## 5. Implementation: Component Design

### 5.1 LiveCursor Component (Single Cursor)

**Goal**: Render a single teammate's cursor with smooth animation.

**Key Feature**: Linear interpolation (lerp) to smooth out 2-second polling intervals.

```typescript
// src/components/live-cursor.tsx
"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Cursor } from '@/lib/stores/cursors-store';

interface LiveCursorProps {
  cursor: Cursor;
  containerRect: DOMRect; // For coordinate translation
}

// Linear interpolation helper
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export const LiveCursor = memo<LiveCursorProps>(({ cursor, containerRect }) => {
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
  }, [cursor.x, cursor.y]);

  // Animate cursor position with lerp
  useEffect(() => {
    const duration = 200; // 200ms lerp duration (smooth animation)

    function animate() {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1); // 0 to 1

      const newX = lerp(startPosRef.current.x, targetPosRef.current.x, t);
      const newY = lerp(startPosRef.current.y, targetPosRef.current.y, t);

      setPosition({ x: newX, y: newY });

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cursor.x, cursor.y]);

  // Check if cursor is stale (>3s old)
  const isStale = Date.now() - new Date(cursor.updated_at).getTime() > 3000;

  if (isStale) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 100,
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
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* Username Label */}
      <div
        style={{
          backgroundColor: cursor.color,
        }}
        className="px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
      >
        {cursor.username || 'Anonymous'}
      </div>
    </motion.div>
  );
});

LiveCursor.displayName = 'LiveCursor';
```

### 5.2 CursorsLayer Component (Container)

**Goal**: Overlay all cursors on the code diff container.

```typescript
// src/components/cursors-layer.tsx
"use client";

import React, { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LiveCursor } from './live-cursor';
import type { Cursor } from '@/lib/stores/cursors-store';

interface CursorsLayerProps {
  cursors: Cursor[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export const CursorsLayer = memo<CursorsLayerProps>(({ cursors, containerRef }) => {
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  // Update container rect on resize/scroll
  useEffect(() => {
    if (!containerRef.current) return;

    function updateRect() {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    }

    updateRect();

    // Listen for resize and scroll
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [containerRef]);

  if (!containerRect) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {cursors.map((cursor) => (
          <LiveCursor
            key={cursor.session_id}
            cursor={cursor}
            containerRect={containerRect}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

CursorsLayer.displayName = 'CursorsLayer';
```

### 5.3 Usage in PR Page

```typescript
// src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx
"use client";

import { useCursors } from '@/lib/hooks/use-cursors';
import { CursorsLayer } from '@/components/cursors-layer';

export default function PullRequestPage({ params }: { params: { owner: string; repo: string; number: string } }) {
  const prId = `${params.owner}/${params.repo}/${params.number}`;
  const filePath = 'src/index.ts'; // TODO: Get from current file

  const { containerRef, cursors } = useCursors({
    prId,
    filePath,
    enabled: true,
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Code diff content */}
      <pre className="p-4">
        {/* Your diff rendering code */}
      </pre>

      {/* Live cursors overlay */}
      <CursorsLayer cursors={cursors} containerRef={containerRef} />
    </div>
  );
}
```

---

## 6. Performance Optimizations

### 6.1 React.memo Usage

**Components to Memoize**:
- `LiveCursor` - Prevents re-render when other cursors update
- `CursorsLayer` - Only re-renders when cursors array changes

**Why It Matters**:
- With 5 active cursors, each polling update would trigger 5 component re-renders
- React.memo reduces this to only cursors that actually moved

### 6.2 Preventing Memory Leaks

**Cleanup Checklist**:
- ✅ Clear polling intervals on unmount
- ✅ Cancel animation frames on unmount
- ✅ Remove event listeners on unmount
- ✅ Clear inactivity timers on unmount

**Code Pattern**:
```typescript
useEffect(() => {
  // Setup
  const interval = setInterval(pollCursors, 2000);

  return () => {
    // Cleanup
    clearInterval(interval);
  };
}, []);
```

### 6.3 Optimizing Database Queries

**Indexes** (already exist in migration):
```sql
CREATE INDEX idx_cursors_pr_file ON cursors(pr_id, file_path);
CREATE INDEX idx_cursors_updated ON cursors(updated_at);
```

**Query Optimization**:
```typescript
// GOOD: Filter in database
.gte('updated_at', new Date(Date.now() - 3000).toISOString())

// BAD: Filter in JavaScript
const recentCursors = cursors.filter(c => Date.now() - new Date(c.updated_at).getTime() < 3000);
```

---

## 7. Animation Strategy Deep Dive

### 7.1 Why Linear Interpolation (Lerp)?

**Problem**: Polling every 2 seconds creates jumpy cursor movement.

**Solution**: Lerp smoothly transitions from old position to new position over 200ms.

**Visual Comparison**:
```
Without Lerp:
Cursor at (0, 0) ─────────────────────────► jumps to (100, 100) [2 seconds later]
                         (jarring)

With Lerp:
Cursor at (0, 0) ──► (25, 25) ──► (50, 50) ──► (75, 75) ──► (100, 100)
                   [smooth 60fps animation over 200ms]
```

### 7.2 Lerp Math Explained

```typescript
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Example:
// start = 0, end = 100, t = 0.5 (50% progress)
// result = 0 + (100 - 0) * 0.5 = 50
```

**`t` (time factor)**: 0 = start position, 1 = end position
- At 0ms: t = 0.0 → cursor at start
- At 100ms: t = 0.5 → cursor at midpoint
- At 200ms: t = 1.0 → cursor at target

### 7.3 Alternative: Framer Motion Animate

**Option 1: Manual Lerp (Recommended)**
```typescript
// Pros: Full control, no extra dependencies
// Cons: More code
useEffect(() => {
  const animate = () => {
    const t = elapsed / duration;
    setPosition({ x: lerp(startX, endX, t), y: lerp(startY, endY, t) });
  };
  requestAnimationFrame(animate);
}, [cursor.x, cursor.y]);
```

**Option 2: Framer Motion (Alternative)**
```typescript
// Pros: Less code, declarative
// Cons: Slight performance overhead
<motion.div
  animate={{ x: cursor.x, y: cursor.y }}
  transition={{ duration: 0.2, ease: 'linear' }}
/>
```

**Verdict**: Use manual lerp for maximum performance (cursors update frequently).

---

## 8. Testing Strategy

### 8.1 Multi-Window Testing

**Setup**:
1. Open PR page in 2 browser windows (different users)
2. Position windows side-by-side
3. Move cursor in Window 1
4. Observe cursor appearing in Window 2 after ~2 seconds

**Expected Behavior**:
- Cursor appears within 2-3 seconds
- Movement is smooth (no jank)
- Cursor disappears after 3s of inactivity
- Cursor follows mouse in real-time in Window 1 (optimistic update)

### 8.2 Performance Benchmarks

**Metrics to Track**:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cursor update latency | <3s | Time from mouse move to cursor appearing in other window |
| Animation smoothness | 60fps | Chrome DevTools Performance tab (no frame drops) |
| Database requests/hour | <2000 | Supabase dashboard analytics |
| Memory usage | <10MB | Chrome DevTools Memory profiler |
| Cursor cleanup latency | <3.5s | Time from last movement to cursor disappearing |

**Load Testing**:
```typescript
// Simulate 10 concurrent users
const users = Array.from({ length: 10 }, (_, i) => ({
  username: `User${i}`,
  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
}));

// Measure render time
console.time('render-10-cursors');
render(<CursorsLayer cursors={users} />);
console.timeEnd('render-10-cursors');
// Target: <16ms (60fps)
```

### 8.3 Browser DevTools Checklist

**Chrome DevTools → Performance**:
1. Start recording
2. Move mouse around code diff
3. Stop recording after 10 seconds
4. Look for:
   - ✅ 60fps (no red bars in timeline)
   - ✅ No long tasks (>50ms)
   - ✅ No memory leaks (heap size stable)

**Chrome DevTools → Network**:
1. Filter by "cursors"
2. Move mouse for 60 seconds
3. Count requests
4. Expected: ~30 requests (1 every 2 seconds × 30 seconds)

---

## 9. Edge Cases & Error Handling

### 9.1 Edge Case: Container Scroll

**Problem**: Cursor position breaks when container scrolls.

**Solution**: Use `position: absolute` within container, not viewport.

```typescript
// GOOD: Relative to container
const rect = container.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

// BAD: Relative to viewport (breaks on scroll)
const x = e.clientX;
const y = e.clientY;
```

### 9.2 Edge Case: Rapid Mouse Movement

**Problem**: User moves mouse very fast, cursor lags behind.

**Solution**: Spatial throttling ensures cursor updates every 10px movement.

```typescript
const dx = Math.abs(e.clientX - lastUpdate.x);
const dy = Math.abs(e.clientY - lastUpdate.y);
const movedEnough = dx > 10 || dy > 10; // Update if moved >10px
```

### 9.3 Edge Case: Database Update Failure

**Problem**: Network error prevents cursor update from saving.

**Solution**: Retry with exponential backoff.

```typescript
async function updateCursorWithRetry(cursor: Cursor, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await supabase.from('cursors').upsert(cursor);
      return; // Success
    } catch (error) {
      if (i === retries - 1) throw error; // Final attempt failed
      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 100)); // 100ms, 200ms, 400ms
    }
  }
}
```

### 9.4 Edge Case: Stale Cursors

**Problem**: User closes tab without cleanup, cursor stays in database.

**Solution**: Server-side cleanup function (already exists in migration).

```sql
-- Run every 5 minutes via cron job
DELETE FROM cursors
WHERE updated_at < NOW() - INTERVAL '5 minutes';
```

---

## 10. Color Assignment Strategy

### 10.1 Generate Unique Colors per User

**Option 1: Hash Username to Color**
```typescript
function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`; // Vibrant colors
}

// Example:
// hashStringToColor('alice') → '#e74c3c' (red)
// hashStringToColor('bob')   → '#3498db' (blue)
```

**Option 2: Predefined Color Palette**
```typescript
const CURSOR_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#8b5cf6', // purple
  '#ec4899', // pink
];

function getUserColor(userId: string): string {
  const index = parseInt(userId.slice(-2), 16) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}
```

**Recommendation**: Use Option 1 (hash) for unlimited users, Option 2 (palette) for guaranteed distinct colors.

---

## 11. Accessibility Considerations

### 11.1 Reduce Motion Preference

**Problem**: Users with vestibular disorders may be sensitive to cursor animations.

**Solution**: Respect `prefers-reduced-motion`.

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = prefersReducedMotion ? 0 : 200; // Instant if reduced motion
```

### 11.2 Screen Reader Announcements

**Problem**: Screen reader users can't see live cursors.

**Solution**: Announce cursor movements via `aria-live`.

```typescript
<div aria-live="polite" className="sr-only">
  {cursors.map(c => `${c.username} is at line ${c.line_number}`).join(', ')}
</div>
```

---

## 12. Implementation Checklist

### Phase 1: Core Functionality (2-3 hours)
- [ ] Create `cursors-store.ts` (Zustand store)
- [ ] Create `use-cursors.ts` (hook with polling)
- [ ] Implement throttling (spatial + temporal)
- [ ] Implement coordinate translation
- [ ] Test with console.log (verify DB updates)

### Phase 2: UI Components (1-2 hours)
- [ ] Create `LiveCursor.tsx` (single cursor)
- [ ] Implement lerp animation
- [ ] Create `CursorsLayer.tsx` (container)
- [ ] Add Framer Motion animations (fade in/out)
- [ ] Test with 2 browser windows

### Phase 3: Polish & Optimization (1 hour)
- [ ] Add color assignment (hash username)
- [ ] Implement inactivity timeout (3s)
- [ ] Add React.memo to components
- [ ] Test cleanup (clear intervals, timers)
- [ ] Verify no memory leaks (DevTools)

### Phase 4: Testing & Benchmarks (30 minutes)
- [ ] Multi-window test (2+ users)
- [ ] Performance profiling (60fps target)
- [ ] Database request count (<2000/hour)
- [ ] Edge case testing (scroll, rapid movement)

---

## 13. Known Limitations & Future Enhancements

### Current Limitations (Accept for MVP)
1. **2-second latency**: Cursors appear 2s after movement (acceptable for free tier)
2. **No viewport awareness**: Cursors visible even if outside viewport (optimization for later)
3. **Single file tracking**: Can't see cursors across multiple files (feature for later)
4. **No cursor trails**: Cursor jumps from A to B (smooth path requires WebSockets)

### Future Enhancements (Week 3+)
1. **WebSocket upgrade**: Reduce latency to <100ms (paid tier)
2. **Cursor trails**: Draw path from old to new position
3. **Viewport filtering**: Only render cursors in visible area
4. **Multi-file cursors**: Show cursors across all files in PR
5. **Cursor labels**: "Reviewing line 42", "Adding comment"

---

## 14. Recommended File Structure

```
src/
├── lib/
│   ├── hooks/
│   │   └── use-cursors.ts              (cursor tracking hook)
│   └── stores/
│       └── cursors-store.ts            (Zustand store)
├── components/
│   ├── live-cursor.tsx                 (single cursor component)
│   └── cursors-layer.tsx               (cursors container)
└── app/
    └── repositories/[owner]/[repo]/pull/[number]/
        └── page.tsx                    (usage example)
```

---

## 15. Final Recommendations

### Polling Interval Decision

**Recommended: 2 seconds**

| Interval | Pros | Cons |
|----------|------|------|
| 1s | Faster updates | 3600 req/hr (may hit limits) |
| **2s** | **Good balance** | **1800 req/hr (safe)** |
| 3s | Lowest load | Too laggy for cursors |

### Animation Strategy Decision

**Recommended: Manual lerp with requestAnimationFrame**

**Why**:
- Full control over animation timing
- No external dependencies (Framer Motion already installed for fade in/out)
- Best performance for high-frequency updates

### Coordinate System Decision

**Recommended: Store absolute pixels, render as container-relative**

**Why**:
- Database stores exact mouse position (easier to debug)
- Client converts to percentages for scroll/resize resilience
- No precision loss from storing percentages

---

## 16. Code Review Checklist

Before merging, verify:

**Functionality**:
- [ ] Cursors appear in other windows within 3 seconds
- [ ] Cursor movement is smooth (no jank)
- [ ] Cursors disappear after 3s of inactivity
- [ ] Own cursor not visible (filtered by session_id)
- [ ] Cursor color is unique per user

**Performance**:
- [ ] 60fps maintained (Chrome DevTools Performance)
- [ ] <2000 database requests/hour
- [ ] No memory leaks (heap size stable)
- [ ] React components memoized (LiveCursor, CursorsLayer)

**Cleanup**:
- [ ] All intervals cleared on unmount
- [ ] All event listeners removed on unmount
- [ ] All timers cleared on unmount
- [ ] Animation frames cancelled on unmount

**Edge Cases**:
- [ ] Container scroll doesn't break positions
- [ ] Rapid mouse movement handled gracefully
- [ ] Database errors don't crash app
- [ ] Stale cursors cleaned up server-side

---

## 17. Success Metrics

**Week 2 Day 3 Complete When**:
1. ✅ Open PR in 2 browser windows
2. ✅ Move mouse in Window 1
3. ✅ Cursor appears in Window 2 within 3 seconds
4. ✅ Cursor is smooth (no jank)
5. ✅ Cursor disappears after 3s of inactivity
6. ✅ Performance: 60fps, <2000 req/hr, <10MB memory

**Demo Script**:
> "Watch this. I'm moving my cursor in this window [Window 1]. Within 2-3 seconds, you'll see it appear in this other window [Window 2]. Notice how smooth the animation is, even though we're only polling the database every 2 seconds. That's the magic of linear interpolation. Now watch what happens when I stop moving for 3 seconds... and the cursor fades out. That's our inactivity timeout working perfectly."

---

**End of Implementation Guide**

**Total Estimated Time**: 5-7 hours
- Hook implementation: 2-3 hours
- Component implementation: 1-2 hours
- Testing & polish: 1-2 hours
- Documentation: 1 hour

**Next Steps**:
1. Copy skeleton code from this document
2. Implement `cursors-store.ts` first (foundation)
3. Implement `use-cursors.ts` second (logic)
4. Implement components third (UI)
5. Test with 2 browser windows
6. Optimize based on performance profiling

**Questions?** Refer to `use-presence.ts` as reference pattern - cursors follow the same polling architecture.
