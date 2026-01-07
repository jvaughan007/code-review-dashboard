# Week 2 Day 3: Live Cursors Implementation Plan

**Created**: 2026-01-07
**Prompt Engineer Analysis**: Comprehensive workflow optimization
**Target Feature**: Live cursor tracking and rendering

---

## Executive Summary

**Complexity Assessment**: MEDIUM-HIGH (requires agent consultation)

**Recommended Workflow**: Phased Implementation with Specialist Consultation
- Phase 1: Consult specialists for architecture and approach
- Phase 2: Implement core cursor tracking
- Phase 3: Implement cursor rendering
- Phase 4: Test and optimize performance

**Estimated Timeline**: 5-7 hours (as budgeted in WEEK2_PLAN.md)
- Consultation: 30 minutes
- Implementation: 4-5 hours
- Testing/Optimization: 1-2 hours

**Risk Level**: MEDIUM
- Performance challenges (throttling, coordinate translation)
- New pattern (no reference implementation yet)
- User experience critical (must feel smooth, not janky)

---

## 1. Complexity Analysis

### Why This Requires Agent Consultation

**Multiple Technical Challenges**:
1. **Performance Engineering**: Throttling cursor updates to 60fps without jank
2. **Coordinate Translation**: Converting mouse coordinates to code-container-relative positions
3. **Viewport Handling**: Managing scrolling, zoom, and viewport changes
4. **Database Polling**: Adapting presence polling pattern to cursor updates
5. **React Optimization**: Preventing unnecessary re-renders for smooth animation

**Architectural Decisions Needed**:
- Should cursor updates use same 3-second polling interval as presence?
- Or faster polling (1-second) for more "real-time" feel?
- Should we throttle on client side, server side, or both?
- What coordinate system should we use (viewport vs document vs container)?

**New Pattern Introduction**:
- First feature requiring high-frequency updates (cursors move constantly)
- Presence system uses 10-second heartbeat; cursors need ~16ms throttle
- Need to balance "real-time feel" with zero-cost polling architecture

### Specialists Required

**Frontend Developer** (Primary):
- React hooks for cursor tracking
- Component design (LiveCursor, CursorTracker)
- Event handling (mousemove, scroll, throttling)
- Animation and smooth rendering
- React.memo optimization

**Backend Architect** (Secondary):
- Database polling strategy for cursors table
- Query optimization (indexes already exist from migration 001)
- Coordinate storage format (x, y in pixels? percentage?)
- Cleanup strategy (cursors older than 5 seconds)

**Performance Engineer** (Tertiary):
- Throttling strategy (spatial + temporal)
- React render optimization
- Memory leak prevention
- Performance benchmarking approach

### Consultation Strategy

**RECOMMENDED**: Sequential consultation
1. **Frontend Developer** (20 min): Core implementation approach
2. **Backend Architect** (10 min): Polling strategy review
3. **Execute**: User implements with guidance
4. **Test**: Validate performance benchmarks

**Alternative**: Parallel consultation (if time-critical)
- Frontend + Backend work independently
- Risk: Misalignment on coordinate system or polling interval
- Benefit: Saves 10-15 minutes

**Recommendation**: Use sequential. Live cursors are NOT blocking any other work, and alignment is critical for smooth UX.

---

## 2. Current Infrastructure Assessment

### What's Already Built (Can Leverage)

**Database Schema** (migration 001):
```sql
CREATE TABLE cursors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES pr_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  x INTEGER NOT NULL, -- X coordinate (px)
  y INTEGER NOT NULL, -- Y coordinate (px)
  line_number INTEGER, -- Which line cursor is on
  color TEXT NOT NULL, -- Cursor color (hex)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cursors_unique UNIQUE (session_id, file_path)
);

-- Indexes
CREATE INDEX idx_cursors_pr_file ON cursors(pr_id, file_path);
CREATE INDEX idx_cursors_updated ON cursors(updated_at);
```

