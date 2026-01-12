# Decision Council Context: Live Cursor Rebuild Strategy

**Decision Session**: 2026-01-08
**Facilitator**: Council Facilitator
**Status**: Awaiting Council Member Input

---

## Executive Summary

The live cursor implementation from Session 6 is fundamentally broken and requires strategic decision on path forward. User feedback indicates current implementation is "clunky and unpolished" and "defeats the purpose" of live tracking.

**Critical Finding**: Current architecture will fail at scale (95x over free tier rate limit with 10 users).

---

## User Feedback (Session 7)

> "The same problems exist and the bugs were not fixed. The cursor should be visible at all times, even when not moving. Further, the person moving their own cursor should not be seeing the labeled cursor, the only cursor the user should see being tracked live are the other users, and it should be smooth. Currently it is moving constantly. We need a true live track otherwise it defeats the purpose. If need be, we can re-evaluate the tooling used for the live cursor tracking and plan on re-implementation. As it is right now, it looks and feels clunky and unpolished."

---

## Technical Issues (Frontend Developer Diagnosis)

### Issue 1: Cursor Fading During Activity
- **Root Cause**: Throttling (spatial 10px + temporal 200ms) prevents DB writes → stale timestamps → fade animation triggers
- **Current Behavior**: Cursor fades out while user actively moving (poor UX)
- **Session 7 Fix Failed**: Only fixed server-side cleanup, not client-side fade logic

### Issue 2: Own Cursor Visible
- **Root Cause**: Optimistic update race condition (2-second visibility window before polling excludes it)
- **Current Behavior**: User sees their own labeled cursor for ~2 seconds
- **Session 7 Fix Failed**: Presence join doesn't fix race condition

### Issue 3: Clunky Movement
- **Root Cause**: 1200ms average latency (200-2400ms range) from polling architecture
- **Current Behavior**: Cursors "moving constantly", not smooth, "clunky and unpolished"
- **User Expectation**: "True live track" (<200ms latency)

### Issue 4: Rate Limit Crisis (PRODUCTION BLOCKER)
- **Current Load**: 27 queries/second per user
- **With 10 Users**: 4.75M queries/day
- **Free Tier Limit**: 50,000 queries/day
- **Overage**: 95x over the limit
- **Impact**: App will break in production with 10+ concurrent users

---

## Three Options

### Option A: Rebuild with Supabase Realtime (WebSockets)

**Time Estimate**: 5 hours development

**What Changes**:
- Replace database polling with WebSocket subscription
- Use Supabase Realtime Broadcast API
- Remove throttling (WebSocket handles rate limiting)
- Latency: 150ms (vs 1200ms current)

**Fixes**:
- ✅ Issue 1 (Fading): Real-time updates, no throttling needed
- ✅ Issue 2 (Own Cursor): Can filter on client before state update
- ✅ Issue 3 (Latency): 150ms vs 1200ms (8x improvement)
- ✅ Issue 4 (Rate Limits): WebSocket = FREE, unlimited messages

**Benefits**:
- Supabase Realtime Broadcast is FREE (no additional cost)
- No rate limit on messages (unlimited)
- Industry-standard approach (Figma, Miro, Google Docs all use WebSockets)
- Portfolio-quality implementation (demonstrates real-time systems knowledge)

