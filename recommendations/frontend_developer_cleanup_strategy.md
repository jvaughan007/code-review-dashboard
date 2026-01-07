# Frontend Developer Analysis: navigator.sendBeacon for beforeunload Cleanup

**Analyst**: Frontend Developer
**Date**: 2026-01-06
**Context**: Week 2 Timeline (Jan 6-12, 2026) - Real-time collaboration features
**Issue**: Async Supabase cleanup in beforeunload never completes; cleanup occurs 23-27s later via polling

---

## Executive Summary

**Recommendation**: DO NOT implement `navigator.sendBeacon` for this use case.

**Rationale**: The current async cleanup code (lines 227-238) is fundamentally broken and cannot be fixed with sendBeacon. The polling-based TTL (30-second heartbeat timeout) is the correct architectural solution for presence cleanup in 2026.

**Alternative**: Remove the broken beforeunload handler entirely and rely exclusively on the existing 30-second TTL mechanism.

---

## 1. Browser Compatibility Analysis (2026)

### sendBeacon Support Matrix

| Browser | Version | Support | Market Share (2026) |
|---------|---------|---------|---------------------|
| Chrome | 39+ (2014) | ✅ Full | ~65% |
| Firefox | 31+ (2014) | ✅ Full | ~3% |
| Safari | 11.1+ (2018) | ✅ Full | ~20% |
| Edge | 14+ (2016) | ✅ Full | ~5% |
| Mobile Safari | 11.3+ (2018) | ✅ Full | ~25% (mobile) |
| Chrome Mobile | 42+ (2015) | ✅ Full | ~65% (mobile) |

**Verdict**: `navigator.sendBeacon` has universal browser support in 2026. Compatibility is not a concern.

**Sources**:
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
- Can I Use: https://caniuse.com/beacon (97%+ global support)

---

## 2. Why sendBeacon Won't Solve This Problem

### Current Code Analysis (Lines 224-239)

```typescript
const handleBeforeUnload = () => {
  // ❌ PROBLEM: This comment claims sendBeacon will be used
  // Use navigator.sendBeacon for reliable cleanup on page unload
  // This works even when the page is closing

  const cleanup = async () => {  // ❌ PROBLEM: async function
    try {
      // ❌ PROBLEM: await keyword - this is asynchronous
      await supabase.from('presence').delete().eq('session_id', currentSessionId);
      await supabase
        .from('pr_sessions')
        .update({ is_active: false })
        .eq('id', currentSessionId);
    } catch (error) {
      // Silently fail - page is closing anyway
    }
  };
  cleanup();  // ❌ PROBLEM: Calling async function without await
};
```

### Critical Issues

1. **No sendBeacon Actually Used**: The comment says sendBeacon will be used, but the code uses async Supabase client methods
2. **Async Code Never Completes**: `beforeunload` event fires ~0ms before page unload; async operations are cancelled immediately
3. **Fire-and-forget Pattern**: `cleanup()` is called without `await`, so the promise is abandoned
4. **Browser Behavior**: Browsers don't wait for async operations during page unload (by design for security)

### What sendBeacon Actually Requires

```typescript
// ✅ CORRECT sendBeacon usage
const handleBeforeUnload = () => {
  const payload = JSON.stringify({
    session_id: currentSessionId,
    action: 'cleanup'
  });

  const blob = new Blob([payload], { type: 'application/json' });

  // Synchronous, guaranteed to send before page unloads
  navigator.sendBeacon('/api/presence/cleanup', blob);
};
```

**Key Difference**: sendBeacon requires a custom REST endpoint, not the Supabase JS client.

---

## 3. Edge Cases Where sendBeacon Fails

### Failure Scenarios

| Scenario | sendBeacon Behavior | Impact |
|----------|-------------------|--------|
| **Network offline** | Silently fails, returns `false` | Cleanup never happens |
| **CORS restrictions** | Request blocked by browser | Cleanup never happens |
| **Endpoint returns 5xx** | Request sent but server fails | Partial cleanup |
| **Payload >64KB** | Silently fails in some browsers | Cleanup never happens |
| **Browser crash/kill** | Request never sent | Cleanup never happens |
| **Device sleep/hibernate** | Request may not complete | Cleanup never happens |
| **Mobile app switcher** | Not a true page unload | False cleanup trigger |