**Polling Architecture** (use-presence.ts as reference):
- 3-second polling interval (adjustable)
- UPSERT pattern with onConflict
- Stable ordering for consistent rendering
- Cleanup via TTL (filter by updated_at)

**Zustand Store Pattern** (presence-store.ts as reference):
- Store cursor positions in memory
- Update from polling
- Expose getters for components

**Component Structure** (PR page):
- Already has presence avatars working
- Can add cursor rendering layer similarly

### What Needs to Be Built

**New Hook**: `use-cursors.ts`
- Track mouse position on code diff container
- Throttle cursor updates (spatial + temporal)
- Broadcast to database via UPSERT
- Poll for teammate cursors
- Clean up on unmount

**New Component**: `LiveCursor.tsx`
- Render single teammate cursor
- Show name label
- Apply user color
- Smooth animation (CSS transitions or Framer Motion)
- Fade out after 3s inactivity

**New Component**: `CursorsLayer.tsx`
- Container for all LiveCursor components
- Maps over cursors from store
- Positioned absolutely over code diff

**New Store**: `cursors-store.ts`
- Store cursor positions by user
- Update from polling
- Expose getters for components
- Track last update time (for fade-out)

**Color Assignment System**:
- Hash username → color
- Ensure contrast (avoid white/light gray on light background)
- Consistent across sessions (same user = same color)

---

## 3. Technical Challenges Breakdown

### Challenge 1: Throttling Cursor Updates

**Problem**: Mouse moves 60+ times per second, but we can't poll database 60 times per second (cost, performance).

**Solution Options**:
1. **Client-Side Throttle** (16ms = 60fps max): Update local state immediately, broadcast to database max 60fps
2. **Server-Side Throttle** (1-second polling): Broadcast every 500ms, poll every 1 second
3. **Spatial Throttling**: Only broadcast if moved >10px since last update (reduces noise)

**Recommendation (requires Frontend Developer input)**:
- Likely combination of options 1 + 3
- Local state updates every frame (smooth for current user)
- Database updates every 500ms OR when moved >10px
- Polling interval: 1 second (faster than presence, slower than ideal WebSocket)

### Challenge 2: Coordinate Translation

**Problem**: Mouse coordinates are relative to viewport, but code diff might be scrolled, zoomed, or in a container.

**Solution Options**:
1. **Viewport Coordinates**: Store x/y relative to viewport (breaks on scroll)
2. **Document Coordinates**: Store x/y relative to document (works with scroll, breaks with container)
3. **Container Coordinates**: Store x/y relative to code diff container (correct, requires getBoundingClientRect)

**Recommendation (requires Frontend Developer input)**:
- Option 3: Container coordinates
- Use `ref.current.getBoundingClientRect()` to get container position
- Calculate: `relativeX = mouseX - containerLeft, relativeY = mouseY - containerTop`
- Store percentage (0-100%) instead of pixels (responsive to container resize)

### Challenge 3: Viewport Changes

**Problem**: Scrolling, zooming, or resizing window changes coordinate meaning.

**Solution Options**:
1. **Recalculate on Scroll**: Re-broadcast cursor position on scroll events
2. **Percentage-Based**: Store as percentage of container (0-100%), auto-adjusts
3. **Ignore Viewport Changes**: Accept that cursors might be slightly off during scroll

**Recommendation (requires Frontend Developer input)**:
- Option 2: Percentage-based coordinates (most robust)
- Example: Store `x: 45.2, y: 78.3` (meaning 45.2% from left, 78.3% from top)
- Render: `left: ${x}%, top: ${y}%`

### Challenge 4: Smooth Animation

**Problem**: Polling every 1 second means cursor "jumps" between positions (janky).

**Solution Options**:
1. **CSS Transition**: `transition: all 0.3s ease-out` (simple, works for most cases)
2. **Framer Motion**: `<motion.div animate={{ x, y }} transition={{ duration: 0.5, ease: "easeOut" }}` (smoother, heavier)
3. **Lerp (Linear Interpolation)**: Calculate intermediate positions between polls (complex, best result)

