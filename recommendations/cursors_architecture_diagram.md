# Live Cursors Architecture - Visual Diagrams

**Visual reference for understanding the cursors implementation**

---

## 1. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User's Browser                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Mouse Movement Event (60fps, ~16ms intervals)                      │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Throttle Filter                  │                             │
│  │  • Spatial: >10px movement        │                             │
│  │  • Temporal: >200ms elapsed       │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Coordinate Translation           │                             │
│  │  • clientX/Y → container-relative │                             │
│  │  • Calculate line number          │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Optimistic Update                │                             │
│  │  • Update local store (instant)   │                             │
│  │  • Render own cursor immediately  │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
└───────────┼─────────────────────────────────────────────────────────┘
            │
            ▼ (Every 200ms + 10px threshold)
┌─────────────────────────────────────────────────────────────────────┐
│                        Supabase Database                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  cursors table:                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ session_id │ pr_id │ file_path │ x   │ y   │ updated_at     │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ abc123     │ o/r/1 │ index.ts  │ 420 │ 180 │ 2026-01-07 ... │   │
│  │ def456     │ o/r/1 │ index.ts  │ 120 │ 340 │ 2026-01-07 ... │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ▼ (Polling every 2 seconds)
┌─────────────────────────────────────────────────────────────────────┐
│                    Other Users' Browsers                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────┐                             │
│  │  Poll Database (2s interval)      │                             │
│  │  • Filter: pr_id, file_path       │                             │
│  │  • Filter: updated_at > 3s ago    │                             │
│  │  • Exclude: own session_id        │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Update Store (new positions)     │                             │
│  │  • Merge with existing cursors    │                             │
│  │  • Set new target positions       │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Lerp Animation (200ms smooth)    │                             │
│  │  • Start position → Target        │                             │
│  │  • requestAnimationFrame (60fps)  │                             │
│  └────────────────────────────────────┘                             │
│           │                                                         │
│           ▼                                                         │
│  ┌────────────────────────────────────┐                             │
│  │  Render Cursors                   │                             │
│  │  • SVG pointer + username label   │                             │
│  │  • Absolute positioning           │                             │
│  └────────────────────────────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Throttling Logic Flow

```
Mouse Event Stream (unthrottled - 60fps):
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─ (16ms intervals)

         Spatial Threshold Filter (>10px movement):
         ┌──────────────────────────────────────┐
         │ Only pass through if:               │
         │ • |newX - lastX| > 10px  OR         │
         │ • |newY - lastY| > 10px              │
         └──────────────────────────────────────┘
                        │
                        ▼
Mouse Event Stream (spatial filtered):
│           │           │           │           │
─┴───────────┴───────────┴───────────┴───────────┴─────────── (variable intervals)

         Temporal Threshold Filter (>200ms elapsed):
         ┌──────────────────────────────────────┐
         │ Only pass through if:               │
         │ • (now - lastUpdate) > 200ms        │
         └──────────────────────────────────────┘
                        │
                        ▼
Database Updates (dual filtered):
│                    │                    │
─┴────────────────────┴────────────────────┴──────────────── (200ms minimum)
                                                             (~5 updates/second)
```

**Result**: 60 mouse events/second → ~5 database updates/second (92% reduction)

---

## 3. Linear Interpolation (Lerp) Visualization

```
Scenario: Cursor moves from (0, 0) to (100, 100) over 200ms

Without Lerp (Jumpy):
   0ms          200ms         400ms         600ms         800ms
    │             │             │             │             │
(0,0) ──────────► (100,100) ────────► (200,200) ─────────► (300,300)
                  JUMP!                JUMP!               JUMP!

With Lerp (Smooth):
   0ms    50ms   100ms  150ms  200ms
    │      │      │      │      │
(0,0) ──► (25,25) ──► (50,50) ──► (75,75) ──► (100,100)
         smooth  smooth  smooth  smooth

Lerp Math at t=50ms (25% through 200ms):
  t = 50 / 200 = 0.25
  x = 0 + (100 - 0) * 0.25 = 25
  y = 0 + (100 - 0) * 0.25 = 25
  Result: Cursor at (25, 25) ✓
```

---

## 4. Component Hierarchy

```
<div ref={containerRef} className="relative">
  │
  ├─ <pre> (Code Diff Content)
  │   └─ ... lines of code ...
  │
  └─ <CursorsLayer cursors={cursors} containerRef={containerRef}>
      │
      ├─ <AnimatePresence>
      │   │
      │   ├─ <LiveCursor key="user1" cursor={cursor1} />
      │   │   ├─ <motion.div> (animated wrapper)
      │   │   │   ├─ <svg> (cursor pointer)
      │   │   │   └─ <div> (username label)
      │   │
      │   ├─ <LiveCursor key="user2" cursor={cursor2} />
      │   │   └─ ... (same structure)
      │   │
      │   └─ <LiveCursor key="user3" cursor={cursor3} />
      │       └─ ... (same structure)
      │
      └─ </AnimatePresence>
</div>
```