### Mobile-Specific Issues

On mobile browsers (Safari iOS, Chrome Android):
- **Background tab suspension**: Page may freeze without unload event
- **Low memory kills**: Process terminated without beforeunload
- **Network switching**: WiFi→4G transition may interrupt sendBeacon
- **Power saving mode**: Background requests may be throttled/blocked

**Verdict**: sendBeacon is NOT reliable for critical cleanup operations.

---

## 4. Best Practices for beforeunload Cleanup in React Apps (2026)

### Industry Standard: Don't Use beforeunload for Critical Operations

**Modern React Patterns (2026)**:

1. **Server-Side TTL (Time-To-Live)** - Recommended ✅
   - Heartbeat mechanism (10s intervals)
   - Server marks inactive after N seconds of no heartbeat
   - No client-side cleanup needed
   - Works with browser crashes, network failures

2. **Optimistic Cleanup** - Use for UI polish only
   - Attempt cleanup on unmount/beforeunload
   - Server validates with TTL fallback
   - Never depend on client cleanup

3. **Session Reconciliation** - Background job
   - Cron job every 30s cleans stale sessions
   - Idempotent operations
   - Handles all edge cases

### What Your Code Already Does Correctly

```typescript
// ✅ GOOD: Heartbeat mechanism (lines 170-195)
heartbeatRef.current = setInterval(sendHeartbeat, heartbeatInterval); // 10s

// ✅ GOOD: Polling with TTL (lines 133-168)
.gte('last_heartbeat', new Date(Date.now() - 30 * 1000).toISOString()) // 30s TTL

// ❌ BAD: beforeunload handler (lines 221-246)
// This should be deleted entirely
```

**Your existing code already implements the industry best practice!** The 30-second TTL (30s window after last heartbeat) handles all cleanup scenarios correctly.

---

## 5. Simpler Alternatives to sendBeacon

### Option A: Delete the beforeunload Handler (Recommended)

**Change**: Remove lines 220-246 entirely

**Rationale**:
- Polling-based TTL already handles cleanup (23-27s delay is acceptable)
- beforeunload code is broken and misleading
- Reduces code complexity
- Eliminates false promises to developers

**Trade-off**: 23-27s delay before presence disappears (already acceptable per project requirements)

### Option B: Keep beforeunload for Best-Effort Cleanup

**Change**: Fix the code to actually attempt cleanup, but document it as unreliable

```typescript
// Attempt best-effort cleanup (may not complete)
useEffect(() => {
  if (!currentSessionId) return;

  const handleBeforeUnload = () => {
    // NOTE: This may not complete before page closes
    // Server-side TTL (30s) is the source of truth
    fetch('/api/presence/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: currentSessionId }),
      keepalive: true // Browser hint to complete if possible
    }).catch(() => {
      // Silently fail - TTL will handle cleanup
    });
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [currentSessionId]);
```

**Requires**: New API route at `/api/presence/cleanup`

**Pros**:
- May reduce cleanup delay from 27s→3s in happy path
- Uses `keepalive: true` (modern replacement for sendBeacon)
- Degrades gracefully to TTL fallback

**Cons**:
- Still unreliable (mobile browsers, crashes, network failures)
- Adds API endpoint complexity
- False sense of reliability

### Option C: Implement sendBeacon Properly

**Change**: Create custom REST endpoint + sendBeacon implementation

```typescript
// app/api/presence/cleanup/route.ts
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { session_id } = await request.json();

  const supabase = createClient();

  await supabase.from('presence').delete().eq('session_id', session_id);
  await supabase
    .from('pr_sessions')
    .update({ is_active: false })
    .eq('id', session_id);

  return new Response(null, { status: 204 });
}
```

```typescript
// use-presence.ts
const handleBeforeUnload = () => {
  const payload = JSON.stringify({ session_id: currentSessionId });
  const blob = new Blob([payload], { type: 'application/json' });

  navigator.sendBeacon('/api/presence/cleanup', blob);
};
```

