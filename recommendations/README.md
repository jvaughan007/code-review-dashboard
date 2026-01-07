# Code Review Dashboard - Implementation Recommendations

**Directory**: Implementation guides and architecture decisions for Week 2 features

---

## Live Cursors Feature (Week 2 Day 3) - NEW!

### 1. Main Implementation Guide
**File**: `frontend_cursors_implementation.md` (1,161 lines, 32 KB)

**Contents**:
- Complete architecture overview
- Database polling strategy (2-second intervals)
- Skeleton code for all components
- Throttling logic (spatial + temporal)
- Linear interpolation (lerp) animation
- Performance optimization strategies
- Testing methodology
- Edge case handling
- 5-7 hour implementation timeline

**Start here**: This is your comprehensive guide with full skeleton code.

---

### 2. Quick Reference Card
**File**: `cursors_quick_reference.md` (147 lines, 3.8 KB)

**Contents**:
- One-page summary of key decisions
- Critical code snippets
- Testing checklist
- Performance targets
- Common pitfalls

**Use case**: Quick lookup during implementation, print as reference card.

---

### 3. Architecture Diagrams
**File**: `cursors_architecture_diagram.md` (495 lines, 25 KB)

**Contents**:
- 12 ASCII diagrams showing:
  - Data flow architecture
  - Throttling logic
  - Lerp animation visualization
  - Component hierarchy
  - Coordinate systems
  - Inactivity cleanup timeline
  - Store state management
  - Performance optimization points
  - WebSocket vs polling comparison
  - Free tier budget calculations
  - Color hash algorithm
  - Memory leak prevention

**Use case**: Visual learner reference, architecture discussions.

---

## Implementation Order

Follow this sequence for Week 2 Day 3:

1. **Read** `frontend_cursors_implementation.md` (Section 1-3) - 30 min
2. **Reference** `cursors_architecture_diagram.md` (Diagrams 1-4) - 15 min
3. **Implement** `cursors-store.ts` (Section 4 of main guide) - 30 min
4. **Implement** `use-cursors.ts` (Section 3 of main guide) - 90 min
5. **Implement** Components (Section 5 of main guide) - 60 min
6. **Test** using multi-window setup (Section 8 of main guide) - 30 min
7. **Polish** using quick reference checklist - 60 min

**Total**: 5-7 hours

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Polling Interval** | 2 seconds | Balance between latency and free tier limits |
| **Update Throttle** | 200ms | 5 updates/sec prevents database overload |
| **Spatial Threshold** | 10px | Filters out jitter from small movements |
| **Animation Strategy** | Manual lerp | Best performance for high-frequency updates |
| **Coordinate System** | Store pixels, render % | Resilient to scroll/resize |
| **Inactivity Timeout** | 3 seconds | Industry standard (Figma, Miro) |
| **Color Assignment** | Hash username | Consistent, unique colors per user |

---

## Performance Targets

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Cursor latency | <3s | Time from move to appearance in other window |
| Animation FPS | 60fps | Chrome DevTools Performance tab |
| DB requests/hour | <2000 | Supabase dashboard analytics |
| Memory usage | <10MB | Chrome DevTools Memory profiler |
| Cleanup latency | <3.5s | Time from last move to cursor disappearing |

---

## Database Schema (Already Exists)

From `supabase/migrations/001_create_realtime_schema.sql`:

```sql
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

**Note**: Schema is production-ready, no migration needed.

---

## Files to Create

During implementation, you'll create these files:

```
src/
├── lib/
│   ├── stores/
│   │   └── cursors-store.ts              (Zustand store, ~130 lines)
│   └── hooks/
│       └── use-cursors.ts                (Polling + tracking, ~180 lines)
└── components/
    ├── live-cursor.tsx                   (Single cursor, ~80 lines)
    └── cursors-layer.tsx                 (Container, ~50 lines)
```

**Total**: ~440 lines of code (all skeleton code provided in main guide)

---

## Reference Patterns

Use existing code as patterns:

- **Polling**: `src/lib/hooks/use-presence.ts` (same database polling pattern)
- **Store**: `src/lib/stores/presence-store.ts` (same Zustand structure)
- **Database**: `supabase/migrations/001_create_realtime_schema.sql` (cursors table)

---

## Testing Workflow

### Multi-Window Testing (Primary Method)

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000/repositories/owner/repo/pull/1` in Chrome
3. Open same URL in Chrome Incognito (different user)
4. Move cursor in Window 1
5. Observe cursor appearing in Window 2 within 2-3 seconds
6. Verify smooth animation (no jank)
7. Stop moving for 3 seconds
8. Observe cursor fading out

### Performance Testing