---

## 5. Coordinate System Visualization

```
Browser Viewport:
┌─────────────────────────────────────────────────────────────┐
│  Navbar (y=0)                                               │
├─────────────────────────────────────────────────────────────┤
│  Scroll Y = 200px                                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Code Container (relative positioning)               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Line 1: const x = 10;                          │  │   │
│  │  │ Line 2: const y = 20;                          │  │   │
│  │  │ Line 3: console.log(x + y); ← Cursor here     │  │   │
│  │  │              ^                                  │  │   │
│  │  │              │                                  │  │   │
│  │  │              │ Container-relative: (220, 60)   │  │   │
│  │  │              │ Viewport-relative: (220, 260)   │  │   │
│  │  │              │                                  │  │   │
│  │  │              └─ clientX=220, clientY=260       │  │   │
│  │  │                 rect.left=0, rect.top=200      │  │   │
│  │  │                 x = 220-0 = 220 ✓              │  │   │
│  │  │                 y = 260-200 = 60 ✓             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Key Insight: Always subtract rect.top and rect.left to get
container-relative coordinates that work with scroll!
```

---

## 6. Inactivity Cleanup Timeline

```
User moves cursor:
│
├─ 0ms: Mouse move event
│   └─ Update database with new position
│   └─ Start 3-second inactivity timer
│
├─ 500ms: User moves cursor again
│   └─ Cancel previous timer
│   └─ Update database with new position
│   └─ Start new 3-second timer
│
├─ 1000ms: User moves cursor again
│   └─ Cancel previous timer
│   └─ Update database with new position
│   └─ Start new 3-second timer
│
├─ 1500ms: User moves cursor again
│   └─ Cancel previous timer
│   └─ Update database with new position
│   └─ Start new 3-second timer
│
├─ 2000ms: User stops moving
│   └─ Timer keeps running...
│
├─ 3000ms: Timer keeps running...
│
├─ 4000ms: Timer keeps running...
│
├─ 5000ms: ⏰ Timer fires (3 seconds since last move)
│   └─ Delete cursor from database
│   └─ Remove from local store
│   └─ Cursor fades out (Framer Motion exit animation)
│
└─ 5200ms: Cursor fully removed from UI ✓
```

**Total latency**: 3000ms (inactivity) + 200ms (fade) = ~3.2 seconds

---

## 7. Store State Management

```
useCursorsStore (Zustand):
{
  cursorsByPR: {
    "owner/repo/123": {
      "src/index.ts": [
        {
          session_id: "abc123",
          username: "alice",
          x: 420,
          y: 180,
          color: "#ef4444",
          updated_at: "2026-01-07T12:34:56Z"
        },
        {
          session_id: "def456",
          username: "bob",
          x: 120,
          y: 340,
          color: "#3b82f6",
          updated_at: "2026-01-07T12:34:58Z"
        }
      ],
      "src/utils.ts": [
        {
          session_id: "ghi789",
          username: "charlie",
          x: 220,
          y: 140,
          color: "#10b981",
          updated_at: "2026-01-07T12:34:57Z"
        }
      ]
    },
    "owner/repo/456": {
      "src/app.ts": [...]
    }
  },
  currentSessionId: "abc123"
}

Store Actions:
• setCursors(prId, filePath, cursors[]) → Replace all cursors for file
• addCursor(cursor) → Add or update single cursor (optimistic)
• removeCursor(sessionId) → Remove cursor from all files
• updateCursor(sessionId, updates) → Partial update
• getCursorsForFile(prId, filePath) → Get cursors array
```

---

## 8. Performance Optimization Points

```
Render Pipeline:
┌─────────────────────────────────────────────────────────────┐
│  Database Poll (every 2s)                                   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Store Update (setCursors)                          │   │
│  │  • Only updates if cursor positions changed         │   │
│  └─────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CursorsLayer re-renders                            │   │
│  │  • Shallow comparison of cursors array             │   │
│  └─────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  LiveCursor components (React.memo)                 │   │
│  │  • Only re-render if cursor.x or cursor.y changed  │   │
│  │  • 5 cursors = max 5 components re-render           │   │
│  └─────────────────────────────────────────────────────┘   │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Lerp Animation Loop                                │   │
│  │  • requestAnimationFrame (60fps)                    │   │
│  │  • Only updates position state (no re-render)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Key Optimization: React.memo prevents unnecessary re-renders
Without memo: All 5 cursors re-render even if only 1 moved (5x waste)
With memo: Only 1 cursor re-renders when it moves (optimal) ✓
```