**Pros**:
- Proper sendBeacon usage
- Better reliability than fetch() in happy path
- Industry-standard pattern

**Cons**:
- Still fails in offline/crash scenarios
- Adds API endpoint
- 2-6 hours implementation time (Week 2 timeline constraint)

---

## 6. Testing Strategies for beforeunload Behavior

### Manual Testing Approaches

```typescript
// 1. Browser DevTools Testing
// Chrome DevTools → Network tab → Preserve log
// Trigger: Close tab, refresh page, navigate away
// Verify: Network request sent before page unload

// 2. Multiple Device Testing
const testScenarios = [
  'Desktop: Close tab',
  'Desktop: Refresh page (Cmd+R)',
  'Desktop: Navigate to new URL',
  'Desktop: Browser crash (kill process)',
  'Mobile Safari: Home button',
  'Mobile Safari: App switcher',
  'Mobile Chrome: Background tab',
  'Laptop: Close lid (sleep)',
];

// 3. Network Condition Testing
// Chrome DevTools → Network → Throttling
// - Offline
// - Slow 3G
// - Fast 3G
// - 4G
```

### Automated Testing (Playwright/Cypress)

```typescript
// tests/e2e/presence-cleanup.spec.ts
test('beforeunload cleanup sends beacon', async ({ page, context }) => {
  // Listen for beacon requests
  const beaconRequests: Request[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/presence/cleanup')) {
      beaconRequests.push(request);
    }
  });

  // Navigate to PR page
  await page.goto('/repositories/owner/repo/pull/123');

  // Wait for presence to be established
  await page.waitForSelector('[data-testid="presence-indicator"]');

  // Close page (triggers beforeunload)
  await page.close();

  // Verify beacon was sent
  expect(beaconRequests.length).toBe(1);
});
```

**Challenge**: beforeunload is notoriously difficult to test in automation

### Recommended Testing Strategy

```typescript
// 1. Unit test the cleanup logic (without beforeunload)
describe('presence cleanup', () => {
  test('cleanup function calls correct Supabase methods', async () => {
    const mockSupabase = createMockSupabaseClient();
    await cleanup(mockSupabase, 'session-123');

    expect(mockSupabase.from).toHaveBeenCalledWith('presence');
    expect(mockSupabase.delete).toHaveBeenCalled();
  });
});

// 2. Integration test the API endpoint
describe('POST /api/presence/cleanup', () => {
  test('marks session inactive and deletes presence', async () => {
    const response = await fetch('/api/presence/cleanup', {
      method: 'POST',
      body: JSON.stringify({ session_id: 'test-session' })
    });

    expect(response.status).toBe(204);
    // Verify database state
  });
});

// 3. Manual testing for beforeunload (not automatable)
// Document test plan in README:
// - [ ] Close tab → presence disappears within 30s
// - [ ] Refresh page → new session created
// - [ ] Network offline → TTL cleanup still works
```

---

## 7. Performance Impact Analysis

### Current Implementation (Polling + Broken beforeunload)

```
User closes tab
  ↓
beforeunload fires → async cleanup() called → promise abandoned
  ↓
Page unloads (0ms)
  ↓
Server continues receiving heartbeats? NO (client gone)
  ↓
Last heartbeat: T-0s
  ↓
Polling checks at T+3s: last_heartbeat within 30s window → still shows user
  ↓
Polling checks at T+23s: last_heartbeat within 30s window → still shows user
  ↓
Polling checks at T+27s: last_heartbeat OUTSIDE 30s window → user removed
```

**Measured Latency**: 23-27 seconds (dependent on polling interval of 3s)

### With sendBeacon Implementation

```
User closes tab
  ↓
beforeunload fires → sendBeacon('/api/presence/cleanup')
  ↓
Browser queues HTTP POST (synchronous, before unload)
  ↓
Page unloads (0ms)
  ↓
Browser completes beacon request in background (best effort)
  ↓
API endpoint processes cleanup → Supabase DELETE + UPDATE
  ↓
Next polling cycle (T+3s): presence already removed
```

**Estimated Latency (Happy Path)**: 0-5 seconds
**Estimated Latency (Failure Cases)**: Falls back to 23-27 seconds