```bash
# Chrome DevTools → Performance
1. Start recording
2. Move cursor for 10 seconds
3. Stop recording
4. Verify: 60fps (no red bars)
5. Verify: No long tasks (>50ms)
```

### Database Load Testing

```bash
# Supabase Dashboard → Database → Logs
1. Move cursor continuously for 60 seconds
2. Count requests in logs
3. Expected: ~30 requests (1 every 2 seconds)
4. Verify: <2000 requests/hour
```

---

## Common Pitfalls (Avoid These!)

1. **Viewport Coordinates**: Use container-relative, not viewport-relative
   - ❌ `const x = e.clientX;`
   - ✅ `const x = e.clientX - rect.left;`

2. **Memory Leaks**: Clear all intervals/timers on unmount
   - ❌ `setInterval(poll, 2000);`
   - ✅ `const interval = setInterval(poll, 2000); return () => clearInterval(interval);`

3. **Own Cursor Visible**: Filter by session_id
   - ❌ `.eq('pr_id', prId)`
   - ✅ `.eq('pr_id', prId).neq('session_id', currentSessionId)`

4. **Animation Jank**: Use React.memo
   - ❌ `export function LiveCursor({ cursor }) { ... }`
   - ✅ `export const LiveCursor = memo(({ cursor }) => { ... });`

5. **Stale Cursors**: Filter by updated_at
   - ❌ `.select('*')`
   - ✅ `.select('*').gte('updated_at', new Date(Date.now() - 3000).toISOString())`

---

## Success Criteria (Week 2 Day 3 Complete)

You're done when:

- ✅ Open PR in 2 browser windows
- ✅ Move cursor in Window 1
- ✅ Cursor appears in Window 2 within 3 seconds
- ✅ Cursor is smooth (no jank, 60fps)
- ✅ Cursor disappears after 3s of inactivity
- ✅ Performance: 60fps, <2000 req/hr, <10MB memory
- ✅ No console errors or warnings
- ✅ Chrome DevTools Performance shows green (no red bars)

---

## Demo Script (For Stakeholders)

> "Let me show you the live cursors feature. I have two browser windows open, both viewing the same pull request. Watch this - I'm moving my cursor in this window [Window 1]. Within 2-3 seconds, you'll see it appear in this other window [Window 2]. Notice how smooth the animation is, even though we're only polling the database every 2 seconds. That's the magic of linear interpolation.
>
> Now watch what happens when I stop moving for 3 seconds... there it goes, the cursor fades out. That's our inactivity timeout working perfectly. This helps keep the UI clean when teammates aren't actively reviewing.
>
> And here's the best part - this entire feature works on Supabase's free tier using database polling instead of WebSockets. We're well within the free tier limits even with 5 concurrent users."

---

## Next Steps After Implementation

### Immediate (Week 2 Day 4-5)

- Integrate cursors into main PR page
- Add cursor color customization
- Implement cursor labels ("alice is on line 42")
- Get beta tester feedback

### Future Enhancements (Week 3+)

- Upgrade to WebSockets for <100ms latency
- Add cursor trails (draw path from A to B)
- Viewport filtering (only render visible cursors)
- Multi-file cursor tracking
- Cursor activity indicators ("typing", "reviewing")

---

## Additional Resources

### Official Documentation

- Next.js 15: https://nextjs.org/docs
- React 19: https://react.dev
- Supabase: https://supabase.com/docs
- Zustand: https://zustand-demo.pmnd.rs/
- Framer Motion: https://www.framer.com/motion/

### Internal Documentation

- `WEEK2_PLAN.md` (Project plan, Day 4 requirements lines 62-82)
- `src/lib/hooks/use-presence.ts` (Reference polling pattern)
- `src/lib/stores/presence-store.ts` (Reference Zustand pattern)
- `supabase/migrations/001_create_realtime_schema.sql` (Database schema)

---

## Questions?

If you encounter issues during implementation:

1. **Check** `cursors_quick_reference.md` for common pitfalls
2. **Reference** `cursors_architecture_diagram.md` for visual explanations
3. **Review** `frontend_cursors_implementation.md` Section 9 (Edge Cases)
4. **Compare** with `use-presence.ts` (same polling pattern)
5. **Test** in Chrome DevTools Performance tab (identify bottlenecks)

---

## File Index

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| `frontend_cursors_implementation.md` | 32 KB | 1,161 | Main implementation guide |
| `cursors_quick_reference.md` | 3.8 KB | 147 | Quick lookup card |
| `cursors_architecture_diagram.md` | 25 KB | 495 | Visual diagrams |
| `README.md` (this file) | - | - | Directory index |

**Total documentation**: 60 KB, 1,803 lines

---

**Last Updated**: 2026-01-07
**Author**: Frontend Developer Specialist
**Project**: Code Review Dashboard - Week 2 Day 3