---

## 9. Database Polling vs WebSocket Comparison

```
WebSocket (Ideal but paid):
User A moves cursor ──► WebSocket ──► Broadcast ──► User B sees cursor
                        (10-50ms latency)

Database Polling (Free tier, our approach):
User A moves cursor ──► DB Update ──► Poll (2s) ──► User B sees cursor
                        (0-2000ms latency)

Mitigation with Lerp:
User A moves cursor ──► DB Update ──► Poll (2s) ──► Lerp (200ms smooth) ──► User B

Result: Feels smooth despite 2s polling because lerp creates
        smooth 60fps animation between old and new positions!
```

---

## 10. Free Tier Budget Calculation

```
Assumptions:
• 5 concurrent users
• 2-second polling interval
• 8 hours of active development per day
• 20 working days per month

Calculations:
Polls per user per hour = 3600s / 2s = 1800 polls
Polls per user per day = 1800 × 8 hours = 14,400 polls
Polls per user per month = 14,400 × 20 days = 288,000 polls

Total polls per month (5 users) = 288,000 × 5 = 1,440,000 polls

Payload size per poll:
• Query: ~200 bytes
• Response: ~300 bytes per cursor × 5 cursors = 1500 bytes
• Total per poll: 1700 bytes

Bandwidth per month:
1,440,000 polls × 1700 bytes = 2,448,000,000 bytes = 2.3 GB

Supabase Free Tier Limits:
• Database: 500 MB (we're using ~2 GB bandwidth) ← OVER!
• Solution: Reduce to 3 concurrent users OR 3s polling

Revised (3 concurrent users, 2s polling):
1,440,000 polls × (3/5) = 864,000 polls
864,000 × 1700 bytes = 1.4 GB ← Still over!

Revised (5 concurrent users, 3s polling):
(3600s / 3s) × 8h × 20d × 5 = 960,000 polls
960,000 × 1700 bytes = 1.6 GB ← Still over!

FINAL RECOMMENDATION:
• 3 concurrent users + 3s polling = 576,000 polls = 978 MB ✓
• OR upgrade to Supabase Pro ($25/mo) for 50 GB bandwidth
```

**Takeaway**: For true 5-user simultaneous collaboration with 2s polling,
you'll need Supabase Pro. For MVP/demo, use 3s polling with 3 users max.

---

## 11. Color Hash Algorithm Visualization

```
Username → Hash → Hue → HSL Color

"alice" → charCodeAt sum → hash
  a(97) + l(108) + i(105) + c(99) + e(101) = 510

hash % 360 = 510 % 360 = 150 (hue)

hsl(150, 70%, 50%) = #2dd4bf (teal) ✓

"bob" → charCodeAt sum → hash
  b(98) + o(111) + b(98) = 307

hash % 360 = 307 % 360 = 307 (hue)

hsl(307, 70%, 50%) = #d946ef (magenta) ✓

Color Wheel:
  0° = Red
  60° = Yellow
  120° = Green
  180° = Cyan
  240° = Blue
  300° = Magenta

Result: Consistent colors per username, visually distinct!
```

---

## 12. Memory Leak Prevention Checklist

```
Component Lifecycle:

Mount:
  ┌─────────────────────────────────────┐
  │ useEffect(() => {                   │
  │   const interval = setInterval(...) │
  │   const listener = addEventListener │
  │   const timer = setTimeout(...)     │
  │                                     │
  │   return () => {                    │
  │     clearInterval(interval) ✓       │
  │     removeEventListener(listener) ✓ │
  │     clearTimeout(timer) ✓           │
  │   }                                 │
  │ }, [])                              │
  └─────────────────────────────────────┘
                │
                ▼
        Component Running
                │
                ▼
Unmount:
  Cleanup function runs → All references cleared ✓

Common Memory Leaks (AVOID):
  ❌ setInterval without clearInterval
  ❌ addEventListener without removeEventListener
  ❌ setTimeout without clearTimeout
  ❌ requestAnimationFrame without cancelAnimationFrame
  ❌ Zustand subscriptions without unsubscribe
```

---

**End of Visual Diagrams**

These diagrams supplement the main implementation guide in
`frontend_cursors_implementation.md`. Use them as visual references
during development to understand data flows and architecture decisions.