### Bandwidth Considerations

```typescript
// sendBeacon payload
{
  "session_id": "uuid-v4-string" // ~36 bytes
}

// Total request size: ~200 bytes (headers + body)
// Negligible impact on user experience
```

### Server Load Impact

**Current**: No impact (cleanup happens via TTL)

**With sendBeacon**:
- Additional API endpoint to maintain
- Database writes on every page close
- DDOS vulnerability: User repeatedly opens/closes tabs
- Recommendation: Rate limit cleanup endpoint (1 req/session/5s)

---

## 8. Recommendation Matrix

| Criterion | Option A (Delete) | Option B (fetch + keepalive) | Option C (sendBeacon) |
|-----------|------------------|----------------------------|---------------------|
| **Implementation Time** | 5 minutes | 2-3 hours | 2-6 hours |
| **Code Complexity** | Lowest (remove code) | Medium (API + fetch) | Medium (API + beacon) |
| **Reliability** | High (TTL only) | Medium (happy path) | Medium (happy path) |
| **Maintenance Burden** | Lowest | Medium | Medium |
| **Week 2 Timeline Fit** | ✅ Excellent | ⚠️ Acceptable | ⚠️ Acceptable |
| **Mobile Compatibility** | ✅ Perfect | ⚠️ Degraded | ⚠️ Degraded |
| **Offline Handling** | ✅ Perfect (TTL) | ❌ Fails | ❌ Fails |
| **Crash Handling** | ✅ Perfect (TTL) | ❌ Fails | ❌ Fails |

---

## 9. Final Recommendation

### Primary Recommendation: Option A (Delete beforeunload Handler)

**Action Items**:
1. Delete lines 220-246 from `use-presence.ts`
2. Update code comments to explain TTL-based cleanup
3. Document expected 23-27s cleanup delay in README
4. Move on to Week 2 Day 3 tasks (Live Cursors)

**Rationale**:
- 30-second TTL is the correct architectural pattern for 2026
- beforeunload cleanup is unreliable by design (browser security model)
- Removes misleading code that promises functionality it cannot deliver
- Saves 2-6 hours during critical Week 2 timeline
- Eliminates future maintenance burden

**Expected User Experience**:
- User closes tab → presence avatar disappears 23-27s later
- Acceptable for this use case (viewing presence, not financial transactions)
- Users understand "last seen 23s ago" pattern from Slack, Discord, GitHub

### Alternative If Sub-5s Cleanup Required: Option C (sendBeacon)

**When to Consider**:
- Product requirement: Presence must disappear <5s
- Willing to accept unreliable cleanup in edge cases
- Have 2-6 hours available in Week 2 timeline

**Implementation Checklist**:
```typescript
// 1. Create API endpoint (app/api/presence/cleanup/route.ts)
// 2. Implement sendBeacon in beforeunload handler
// 3. Add rate limiting (1 req/session/5s)
// 4. Add fallback to TTL for edge cases
// 5. Test on Chrome, Safari, Firefox (desktop + mobile)
// 6. Document known failure scenarios
// 7. Add monitoring for cleanup latency
```

---

## 10. Code Examples

### Recommended Implementation (Option A)

```typescript
// src/lib/hooks/use-presence.ts

// ❌ DELETE THESE LINES (220-246):
// - Entire beforeunload useEffect
// - Misleading comments about sendBeacon

// ✅ ADD THIS COMMENT where beforeunload code was:
/**
 * Note: We do NOT use beforeunload for cleanup because:
 * 1. Async operations are cancelled when page unloads (browser security)
 * 2. Mobile browsers don't reliably fire beforeunload
 * 3. Browser crashes bypass beforeunload entirely
 *
 * Instead, we rely on server-side TTL (30-second heartbeat timeout):
 * - Heartbeat sent every 10s (line 188)
 * - Polling filters users with heartbeat >30s old (line 143)
 * - Result: Presence disappears 23-27s after user leaves
 *
 * This is the industry-standard pattern for presence systems in 2026.
 */
```

### If Implementing sendBeacon (Option C)

