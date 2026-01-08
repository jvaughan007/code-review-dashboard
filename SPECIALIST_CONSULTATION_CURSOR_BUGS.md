# Specialist Consultation: Live Cursor Bug Analysis

**Date**: 2026-01-08
**Consultation Type**: Bug fix validation and root cause analysis
**Specialists Consulted**: nextjs-specialist, github-api-specialist
**Purpose**: Validate attempted bug fixes and identify any remaining issues

---

## Context

We implemented live cursor tracking (Week 2 Day 3) using database polling + lerp animation. During testing, we discovered two bugs:

1. **Bug #1**: Cursor fading away despite user activity
2. **Bug #2**: Anonymous username showing instead of actual username

Root cause of bugs: We violated CLAUDE.md consultation policy by implementing direct fixes without consulting specialists.

**Current Status**: Attempted fixes made (see diffs below), but need specialist validation before committing.

---

## Implementation Architecture

### Tech Stack
- **Frontend**: Next.js 15.1.6 (App Router), React 19, TypeScript 5.7.2
- **Backend**: Supabase (PostgreSQL, Realtime, RLS)
- **Cursor Tracking**: Database polling (2s interval) + optimistic updates
- **Animation**: Lerp interpolation (60fps) via Framer Motion

### Key Files
1. `src/lib/hooks/use-cursors.ts` - Cursor position tracking hook
2. `src/components/pr-detail-client.tsx` - Client wrapper integrating presence + cursors
3. `src/components/cursors-layer.tsx` - Cursor rendering with lerp animation
4. `src/lib/stores/cursor-store.ts` - Zustand store for cursor state

---

## Bug #1: Cursor Fading Away Despite User Activity

### Symptoms
- Cursor visible initially
- After ~3 seconds of movement, cursor disappears
- Happens even when user is actively moving mouse

### Original Implementation (BROKEN)
```typescript
// OLD CODE (lines 180-229 in use-cursors.ts)
// Reset inactivity timer AFTER database update completes
await supabase
  .from('cursors')
  .upsert({...});

pendingUpdateRef.current = null;

// ❌ BUG: Timer reset happened AFTER throttling, only on database updates
// This meant if user moved mouse but update was throttled, timer wasn't reset
if (inactivityTimerRef.current) {
  clearTimeout(inactivityTimerRef.current);
}

inactivityTimerRef.current = setTimeout(async () => {
  // Remove cursor after inactivity timeout
  await supabase
    .from('cursors')
    .delete()
    .eq('session_id', sessionId)
    .eq('file_path', filePath);
}, inactivityTimeout);
```

### Attempted Fix
```typescript
// NEW CODE (lines 141-158 in use-cursors.ts)
async (x: number, y: number, lineNumber: number | null = null) => {
  if (!enabled || !sessionId || !myColor) return;

  // ✅ FIX: ALWAYS reset inactivity timer on any mouse movement (even if throttled)
  // This prevents cursor from disappearing while user is actively moving
  if (inactivityTimerRef.current) {
    clearTimeout(inactivityTimerRef.current);
  }

  inactivityTimerRef.current = setTimeout(async () => {
    // Remove cursor after inactivity timeout
    try {
      await supabase
        .from('cursors')
        .delete()
        .eq('session_id', sessionId)
        .eq('file_path', filePath);
    } catch (error) {
      console.error('Error removing cursor after inactivity:', error);
    }
  }, inactivityTimeout);

  // ... rest of throttling logic
}
```

### Questions for nextjs-specialist

1. **Timer Reset Pattern**: Is it correct to reset the inactivity timer at the TOP of the updateCursorPosition function (before throttling checks)? Or should it happen differently in React 19/Next.js 15?

2. **useCallback Dependencies**: The updateCursorPosition callback includes `inactivityTimeout` in the dependency array (line 236). Does this cause the callback to be recreated every render, potentially breaking the timer refs?

3. **setTimeout in useCallback**: Is it safe to create setTimeout timers inside a useCallback that's called on every mousemove (potentially 60fps)? Could this cause memory leaks in React 19?

4. **Ref Usage**: We're using `inactivityTimerRef.current` to store the timeout. Is this the correct pattern for Next.js 15 App Router client components, or should we use a different approach?

5. **Edge Case - Rapid Movement**: If user moves mouse rapidly (faster than throttleDelay), we reset the timer on every call but only update the database periodically. Is there a risk of timer leaks or accumulation?

---

## Bug #2: Anonymous Username Showing Instead of Actual Username

### Symptoms
- Cursor shows "Anonymous" label
- Should show actual GitHub username from presence system

### Original Implementation (BROKEN)
```typescript
// OLD CODE (lines 71-87 in use-cursors.ts)
async function pollCursors() {
  try {
    const { data, error} = await supabase
      .from('cursors')
      .select('*')
      .eq('pr_id', prId)
      .eq('file_path', filePath)
      .neq('session_id', sessionId) // Exclude own cursor
      .gte('updated_at', new Date(Date.now() - inactivityTimeout).toISOString());

    if (error) {
      console.error('Error polling cursors:', error);
      return;
    }

    // ❌ BUG: cursors table doesn't have username column!
    // It only has: id, session_id, user_id, pr_id, file_path, x, y, line_number, color, updated_at
    setCursors(prId, filePath, data as CursorPosition[]);
  } catch (error) {
    console.error('Error in cursor polling:', error);
  }
}
```