**Costs**:
- 5 hours development time
- Complete re-implementation (delete current polling code)
- WebSocket complexity (connection management, reconnection logic)
- New territory (team hasn't used Supabase Realtime Broadcast)

**Risks**:
- **Medium Risk**: Well-documented pattern, but unfamiliar to team
- What if 5-hour estimate is wrong? Could take 8-10 hours
- What if WebSocket connection is unstable? Need reconnection logic
- What if Supabase Realtime has hidden limitations? (e.g., message size, connection limits)

---

### Option B: Quick-Fix Patches (Polling)

**Time Estimate**: 1 hour

**What Changes**:
- Fix cursor fading: Update timestamp before throttling (not after)
- Fix own cursor: Filter `session_id` in Zustand store (not just query)
- Latency: Unchanged (1200ms average)
- Rate limits: Unchanged (4.75M queries/day)

**Fixes**:
- ✅ Issue 1 (Fading): Fixed by updating timestamp before throttle check
- ✅ Issue 2 (Own Cursor): Fixed by filtering in store
- ❌ Issue 3 (Latency): Not fixed (still 1200ms)
- ❌ Issue 4 (Rate Limits): Not fixed (still 95x over limit)

**Benefits**:
- Fast (1 hour)
- Low risk (small, targeted changes)
- No architectural changes
- Familiar pattern (polling)

**Costs**:
- Doesn't meet user requirement ("true live track" = smooth movement)
- Rate limit is production blocker (app breaks with 10+ users)
- Technical debt (band-aid on broken architecture)
- User will still see "clunky and unpolished" movement

**Risks**:
- **High Risk**: Rate limit will hit in production (not "if", but "when")
- User explicitly said "we need a true live track otherwise it defeats the purpose"
- This option delivers partial fix, not full solution
- May need to rebuild anyway (wasted effort)

---

### Option C: Hybrid (Quick-fix Now, Rebuild Week 3)

**Time Estimate**: 6 hours total (1 hour now + 5 hours later)

**What Changes**:
- **Now (Week 2)**: Apply quick-fix patches (Option B)
- **Later (Week 3)**: Rebuild with Supabase Realtime (Option A)

**Fixes**:
- Week 2: Issues 1 and 2 fixed
- Week 3: All 4 issues fixed

**Benefits**:
- Immediate improvement (cursor visible, own cursor hidden)
- Buys time to learn WebSockets
- Two-phase risk mitigation (fix urgent bugs first)
- Can test quick-fixes before committing to rebuild

**Costs**:
- 6 hours total (1 extra hour vs Option A)
- Two rounds of implementation work
- Technical debt accumulates for 1+ weeks
- Rate limit risk during gap (Week 2-3)

**Risks**:
- **Medium-High Risk**: Rate limit hits before Week 3 rebuild
- User may test during Week 2 and give negative feedback again
- Momentum loss (starting/stopping twice)
- Sunk cost fallacy (invested in quick-fix, harder to justify rebuild)

---

## User Context (Critical for Decision)

**From Session Tracker**:
- User planning 3+ projects with Claude Code
- Career pivot to AI Engineering (portfolio showcase)
- Quality focus: "making a really great project that works exactly to spec"
- Timeline: "not so much critical as it is making a really great project"
- User frustrated: "clunky and unpolished", "defeats the purpose"

**User's Implicit Signal**:
> "If need be, we can re-evaluate the tooling used for the live cursor tracking and plan on re-implementation."

This suggests user is OPEN to rebuild if it delivers quality result.

---

## Constraints

**Must Maintain**:
- Zero-cost (Supabase free tier)
- Zero TypeScript errors
- Production-quality code (no hallucinations)

**User Expectations**:
- "Polished" (not "clunky")
- "Smooth" (not "moving constantly")
- "True live track" (real-time feel)

---

## Questions for Council Members

### For Context Researcher:
1. Are there additional user requirements or constraints we're missing?
2. What's the historical pattern of user feedback on technical quality?
3. Are there project timeline pressures we should know about?

### For Critical Analyst:
1. Is the "5 hours" estimate for Option A realistic or optimistic?
2. Is "150ms latency" achievable with Supabase Realtime, or is that marketing?
3. What assumptions are we making about WebSocket reliability?
4. Is Option B truly "1 hour" or are we underestimating edge cases?

### For Risk Manager:
1. What's the probability that Option B's rate limit hits in Week 2?
2. What proven patterns exist for cursor tracking at scale?
3. What's our rollback plan if Option A fails after 8 hours?
4. How do we mitigate WebSocket connection instability?

### For Innovation Strategist:
1. What's the portfolio value of "rebuilt live cursors with WebSockets"?
2. Is this a learning opportunity that justifies 5-hour investment?
3. Could we use this as a case study ("rebuilt architecture for 8x performance")?
4. What's the opportunity cost of quick-fix vs. proper implementation?

---

## Decision Criteria (Weighted)

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| User Satisfaction | 30% | TBD | TBD | TBD |
| Production Viability | 25% | TBD | TBD | TBD |
| Portfolio Quality | 20% | TBD | TBD | TBD |
| Risk Management | 15% | TBD | TBD | TBD |
| Time Efficiency | 10% | TBD | TBD | TBD |

**Council Task**: Score each option (0-10) on each criterion and provide weighted total.

---

## Reference Files

**User Feedback**:
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/SESSION_TRACKER.md` (Session 7 accomplishments)

**Technical Context**:
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/CURSORS_IMPLEMENTATION_SUMMARY.md` (Backend Architect analysis)
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/src/lib/hooks/use-cursors.ts` (Current implementation)
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/src/components/live-cursor.tsx` (Animation logic)

**Project Context**:
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/WEEK2_DAY3_SUMMARY.md` (Original implementation plan)

---

## Next Steps

1. Each council member analyzes independently
2. Council Facilitator synthesizes perspectives
3. Weighted decision matrix completed
4. Final recommendation with risk assessment
5. User approval (if major architectural change like Option A)

---

**Document Owner**: Council Facilitator
**Status**: Context Complete, Awaiting Council Input
**Timeline**: Decision needed before next development session