```typescript
// app/api/presence/cleanup/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    // Rate limit: 1 request per session per 5 seconds
    const now = Date.now();
    const lastCleanup = rateLimitMap.get(session_id);
    if (lastCleanup && now - lastCleanup < 5000) {
      return new NextResponse(null, { status: 429 }); // Too Many Requests
    }
    rateLimitMap.set(session_id, now);

    // Perform cleanup
    const supabase = createClient();

    await Promise.all([
      supabase.from('presence').delete().eq('session_id', session_id),
      supabase
        .from('pr_sessions')
        .update({ is_active: false })
        .eq('id', session_id),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
```

```typescript
// src/lib/hooks/use-presence.ts (lines 220-246 replacement)

// Attempt best-effort cleanup on page unload (with sendBeacon)
useEffect(() => {
  if (!currentSessionId) return;

  const handleBeforeUnload = () => {
    // NOTE: This is best-effort only. Edge cases where this fails:
    // - Browser crash/force quit
    // - Device sleep/hibernate
    // - Network offline
    // - Mobile background tab suspension
    // Server-side TTL (30s) is the fallback for all these scenarios.

    const payload = JSON.stringify({ session_id: currentSessionId });
    const blob = new Blob([payload], { type: 'application/json' });

    // sendBeacon is synchronous and completes before page unload (best effort)
    const sent = navigator.sendBeacon('/api/presence/cleanup', blob);

    if (!sent) {
      // Payload too large or browser doesn't support sendBeacon
      // Fall back to TTL cleanup (23-27s delay)
      console.warn('sendBeacon failed, cleanup will occur via TTL');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [currentSessionId]);
```

---

## 11. Timeline Impact (Week 2 Constraints)

### Week 2 Schedule (Jan 6-12, 2026)

**Days 1-2**: Supabase Realtime Foundation (6-8 hours) ← CURRENT
**Day 3**: Presence System (4-6 hours) ← NEXT
**Day 4**: Live Cursors (5-7 hours)
**Day 5**: Real-Time Comments (6-8 hours)
**Day 6**: Optimistic UI & State Management (4-5 hours)
**Day 7**: Performance Optimization & Testing (4-5 hours)

**Total Budget**: 20-25 hours

### Impact Analysis

| Option | Implementation Time | Week 2 Budget Impact | Risk to Timeline |
|--------|-------------------|---------------------|-----------------|
| **Option A (Delete)** | 5 minutes | 0 hours | ✅ None |
| **Option B (fetch)** | 2-3 hours | -2.5 hours | ⚠️ Low |
| **Option C (sendBeacon)** | 2-6 hours | -4 hours | ⚠️ Medium |

**Recommendation**: Choose Option A to preserve Week 2 timeline buffer for high-priority features (Live Cursors, Real-Time Comments).

---

## 12. Security Considerations

### sendBeacon Security Risks

1. **CSRF Attacks**
   - sendBeacon doesn't support custom headers
   - Cannot send CSRF tokens in headers
   - Must use cookie-based auth only
   - Vulnerable if using token-based auth

2. **DDOS Vulnerability**
   ```typescript
   // Attacker script
   for (let i = 0; i < 1000; i++) {
     navigator.sendBeacon('/api/presence/cleanup',
       JSON.stringify({ session_id: generateFakeId() })
     );
   }
   ```
   - Mitigation: Rate limiting + session validation

3. **Data Leakage**
   - sendBeacon sends credentials (cookies) by default
   - Ensure CORS policies are strict
   - Validate session ownership server-side

### Recommended Security Measures

```typescript
// app/api/presence/cleanup/route.ts
export async function POST(request: NextRequest) {
  const { session_id } = await request.json();

  // 1. Validate session belongs to authenticated user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Verify session ownership
  const { data: session } = await supabase
    .from('pr_sessions')
    .select('user_id')
    .eq('id', session_id)
    .single();

  if (!session || session.user_id !== user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3. Proceed with cleanup
  // ...
}
```

---

## 13. Monitoring & Observability

If implementing sendBeacon (Option C), add monitoring:

