# Live Cursors - Quick Reference Card

**For**: Week 2 Day 3 Implementation
**Time Estimate**: 5-7 hours
**Difficulty**: Moderate

---

## Core Architecture

```
Mouse Movement (60fps) → Throttle (200ms + 10px) → Database (2s polling) → Lerp (smooth) → Render
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Polling Interval** | 2 seconds | 1800 req/hr (safe for free tier) |
| **Update Throttle** | 200ms | 5 updates/sec (balance responsiveness/load) |
| **Spatial Threshold** | 10px | Prevents jitter from small movements |
| **Animation** | Manual lerp | Best performance for frequent updates |
| **Coordinates** | Store pixels, render % | Resilient to scroll/resize |
| **Inactivity** | 3 seconds | Clean up stale cursors |

---

## Implementation Order

1. **Store** (`cursors-store.ts`) - 30 min
2. **Hook** (`use-cursors.ts`) - 90 min
3. **Components** (`LiveCursor.tsx`, `CursorsLayer.tsx`) - 60 min
4. **Testing** (multi-window) - 30 min
5. **Polish** (colors, cleanup) - 60 min

---

## Critical Code Snippets

### Throttling Logic
```typescript
const dx = Math.abs(e.clientX - lastUpdate.x);
const dy = Math.abs(e.clientY - lastUpdate.y);
const movedEnough = dx > 10 || dy > 10;
const timePassed = Date.now() - lastUpdate.time > 200;

if (!movedEnough || !timePassed) return;
```

### Lerp Animation
```typescript
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

const t = Math.min(elapsed / 200, 1); // 0 to 1 over 200ms
const newX = lerp(startX, targetX, t);
```

### Coordinate Translation
```typescript
const rect = container.getBoundingClientRect();
const x = e.clientX - rect.left; // Container-relative
const y = e.clientY - rect.top;
```

### Inactivity Cleanup
```typescript
setTimeout(async () => {
  await supabase.from('cursors').delete().eq('session_id', id);
}, 3000);
```

---

## Testing Checklist

- [ ] Open 2 browser windows
- [ ] Move cursor in Window 1
- [ ] Cursor appears in Window 2 within 3s
- [ ] Animation is smooth (60fps)
- [ ] Cursor disappears after 3s inactivity
- [ ] No memory leaks (DevTools)
- [ ] <2000 database requests/hour

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Cursor latency | <3s |
| Animation FPS | 60fps |
| DB requests/hour | <2000 |
| Memory usage | <10MB |
| Cleanup latency | <3.5s |

---

## Common Pitfalls

1. **Viewport coordinates**: Use container-relative, not viewport-relative
2. **Memory leaks**: Clear all intervals/timers on unmount
3. **Animation jank**: Use React.memo on LiveCursor component
4. **Own cursor visible**: Filter by `session_id !== currentSessionId`
5. **Stale cursors**: Check `updated_at` in database query

---

## Files to Create

```
src/lib/stores/cursors-store.ts           (Zustand store)
src/lib/hooks/use-cursors.ts              (Polling + throttling)
src/components/live-cursor.tsx            (Single cursor + lerp)
src/components/cursors-layer.tsx          (Container)
```

---

## Reference Patterns

- **Polling**: See `use-presence.ts` (same pattern)
- **Store**: See `presence-store.ts` (same structure)
- **Database**: See `001_create_realtime_schema.sql` (cursors table)

---

## Success Demo Script

> "I'm moving my cursor in Window 1. Within 2-3 seconds, you'll see it in Window 2 with smooth animation. Now I'll stop moving for 3 seconds... and it fades out. That's our polling + lerp architecture working perfectly on the free tier."

---

## Next Steps After Implementation

1. Test with 2+ browser windows
2. Run Chrome DevTools Performance profiling
3. Verify database request count in Supabase dashboard
4. Document any edge cases discovered
5. Get beta tester feedback on smoothness

---

**Full Guide**: See `frontend_cursors_implementation.md` for complete skeleton code and deep dives.