**Recommendation (requires Frontend Developer input)**:
- Start with Option 1: CSS Transition (simple, fast to implement)
- Upgrade to Option 2 if janky (Framer Motion already in package.json)
- Option 3 is overkill unless we're polishing for portfolio showcase

### Challenge 5: Fade-Out After 3s Inactivity

**Problem**: If teammate stops moving mouse, cursor should disappear (not clutter UI).

**Solution Options**:
1. **Client-Side Timer**: Track last update time, hide if >3s old
2. **Database Cleanup**: Filter cursors where `updated_at > 3s ago` in polling query
3. **Hybrid**: Option 2 for removal, Option 1 for fade animation

**Recommendation (requires Frontend Developer input)**:
- Option 3: Hybrid approach
- Polling query: `.gte('updated_at', new Date(Date.now() - 3 * 1000).toISOString())`
- Component: Fade out over 1 second before removal (smooth UX)

---

## 4. Recommended Workflow

### Phase 1: Specialist Consultation (30 minutes)

**Step 1.1: Consult Frontend Developer (20 min)**

**Prompt** (copy/paste ready):

```markdown
You are the Frontend Developer specialist. The user is implementing Week 2 Day 3: Live Cursors feature for a code review dashboard.

**Context**:
- Next.js 15, React 19, TypeScript
- Database polling architecture (no WebSockets, zero-cost requirement)
- Presence system already working (use-presence.ts as reference pattern)
- Database table `cursors` already exists (see migration 001)
- Polling interval budget: 1-3 seconds (must stay free tier)

**Feature Requirements** (from WEEK2_PLAN.md):
- Track mouse position on code diff container
- Broadcast cursor positions to database
- Display teammate cursors with names/colors
- Smooth cursor animations (no jank)
- Cursor disappears after 3s of inactivity

**Technical Challenges**:
1. Throttle cursor updates (60fps local, but can't poll database 60fps)
2. Coordinate translation (mouse → container-relative coordinates)
3. Handle scrolling/viewport changes
4. Smooth animation despite 1-second polling interval
5. Fade out after 3s inactivity

**Files to Reference**:
- /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/src/lib/hooks/use-presence.ts (polling pattern)
- /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/supabase/migrations/001_create_realtime_schema.sql (cursors table schema)
- /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/WEEK2_PLAN.md (Day 4 requirements, lines 62-82)

**Deliverables**:
1. **Hook Design**: `use-cursors.ts` implementation approach
   - Throttling strategy (spatial + temporal)
   - Coordinate translation (viewport → container → percentage?)
   - Polling interval recommendation (1s? 2s? 3s?)
   - Cleanup strategy

2. **Component Design**: `LiveCursor.tsx` and `CursorsLayer.tsx`
   - Rendering approach (absolute positioning? CSS vars?)
   - Animation strategy (CSS transitions? Framer Motion? Lerp?)
   - Fade-out implementation (timer? opacity transition?)

3. **Performance Considerations**:
   - React.memo usage
   - Prevent unnecessary re-renders
   - Memory leak prevention (cleanup intervals)

4. **Code Examples**:
   - Skeleton code for use-cursors.ts
   - Skeleton code for LiveCursor.tsx
   - Store pattern (cursors-store.ts)

5. **Testing Strategy**:
   - How to test with 2+ browser windows
   - Performance benchmarks (should feel smooth at <3s polling)

Write your analysis and recommendations to a file:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/frontend_cursors_implementation.md
```

**Step 1.2: Consult Backend Architect (10 min)**

**Prompt** (copy/paste ready):