```typescript
// Track cleanup latency
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ... cleanup logic ...

    const latency = Date.now() - startTime;

    // Send to monitoring service
    analytics.track('presence_cleanup', {
      method: 'sendBeacon',
      latency_ms: latency,
      success: true,
    });

  } catch (error) {
    analytics.track('presence_cleanup', {
      method: 'sendBeacon',
      error: error.message,
      success: false,
    });
  }
}
```

**Metrics to Track**:
- Cleanup success rate (%)
- Average cleanup latency (ms)
- sendBeacon failure rate (%)
- Fallback to TTL rate (%)

---

## 14. Conclusion

### The Broken Code Problem

The current implementation (lines 224-239) has a **misleading comment** that promises sendBeacon functionality but actually implements broken async code. This is worse than having no cleanup attempt because it creates false expectations.

### The Architectural Truth

**Presence cleanup in modern web apps requires server-side TTL.** Client-side cleanup is unreliable by design:
- Mobile browsers suspend pages without events
- Users crash browsers
- Networks go offline
- Devices sleep/hibernate

Your existing code **already implements the correct pattern** (30-second heartbeat TTL). The only question is whether to add best-effort client-side cleanup for faster updates in happy-path scenarios.

### Final Decision Framework

**Choose Option A (Delete beforeunload) if**:
- ✅ 23-27s cleanup delay is acceptable (it is for most presence systems)
- ✅ Week 2 timeline is critical (it is: 20-25 hour budget)
- ✅ Code simplicity matters (it does: easier maintenance)

**Choose Option C (sendBeacon) if**:
- ✅ Product requires <5s cleanup (competitive differentiator)
- ✅ Have 2-6 hours available in Week 2 (check Day 3-4 buffer)
- ✅ Willing to accept edge-case failures (document them)

---

## 15. Next Steps

### If Choosing Option A (Recommended)

1. Delete lines 220-246 from `use-presence.ts`
2. Add explanatory comment about TTL-based cleanup
3. Git commit: "Remove broken beforeunload cleanup, rely on TTL"
4. Update WEEK2_PLAN.md: Mark Day 2 complete
5. Move to Day 3: Presence System UI components

**Time Saved**: 2-6 hours → reallocate to Live Cursors polish

### If Choosing Option C

1. Create `app/api/presence/cleanup/route.ts` (1 hour)
2. Implement sendBeacon in beforeunload handler (30 min)
3. Add rate limiting + session validation (1 hour)
4. Test on Chrome, Safari, Firefox (1-2 hours)
5. Document known failure scenarios (30 min)
6. Git commit: "Add best-effort sendBeacon cleanup with TTL fallback"

**Time Investment**: 4-5 hours
**Timeline Risk**: Medium (reduces Day 3-4 buffer)

---

## Appendix A: Reference Links

**Browser APIs**:
- [MDN: navigator.sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [MDN: beforeunload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [MDN: Page Lifecycle API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

**Best Practices**:
- [Google: Page Lifecycle API](https://developers.google.com/web/updates/2018/07/page-lifecycle-api)
- [W3C: Beacon Spec](https://w3c.github.io/beacon/)
- [Chrome: Don't lose user data](https://developer.chrome.com/blog/page-lifecycle-api/)

**React Patterns**:
- [React Docs: useEffect cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [Next.js: API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## Appendix B: Alternative Patterns (Future Consideration)

### Page Visibility API (Better than beforeunload)

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Page backgrounded - attempt cleanup
      // More reliable than beforeunload on mobile
      navigator.sendBeacon('/api/presence/cleanup', blob);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Pros**: Works better on mobile browsers
**Cons**: Still unreliable (crashes, kills, offline)

### WebSocket Close Frame

```typescript
// If using WebSocket for realtime (not Supabase Realtime)
const ws = new WebSocket('wss://...');

window.addEventListener('beforeunload', () => {
  ws.close(1000, JSON.stringify({ session_id })); // Send close frame with data
});
```

**Pros**: Server receives close notification
**Cons**: Requires custom WebSocket server, not applicable to Supabase Realtime

---

**End of Analysis**

**Status**: ✅ Analysis Complete
**Recommendation**: Option A (Delete beforeunload handler)
**Timeline Impact**: 0 hours (5 minutes to delete code)
**Risk Level**: Low (TTL is already working correctly)