### Attempted Fix
```typescript
// NEW CODE (lines 72-117 in use-cursors.ts)
async function pollCursors() {
  try {
    // Fetch cursor positions
    const { data: cursorsData, error: cursorsError } = await supabase
      .from('cursors')
      .select('*')
      .eq('pr_id', prId)
      .eq('file_path', filePath)
      .neq('session_id', sessionId)
      .gte('updated_at', new Date(Date.now() - inactivityTimeout).toISOString());

    if (cursorsError) {
      console.error('Error polling cursors:', cursorsError);
      return;
    }

    if (!cursorsData || cursorsData.length === 0) {
      setCursors(prId, filePath, []);
      return;
    }

    // ✅ FIX: Fetch presence data for these sessions to get username/avatar
    const sessionIds = cursorsData.map((c) => c.session_id);
    const { data: presenceData, error: presenceError } = await supabase
      .from('presence')
      .select('session_id, username, avatar_url')
      .in('session_id', sessionIds);

    if (presenceError) {
      console.error('Error fetching presence for cursors:', presenceError);
      // Still show cursors, just without usernames
      setCursors(prId, filePath, cursorsData as CursorPosition[]);
      return;
    }

    // ✅ FIX: Merge cursor data with presence data
    const cursorsWithUsernames = cursorsData.map((cursor) => {
      const presence = presenceData?.find((p) => p.session_id === cursor.session_id);
      return {
        ...cursor,
        username: presence?.username || 'Anonymous',
        avatar_url: presence?.avatar_url || null,
      } as CursorPosition;
    });

    setCursors(prId, filePath, cursorsWithUsernames);
  } catch (error) {
    console.error('Error in cursor polling:', error);
  }
}
```

### Questions for github-api-specialist

1. **Supabase RLS Policies**: The `presence` table query (line 95-98) uses `.select('session_id, username, avatar_url')`. Do we need to check RLS policies to ensure this query is allowed? What RLS policy should exist for the `presence` table?

2. **Session ID Matching**: We're using `session_id` to join cursors → presence. Is this guaranteed to be consistent? What if a user's presence expires but their cursor is still in the database (within the 3-second window)?

3. **Performance - N+1 Query Pattern**: We're making two separate queries:
   - Query 1: Fetch cursors
   - Query 2: Fetch presence data for those sessions

   Is this optimal, or should we use a Supabase JOIN or view instead? What's the Supabase best practice for this pattern?

4. **Polling Frequency**: We poll every 2 seconds (line 127). With the new two-query approach, are we doubling the database load? Should we adjust the polling interval?

5. **Data Freshness**: If a user updates their GitHub username, how long will it take for the cursor label to update? Is there a better pattern using Supabase Realtime subscriptions instead of polling?

6. **Fallback to 'Anonymous'**: Line 112 falls back to 'Anonymous' if presence is not found. Is this the correct UX? Should we instead:
   - Show session_id?
   - Query user_metadata directly?
   - Show a loading state?

---

## Questions for Both Specialists

### Architecture Review

1. **Overall Pattern**: Is polling (2s interval) the right approach for cursor tracking, or should we use Supabase Realtime subscriptions? What are the tradeoffs?

2. **Throttling Strategy**: We use dual throttling (spatial 10px + temporal 200ms). Is this optimal for Next.js 15 + Supabase, or should we adjust?

3. **Client-Side Tracking**: `pr-detail-client.tsx` now tracks `document.addEventListener('mousemove')` instead of a container ref. Is this correct for Next.js App Router? Any potential issues with server/client boundaries?

4. **Cleanup on Unmount**: Lines 240-262 in use-cursors.ts handle cleanup. Is the async IIFE pattern correct for Next.js 15, or should we use a different approach?

5. **Type Safety**: Line 114 uses `as CursorPosition` to cast the merged data. Is this safe, or could it cause runtime errors if the presence data shape doesn't match?

---

## Expected Specialist Responses

### From nextjs-specialist
- Validation of timer reset pattern in React 19
- Confirmation of useCallback dependency array correctness
- Assessment of potential memory leaks
- Recommendations for ref usage in App Router
- Suggestions for optimization

### From github-api-specialist
- Confirmation of RLS policy requirements for presence table
- Validation of session_id joining strategy
- Assessment of N+1 query pattern
- Recommendations for polling vs Realtime
- Guidance on data freshness and fallback UX

---

## Success Criteria

After specialist consultation, we should have:

1. ✅ Confirmation that Bug #1 fix is correct (timer reset before throttling)
2. ✅ Confirmation that Bug #2 fix is correct (join with presence table)
3. ✅ Validation of no new issues introduced by fixes
4. ✅ Performance optimization recommendations (if any)
5. ✅ TypeScript type safety validation
6. ✅ Next.js 15 + React 19 compatibility confirmation
7. ✅ Supabase best practices adherence

If any issues are identified, specialists will provide specific recommendations for fixes.

---

## Testing Plan (Post-Consultation)

After specialist approval, we will test:

1. **Multi-window test**: Open 2 browser windows, verify cursor visibility
2. **Username test**: Verify actual GitHub username appears (not "Anonymous")
3. **Activity test**: Move mouse continuously for 10 seconds, verify cursor doesn't fade
4. **Inactivity test**: Stop moving mouse, verify cursor disappears after 3 seconds
5. **Performance test**: Monitor console for errors, check network tab for query volume

---

## Next Steps

1. Read specialist responses from consultation
2. Implement any recommended changes
3. Run testing plan
4. Document results in SESSION_TRACKER.md
5. Commit bug fixes with specialist consultation citations