```markdown
You are the Backend Architect specialist. The user is implementing Week 2 Day 3: Live Cursors feature for a code review dashboard.

**Context**:
- Supabase PostgreSQL database (free tier)
- Database polling architecture (zero-cost requirement)
- Cursors table already exists (see migration 001)
- Presence system already working with 3-second polling

**Feature Requirements**:
- Store cursor positions in database (x, y coordinates)
- Poll for updates (need recommendation on interval)
- Cleanup stale cursors (older than 3 seconds)

**Technical Challenges**:
1. **Polling Interval**: Presence uses 3 seconds. Should cursors be faster (1s) for more "real-time" feel?
2. **Coordinate Storage**: Store as pixels? Percentages? What's most efficient?
3. **Query Optimization**: Existing index on (pr_id, file_path) and (updated_at). Sufficient?
4. **Cleanup Strategy**: Filter by updated_at in query (same as presence) or database trigger?

**Files to Reference**:
- /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/supabase/migrations/001_create_realtime_schema.sql (cursors table schema, lines 92-113)
- /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/src/lib/hooks/use-presence.ts (polling pattern reference)

**Questions**:
1. Recommended polling interval (1s, 2s, or 3s)? Tradeoff: latency vs API calls.
2. Should x/y be INTEGER (pixels) or NUMERIC (percentage)? Frontend Developer will advise on coordinate system.
3. Is query performance acceptable with current indexes for 1-second polling?
4. Should cleanup be via polling filter (TTL) or database trigger?

**Deliverables**:
1. **Polling Strategy**: Recommended interval with rationale
2. **Coordinate Storage**: Recommended data type (INTEGER vs NUMERIC)
3. **Query Pattern**: UPSERT example for cursor updates
4. **Cleanup Strategy**: TTL filter vs database trigger (pros/cons)
5. **Performance Assessment**: Can free tier handle 1s polling for 5-10 concurrent users?

Write your analysis and recommendations to a file:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_cursors_strategy.md
```

### Phase 2: Core Implementation (4-5 hours)

**Step 2.1: Create Zustand Store (30 min)**
- File: `src/lib/stores/cursors-store.ts`
- Pattern: Copy presence-store.ts, adapt for cursors
- Store: Map of user_id → cursor data (x, y, color, updatedAt)

**Step 2.2: Implement use-cursors Hook (2 hours)**
- File: `src/lib/hooks/use-cursors.ts`
- Features:
  - Track mouse position on container (mousemove event)
  - Throttle updates (spatial + temporal)
  - Broadcast to database (UPSERT)
  - Poll for teammate cursors
  - Cleanup on unmount
- Reference: use-presence.ts (same UPSERT + polling pattern)

**Step 2.3: Implement LiveCursor Component (1 hour)**
- File: `src/components/cursors/LiveCursor.tsx`
- Props: `{ x, y, color, username, lastUpdate }`
- Render: Absolutely positioned div with cursor icon + name label
- Animation: CSS transition or Framer Motion
- Fade-out: Opacity transition based on lastUpdate timestamp

**Step 2.4: Implement CursorsLayer Component (30 min)**
- File: `src/components/cursors/CursorsLayer.tsx`
- Fetches cursors from store
- Maps over cursors, renders LiveCursor for each
- Positioned absolutely over code diff container

**Step 2.5: Integrate into PR Page (30 min)**
- File: `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx`
- Add use-cursors hook
- Render CursorsLayer component
- Pass container ref to hook for coordinate translation

**Step 2.6: Color Assignment System (30 min)**
- File: `src/lib/utils/cursor-colors.ts`
- Hash username → color index
- Color palette (8-10 distinct colors with good contrast)
- Consistent across sessions

### Phase 3: Testing & Optimization (1-2 hours)

**Step 3.1: Manual Testing (45 min)**
- Open PR in 2+ browser windows (different Google accounts)
- Test cursor tracking in each window
- Verify cursors appear in other windows
- Test scrolling behavior
- Test inactivity fade-out
- Test cleanup on window close

