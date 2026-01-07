# Week 2 Day 3: Live Cursors - Quick Summary

**Full Plan**: See WEEK2_DAY3_IMPLEMENTATION_PLAN.md (7,000 words)

---

## TL;DR

**Complexity**: MEDIUM-HIGH (requires specialist consultation)

**Recommended Approach**: Consult Frontend Developer + Backend Architect first (30 min), then implement (4.5 hours), then test (1.75 hours)

**Total Time**: 7 hours (within 5-7 hour budget)

**Success Criteria**: Smooth cursor tracking with <3s latency, 60fps animation, fade-out after 3s inactivity

---

## Three Options

### Option A: Consult Specialists First (RECOMMENDED - 85/100 score)
1. Consult Frontend Developer (20 min)
2. Consult Backend Architect (10 min)
3. Implement based on recommendations (4.5 hours)
4. Test and optimize (1.75 hours)
5. Document and commit (30 min)

**Pros**: Expert guidance, low rework risk, high quality
**Cons**: 30 min delay before coding starts
**Best For**: Complex features with unknowns (THIS FEATURE)

### Option B: Direct Implementation (50/100 score)
1. Skip consultation, implement immediately (4-5 hours)
2. Use assumptions (2s polling, percentage coords, CSS transitions)
3. Fix issues as they arise (1 hour)

**Pros**: Fastest time to first result
**Cons**: High rework risk, might miss optimal patterns
**Best For**: Time-critical situations or simple features

### Option C: Prototype First (65/100 score)
1. Build quick prototype (2 hours)
2. Test with 2 browser windows
3. Consult specialists with concrete questions (20 min)
4. Refactor based on recommendations (2 hours)
5. Test and document (1.5 hours)

**Pros**: Balanced approach, learn by doing
**Cons**: Moderate rework risk
**Best For**: Features where experimentation valuable

---

## Key Decisions Needed (Specialists Will Answer)

1. **Polling Interval**: 1 second (fast) vs 2 seconds (balanced) vs 3 seconds (same as presence)?
2. **Coordinate System**: Pixels vs percentages vs document coordinates?
3. **Animation**: CSS transitions vs Framer Motion vs lerp interpolation?
4. **Throttling**: Spatial (>10px) + temporal (16ms) or just temporal?
5. **Cleanup**: TTL filter (like presence) vs database trigger?

---

## Copy/Paste Ready Prompts

### To Start Consultation (Option A)

**Step 1: Frontend Developer**
```
Consult the Frontend Developer agent.

Read and use the prompt from:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/WEEK2_DAY3_IMPLEMENTATION_PLAN.md

Section 4, Phase 1, Step 1.1 (starting at "You are the Frontend Developer specialist...")
```

**Step 2: Backend Architect**
```
Consult the Backend Architect agent.

Read and use the prompt from:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/WEEK2_DAY3_IMPLEMENTATION_PLAN.md

Section 4, Phase 1, Step 1.2 (starting at "You are the Backend Architect specialist...")
```

### To Start Direct Implementation (Option B)

```
Let's implement Week 2 Day 3: Live Cursors now using the reference pattern from use-presence.ts.

Approach:
- 2-second polling interval
- Percentage-based coordinates (0-100%)
- CSS transitions for animation
- TTL cleanup via polling filter (>3s old)

Build in order:
1. src/lib/stores/cursors-store.ts (Zustand store)
2. src/lib/hooks/use-cursors.ts (tracking + polling)
3. src/components/cursors/LiveCursor.tsx (single cursor)
4. src/components/cursors/CursorsLayer.tsx (all cursors)
5. src/lib/utils/cursor-colors.ts (color assignment)
6. Integrate into PR page

Reference files:
- src/lib/hooks/use-presence.ts (UPSERT + polling pattern)
- src/lib/stores/presence-store.ts (Zustand pattern)
- supabase/migrations/001_create_realtime_schema.sql (cursors table)
```

---

## Technical Challenges

1. **Performance**: Throttle to 60fps without jank
2. **Coordinates**: Translate mouse → container-relative → storable format
3. **Viewport**: Handle scrolling, zooming, resizing
4. **Animation**: Smooth despite 1-2 second polling latency
5. **Cleanup**: Fade out after 3s inactivity

---

## Success Metrics

- [ ] Cursor tracking works in 2+ browser windows
- [ ] <3 second latency for updates (acceptable for polling)
- [ ] 60fps animation (smooth, no jank)
- [ ] Fade out after 3 seconds of inactivity
- [ ] Distinct colors for each user
- [ ] No memory leaks or performance degradation

---

## Files to Create

1. `src/lib/stores/cursors-store.ts` - Zustand store for cursor state
2. `src/lib/hooks/use-cursors.ts` - Hook for tracking + polling
3. `src/components/cursors/LiveCursor.tsx` - Single cursor component
4. `src/components/cursors/CursorsLayer.tsx` - Container for all cursors
5. `src/lib/utils/cursor-colors.ts` - Username → color mapping

---

## Files to Modify

1. `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx` - Add use-cursors hook + CursorsLayer
2. `SESSION_TRACKER.md` - Document Week 2 Day 3 progress

---

## Estimated Timeline

| Phase | Time |
|-------|------|
| Consultation (if Option A) | 30 min |
| Implementation | 4.5 hours |
| Testing & Optimization | 1.75 hours |
| Documentation | 30 min |
| **TOTAL** | **7 hours** |

---

## Next Steps

**User decides**:
1. Option A (consult first) - Say: "Use the consultation prompts from WEEK2_DAY3_IMPLEMENTATION_PLAN.md"
2. Option B (implement now) - Say: "Let's implement live cursors directly"
3. Option C (prototype first) - Say: "Build a quick prototype of live cursors"

**Prompt Engineer recommends**: Option A (consult specialists first)

**Rationale**: Live cursors are complex, multiple unknowns, 30 min investment likely saves 1-2 hours of rework.

---

**Full details**: WEEK2_DAY3_IMPLEMENTATION_PLAN.md