**Step 3.2: Performance Validation (30 min)**
- Chrome DevTools Performance profiler
- Check for 60fps during mouse movement
- Verify no memory leaks (heap snapshots)
- Measure polling API call frequency
- Confirm <3s latency for cursor updates

**Step 3.3: Bug Fixes & Polish (30 min)**
- Fix any issues discovered in testing
- Adjust throttling if janky
- Adjust polling interval if too slow/fast
- Polish animations if needed

### Phase 4: Documentation (30 min)

**Step 4.1: Update SESSION_TRACKER.md**
- Add session entry for Week 2 Day 3
- Document decisions made (polling interval, coordinate system, animation approach)
- Add to Critical Decisions Log if applicable

**Step 4.2: Commit to Git**
- Stage all cursor-related files
- Write descriptive commit message
- Include Co-Authored-By: Claude Sonnet 4.5
- Push to repository

---

## 5. Success Metrics

### Must-Have (MVP)
- [ ] Cursor position tracked and broadcast to database
- [ ] Teammate cursors rendered with names and colors
- [ ] Smooth animation (no jank, maintains 60fps)
- [ ] Fade out after 3 seconds of inactivity
- [ ] <3 second latency for cursor updates (acceptable per polling architecture)

### Performance Benchmarks
- [ ] Cursor tracking: 60fps on local machine
- [ ] Polling: 1-3 second intervals (configurable)
- [ ] API calls: <30 requests/minute per user (free tier safe)
- [ ] Memory: No leaks after 5 minutes of use
- [ ] React renders: <10 renders/second for CursorsLayer

### User Experience
- [ ] Cursors feel "real-time" despite polling (smooth animation masks latency)
- [ ] No UI clutter (cursors disappear when inactive)
- [ ] Colors are distinct and readable
- [ ] Name labels don't overlap or obscure code

### Testing Validation
- [ ] Works with 2+ concurrent users
- [ ] Works across different file views
- [ ] Handles rapid mouse movement (no coordinate drift)
- [ ] Handles scrolling and viewport changes
- [ ] Cleans up on window close (within 30 seconds per TTL)

---

## 6. Risk Assessment

### High Risk

**Risk**: Cursor updates feel janky despite throttling
- **Probability**: MEDIUM (30%)
- **Impact**: HIGH (ruins UX, defeats purpose of feature)
- **Mitigation**: Start with CSS transitions, upgrade to Framer Motion if needed
- **Contingency**: Reduce polling interval to 1 second (acceptable cost on free tier)

**Risk**: Coordinate translation breaks on scroll/zoom
- **Probability**: MEDIUM (30%)
- **Impact**: HIGH (cursors appear in wrong place)
- **Mitigation**: Use percentage-based coordinates (0-100%) relative to container
- **Contingency**: Recalculate on scroll events (heavier, but works)

### Medium Risk

**Risk**: Performance degradation with 5+ concurrent users
- **Probability**: LOW (20%)
- **Impact**: MEDIUM (polling too frequent, API rate limits)
- **Mitigation**: Start with 2-second polling, measure API calls in testing
- **Contingency**: Increase polling interval to 3 seconds (same as presence)

**Risk**: Cursors don't disappear after inactivity
- **Probability**: LOW (20%)
- **Impact**: MEDIUM (UI clutter, confusing)
- **Mitigation**: Use TTL filter in polling query (same pattern as presence)
- **Contingency**: Client-side timer for fade-out (backup mechanism)

### Low Risk

**Risk**: Color assignment conflicts (two users get same color)
- **Probability**: VERY LOW (5%)
- **Impact**: LOW (cosmetic issue)
- **Mitigation**: Use 10+ colors in palette, hash username deterministically
- **Contingency**: Add user_id to hash for uniqueness

**Risk**: Memory leaks from event listeners
- **Probability**: LOW (10%)
- **Impact**: MEDIUM (browser slows down over time)
- **Mitigation**: Cleanup all intervals and listeners in useEffect return
- **Contingency**: Test with Chrome DevTools heap snapshots

---

## 7. Open Questions (For Specialists)

### For Frontend Developer
1. Should cursor coordinates be stored as pixels or percentages?
2. What polling interval provides best balance of "real-time feel" vs API cost (1s, 2s, or 3s)?
3. Should we use CSS transitions or Framer Motion for animation?
4. How to handle cursors that move off-screen (scrolling)?
5. Should we implement spatial throttling (only broadcast if moved >10px)?

### For Backend Architect
1. Is 1-second polling sustainable on Supabase free tier for 5-10 users?
2. Should cursors table use INTEGER (pixels) or NUMERIC (percentage) for x/y?
3. Are existing indexes sufficient for 1-second polling queries?
4. Should cleanup be via TTL filter or database trigger (performance tradeoff)?

### For User (Decision Points)
1. After specialist consultation, which approach should we use?
2. Any preferences on animation library (CSS vs Framer Motion)?
3. Should we prioritize speed (1-second polling) or cost (3-second polling)?

---

## 8. Next Steps (Execution)

### Option A: Consult Specialists First (RECOMMENDED)
1. User says: "Consult the Frontend Developer agent with the prompt from Section 4, Phase 1.1"
2. User says: "Consult the Backend Architect agent with the prompt from Section 4, Phase 1.2"
3. User reviews both recommendations
4. User says: "Let's implement the live cursors based on specialist recommendations"
5. Prompt Engineer (or user) executes Phase 2-4

**Timeline**: 30 min consultation + 4-5 hours implementation = 5.5-6 hours total

### Option B: Skip Consultation, Start Implementation (FASTER, RISKIER)
1. User says: "Let's implement live cursors directly using the reference pattern from use-presence.ts"
2. Prompt Engineer builds based on assumptions:
   - 2-second polling (middle ground)
   - Percentage-based coordinates
   - CSS transitions (simple)
   - TTL cleanup (same as presence)
3. Test and iterate if issues arise

**Timeline**: 4-5 hours implementation + 1 hour fixing issues = 5-6 hours total

### Option C: Prototype First, Then Consult (BALANCED)
1. User says: "Build a quick prototype of live cursors using use-presence.ts as reference"
2. Prompt Engineer builds minimal version (no optimization, basic features)
3. Test with 2 browser windows, identify issues
4. Consult specialists with concrete questions (not hypothetical)
5. Refactor based on recommendations

**Timeline**: 2 hours prototype + 20 min consultation + 2 hours refactor + 1 hour test = 5.5 hours total

---

## 9. Recommendation

**RECOMMENDED APPROACH**: Option A (Consult Specialists First)

**Rationale**:
1. **Unknowns**: Multiple technical decisions with no clear "right answer" yet
2. **Risk Mitigation**: Frontend Developer has React/performance expertise we need
3. **Time Investment**: 30 minutes of consultation likely saves 1-2 hours of trial-and-error
4. **Quality**: Specialists will provide battle-tested patterns, not experimental approaches
5. **Learning**: User benefits from expert guidance on challenging features

**Alternative If Time-Critical**: Option C (Prototype First)
- If user wants to "see something working quickly"
- Prototype proves feasibility, then optimize with specialist guidance
- Risk: Might need to refactor significantly after consultation

---

## 10. Copy/Paste Ready Prompts

### To Start Consultation Workflow

**Say this to initiate**:
```
Consult the Frontend Developer agent with the following prompt:

[Copy/paste the entire prompt from Section 4, Phase 1, Step 1.1]
```

Then:
```
Consult the Backend Architect agent with the following prompt:

[Copy/paste the entire prompt from Section 4, Phase 1, Step 1.2]
```

### To Start Direct Implementation (Skip Consultation)

**Say this to initiate**:
```
Let's implement Week 2 Day 3: Live Cursors feature now.

Reference files:
- src/lib/hooks/use-presence.ts (polling pattern)
- supabase/migrations/001_create_realtime_schema.sql (cursors table)

Approach:
- 2-second polling interval
- Percentage-based coordinates (0-100%)
- CSS transitions for animation
- TTL cleanup via polling filter (>3s old)

Build in this order:
1. src/lib/stores/cursors-store.ts
2. src/lib/hooks/use-cursors.ts
3. src/components/cursors/LiveCursor.tsx
4. src/components/cursors/CursorsLayer.tsx
5. Integrate into PR page
```

---

## Appendix A: Estimated Time Breakdown

| Phase | Task | Estimated Time |
|-------|------|----------------|
| **Phase 1** | **Consultation** | **30 min** |
| | Frontend Developer consultation | 20 min |
| | Backend Architect consultation | 10 min |
| **Phase 2** | **Core Implementation** | **4.5 hours** |
| | Create cursors-store.ts | 30 min |
| | Implement use-cursors.ts | 2 hours |
| | Implement LiveCursor.tsx | 1 hour |
| | Implement CursorsLayer.tsx | 30 min |
| | Integrate into PR page | 30 min |
| **Phase 3** | **Testing & Optimization** | **1.75 hours** |
| | Manual testing (2+ windows) | 45 min |
| | Performance validation | 30 min |
| | Bug fixes & polish | 30 min |
| **Phase 4** | **Documentation** | **30 min** |
| | Update SESSION_TRACKER.md | 15 min |
| | Git commit & push | 15 min |
| **TOTAL** | | **7 hours** |

**WITHIN BUDGET**: WEEK2_PLAN.md allocates 5-7 hours for Day 4 (Live Cursors)

---

## Appendix B: Reference Implementation (use-presence.ts)

**Key Patterns to Replicate**:

1. **UPSERT with onConflict**:
```typescript
const { data } = await supabase
  .from('cursors')
  .upsert(
    {
      session_id: sessionId,
      user_id: userId,
      pr_id: prId,
      file_path: currentFile,
      x: cursorX,
      y: cursorY,
      color: userColor,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,file_path' }
  )
  .select();
```

2. **Polling with TTL Filter**:
```typescript
const { data } = await supabase
  .from('cursors')
  .select('*')
  .eq('pr_id', prId)
  .eq('file_path', currentFile)
  .gte('updated_at', new Date(Date.now() - 3 * 1000).toISOString()) // Last 3 seconds
  .order('username', { ascending: true }); // Stable sort
```

3. **Cleanup on Unmount**:
```typescript
useEffect(() => {
  return () => {
    if (!sessionId) return;
    (async () => {
      await supabase.from('cursors').delete().eq('session_id', sessionId);
    })();
  };
}, [sessionId, supabase]);
```

---

## Appendix C: Decision Factors Matrix

| Factor | Weight | Option A: Consult First | Option B: Direct Impl | Option C: Prototype First |
|--------|--------|-------------------------|----------------------|---------------------------|
| **Time to First Result** | 20% | 30 min (consultation) | 0 min (immediate) | 0 min (immediate) |
| **Quality of First Result** | 30% | HIGH (expert guidance) | MEDIUM (assumptions) | LOW (quick prototype) |
| **Risk of Rework** | 25% | LOW (validated approach) | HIGH (untested assumptions) | MEDIUM (informed iteration) |
| **Learning Value** | 15% | HIGH (expert patterns) | MEDIUM (trial-and-error) | HIGH (concrete experience) |
| **Alignment with Policy** | 10% | FULL (Agent Consultation Policy) | NONE (skips policy) | PARTIAL (delayed consultation) |
| **TOTAL SCORE** | 100% | **85/100** | 50/100 | 65/100 |

**Conclusion**: Option A (Consult Specialists First) scores highest across all weighted factors.

---

**END OF PLAN**

**Next Action**: User decides on Option A, B, or C and proceeds accordingly.
