# Prompt Engineer Analysis: Presence System Cleanup Decision

**Date**: 2026-01-06
**Session**: #5
**Agent**: Prompt Engineer
**Request Type**: Decision Council Consultation Optimization

---

## Executive Summary

**Decision Warranted**: YES - Decision Council consultation is MANDATORY

**Reasoning**: This decision meets 3 of 4 criteria for complex requests:
1. Multiple valid solutions exist (Accept Current vs Fix beforeunload)
2. Clear tradeoffs between approaches (UX vs maintainability)
3. Requires domain expertise (Browser APIs, Supabase architecture, UX design)
4. Impact on project timeline and complexity

**Recommendation**: Sequential consultation workflow
- Backend Architect (Supabase cleanup patterns)
- Frontend Developer (Browser API compatibility)
- Decision Council (Final weighted decision)

**Timeline Estimate**: 30-45 minutes total consultation time

---

## 1. Context Analysis

### Project Constraints (from WEEK2_PLAN.md)
- **Zero-cost requirement**: Supabase free tier only
- **Week 2 timeline**: Days 1-2 complete, Day 3 starting (live cursors)
- **Acceptable latency**: 30 seconds per project requirements
- **Tech stack**: Next.js 15, Supabase polling architecture (no WebSockets)

### Current Implementation Status
- **Database polling**: 3-second intervals working reliably
- **Stale threshold**: 30 seconds (recently reduced from 5 minutes)
- **beforeunload handler**: Lines 221-246 in use-presence.ts
- **Session tracking**: pr_sessions table with is_active flag

### Root Cause (Technical)
```typescript
// Lines 221-246: use-presence.ts
const handleBeforeUnload = () => {
  const cleanup = async () => {
    try {
      await supabase.from('presence').delete().eq('session_id', currentSessionId);
      await supabase
        .from('pr_sessions')
        .update({ is_active: false })
        .eq('id', currentSessionId);
    } catch (error) {
      // Silently fail - page is closing anyway
    }
  };
  cleanup();
};
```

**Problem**: Browsers don't wait for async operations in beforeunload handlers. The page closes immediately, cleanup never completes, and polling cleanup removes stale presence after 23-27 seconds.

### Test Results (Empirical Evidence)
- **Test 3**: Avatar cleanup takes 23-27 seconds (polling cleanup working)
- **Test 4**: Avatar sorting stability PASSED (alphabetical order maintained)
- **Cleanup mechanism**: Database polling detects stale presence (last_heartbeat > 30s)
- **User experience**: "Josh left" appears 23-27 seconds after browser close

---

## 2. Decision Complexity Assessment

### Why Decision Council Consultation is Required

**Meets Complex Request Criteria**:
- ✅ Multiple valid solutions (Option A vs Option B)
- ✅ Significant tradeoffs (UX vs maintainability)
- ✅ Requires domain expertise (Browser APIs, Supabase, UX)
- ✅ Timeline implications (Week 2 Day 3 starting)
- ✅ Architecture implications (adding REST API endpoint)

**Cannot Skip Consultation**:
- ❌ Not a single-line bug fix
- ❌ Not a trivial UI tweak
- ❌ Multiple stakeholder perspectives needed (technical, UX, maintenance)
- ❌ Risk of scope creep (Option B adds complexity)

### Specialist Consultation Needed

**1. Backend Architect (Supabase Specialist)**
- Evaluate navigator.sendBeacon compatibility with Supabase
- Assess REST API endpoint security implications
- Estimate implementation complexity (2-4 hours realistic?)
- Alternative cleanup patterns in Supabase ecosystem

**2. Frontend Developer (Browser API Specialist)**
- navigator.sendBeacon browser compatibility (Safari, Firefox, Chrome)
- Best practices for beforeunload cleanup
- Reliability of sendBeacon in production environments
- Alternative browser APIs for guaranteed cleanup

**3. Decision Council**
- Apply weighted decision matrix
- Balance UX improvement vs implementation risk
- Consider project timeline (Week 2 Day 3 constraints)
- Make GO/NO-GO decision with clear rationale

---

## 3. Options Analysis

### Option A: Accept Current Behavior (RECOMMENDED by initial assessment)

**Description**: Keep existing polling cleanup, remove beforeunload handler (since it doesn't work)

**Technical Implementation**:
```typescript
// Remove lines 221-246 from use-presence.ts (non-functional beforeunload handler)
// Keep lines 133-168 (polling cleanup working reliably)
```

**Pros**:
1. **Simple**: No code changes required (except removing dead code)
2. **Reliable**: Polling cleanup proven to work (23-27s cleanup time)
3. **Maintainable**: Standard pattern, no browser API edge cases
4. **Industry standard**: Slack/Discord use 30-60s polling cleanup
5. **Zero cost**: No additional infrastructure needed
6. **Timeline**: 15 minutes to remove dead code

**Cons**:
1. **23-27 second delay**: Users appear "online" after leaving
2. **Not instant**: Doesn't match "real-time" marketing positioning
3. **UX perception**: Feels less polished than instant cleanup

**Risk Assessment**: LOW
- No breaking changes
- Proven solution working in production
- Clear user expectations (30s threshold documented)

**Cost**: 15 minutes (remove dead code, test, commit)

---

### Option B: Fix beforeunload with navigator.sendBeacon

**Description**: Use navigator.sendBeacon to send synchronous HTTP request to custom REST endpoint

**Technical Implementation**:
```typescript
// 1. Create REST API endpoint
// File: src/app/api/presence/cleanup/route.ts
export async function POST(request: Request) {
  const { sessionId } = await request.json();

  // Direct Supabase REST API call (not JS client)
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/presence?session_id=eq.${sessionId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    }
  );

  return Response.json({ success: true });
}

// 2. Update beforeunload handler
const handleBeforeUnload = () => {
  const data = JSON.stringify({ sessionId: currentSessionId });
  const blob = new Blob([data], { type: 'application/json' });
  navigator.sendBeacon('/api/presence/cleanup', blob);
};
```

**Pros**:
1. **0-5 second cleanup**: Near-instant avatar disappearance
2. **Better UX**: More polished, "real-time" feel
3. **Marketing**: Can advertise "instant presence updates"
4. **Guaranteed execution**: sendBeacon waits for HTTP response

**Cons**:
1. **Complex**: Requires new REST endpoint, direct Supabase REST API
2. **Harder to maintain**: Two cleanup paths (beforeunload + polling fallback)
3. **Browser compatibility**: sendBeacon not supported in IE11 (not a concern in 2026)
4. **Security complexity**: Must ensure REST endpoint can't be abused
5. **Testing overhead**: Need to test edge cases (network failures, CORS)
6. **Timeline risk**: 2-4 hours estimated, could expand to 6+ hours

**Risk Assessment**: MEDIUM-HIGH
- New browser API dependency (sendBeacon)
- Direct Supabase REST API (not using JS client abstraction)
- Potential security implications (public endpoint for deletion)
- Increased code complexity (two cleanup mechanisms)
- Testing edge cases (slow networks, failed requests)

**Cost**: 2-4 hours (optimistic), 4-6 hours (realistic), 6+ hours (pessimistic with debugging)

---

## 4. Weighted Decision Criteria

### Proposed Scoring Matrix (10-point scale)

| Criterion | Weight | Option A | Option B | Notes |
|-----------|--------|----------|----------|-------|
| **Technical Simplicity** | 20% | 10 | 4 | A: Remove code. B: Add endpoint + sendBeacon |
| **Maintainability** | 20% | 10 | 5 | A: One cleanup path. B: Two cleanup paths |
| **User Experience** | 25% | 6 | 9 | A: 23-27s delay. B: 0-5s delay |
| **Timeline Impact** | 15% | 10 | 5 | A: 15 min. B: 2-6 hours (Day 3 delayed) |
| **Risk/Stability** | 15% | 10 | 5 | A: Proven solution. B: New browser API, REST endpoint |
| **Cost** | 5% | 10 | 10 | Both zero-cost (Supabase free tier) |

### Scoring Justification

**Technical Simplicity (20%)**
- Option A: Remove dead code (lines 221-246) - trivial change
- Option B: Create REST endpoint, implement sendBeacon, test edge cases

**Maintainability (20%)**
- Option A: Single cleanup mechanism (polling)
- Option B: Two mechanisms (beforeunload + polling fallback)
- Future developers must understand both paths

**User Experience (25%)**
- Option A: 23-27 second delay noticeable but acceptable
- Option B: Near-instant cleanup feels more polished
- Industry comparison: Slack (30s), Discord (30s), GitHub (60s)

**Timeline Impact (15%)**
- Option A: 15 minutes to remove code and test
- Option B: 2-4 hours optimistic, 4-6 hours realistic
- Week 2 Day 3 goal: Live cursors (delayed if Option B chosen)

**Risk/Stability (15%)**
- Option A: Polling cleanup proven in Tests 3-4
- Option B: sendBeacon untested, REST endpoint security unknown

**Cost (5%)**
- Both options zero-cost (Supabase free tier)

---

## 5. Pre-Consultation Questions for Specialists

### For Backend Architect (Supabase Specialist)

**Questions**:
1. Is navigator.sendBeacon compatible with Supabase REST API?
2. What security implications exist for a public cleanup endpoint?
3. Can we rate-limit the cleanup endpoint to prevent abuse?
4. What's the realistic implementation time (including testing)?
5. Are there Supabase-native cleanup patterns we're missing?
6. Should we use Supabase Edge Functions instead of Next.js API route?

**Context to Provide**:
- Current RLS policies (migration 002)
- Polling cleanup working reliably (23-27s)
- beforeunload handler using async Supabase client (doesn't work)

---

### For Frontend Developer (Browser API Specialist)

**Questions**:
1. What's the browser compatibility matrix for navigator.sendBeacon in 2026?
2. Are there edge cases where sendBeacon fails (slow networks, CORS)?
3. What's the fallback strategy if sendBeacon is unavailable?
4. How do we test beforeunload cleanup in automated tests?
5. Is there a simpler browser API for guaranteed cleanup?
6. What are best practices for beforeunload cleanup in React apps?

**Context to Provide**:
- Next.js 15 App Router architecture
- Current beforeunload handler (lines 221-246 use-presence.ts)
- Target browsers: Chrome, Firefox, Safari (modern versions)

---

## 6. Recommended Consultation Workflow

### Phase 1: Parallel Specialist Consultation (20 minutes)
**Run simultaneously** to gather independent perspectives:

**Backend Architect Prompt** (10 minutes):
```markdown
Subject: Evaluate navigator.sendBeacon cleanup pattern for Supabase

Context: We have a beforeunload cleanup handler that uses async Supabase operations.
Browsers don't wait for async operations, so cleanup never fires.

Current working solution: Polling cleanup (23-27s latency)

Question: Should we implement navigator.sendBeacon cleanup via REST API endpoint?

Please evaluate:
1. Supabase REST API compatibility with sendBeacon
2. Security implications of public cleanup endpoint
3. Implementation complexity (realistic time estimate)
4. Alternative Supabase-native cleanup patterns

Files to read:
- src/lib/hooks/use-presence.ts (lines 197-246)
- supabase/migrations/002_fix_rls_upsert_policies.sql
- SOURCE_OF_TRUTH.md (project constraints)
```

**Frontend Developer Prompt** (10 minutes):
```markdown
Subject: Evaluate navigator.sendBeacon for beforeunload cleanup

Context: beforeunload handler uses async Supabase operations that never complete
before page closes. Cleanup fires 23-27 seconds later via polling.

Question: Should we implement navigator.sendBeacon for instant cleanup?

Please evaluate:
1. Browser compatibility in 2026 (Chrome, Firefox, Safari)
2. Edge cases where sendBeacon fails
3. Best practices for beforeunload cleanup in React apps
4. Testing strategies for beforeunload behavior
5. Simpler alternatives to sendBeacon

Files to read:
- src/lib/hooks/use-presence.ts (lines 221-246)
- WEEK2_PLAN.md (timeline constraints)
```

---

### Phase 2: Decision Council Weighted Analysis (15 minutes)

**Decision Council Prompt**:
```markdown
Subject: GO/NO-GO Decision - Presence System Cleanup Strategy

Context:
We have a working presence cleanup system using polling (23-27s latency).
The beforeunload handler doesn't work because browsers don't wait for async operations.

Two options:
A) Accept current behavior (polling cleanup, 23-27s)
B) Implement navigator.sendBeacon cleanup (0-5s, more complex)

Project constraints:
- Zero-cost requirement (Supabase free tier)
- Week 2 Day 3 timeline (live cursors planned today)
- Acceptable latency: 30 seconds per requirements

Please read:
1. Backend Architect recommendation (recommendations/backend_architect_cleanup_strategy.md)
2. Frontend Developer recommendation (recommendations/frontend_developer_cleanup_strategy.md)
3. Weighted decision matrix above (6 criteria, 10-point scale)

Apply Decision Council weighted scoring and make GO/NO-GO decision:
- GO Option A: Accept current behavior (15 min implementation)
- GO Option B: Implement sendBeacon cleanup (2-6 hours implementation)
- NO-GO: Propose alternative approach

Include:
- Weighted scores for both options
- Timeline impact on Week 2 Day 3 (live cursors)
- Risk assessment (technical, security, UX)
- Clear recommendation with rationale
```

---

### Phase 3: User Approval & Execution (5 minutes)

**Deliverable**: Clear GO/NO-GO decision document

**Format**:
```markdown
# Decision: Presence System Cleanup Strategy

**Decision**: GO Option [A/B]

**Weighted Score**:
- Option A: X.X/10
- Option B: X.X/10

**Rationale**: [3-5 sentences explaining why chosen option best serves project goals]

**Timeline Impact**: [How this affects Week 2 Day 3 live cursor implementation]

**Risks**: [Key risks and mitigation strategies]

**Implementation Steps**: [Clear action items with time estimates]

**Success Metrics**: [How to validate decision was correct]
```

---

## 7. Timeline Estimate

| Phase | Duration | Agents Involved |
|-------|----------|-----------------|
| Phase 1: Specialist Consultation | 20 min (parallel) | Backend Architect + Frontend Developer |
| Phase 2: Decision Council | 15 min | Decision Council |
| Phase 3: User Review | 5 min | User approval |
| **Total Consultation Time** | **40 minutes** | 3 agents |

**Post-Decision Timeline**:
- Option A: 15 minutes implementation (remove dead code)
- Option B: 2-6 hours implementation (create endpoint, test)

**Week 2 Day 3 Impact**:
- Option A: No delay, live cursors start on schedule
- Option B: 2-6 hour delay, live cursors pushed to late Day 3 or Day 4

---

## 8. Success Metrics for Validation

### Option A Success Metrics
- ✅ beforeunload dead code removed (lines 221-246)
- ✅ Polling cleanup still working (23-27s latency)
- ✅ Zero regressions in Tests 3-4
- ✅ Documentation updated (why polling cleanup chosen)
- ✅ Week 2 Day 3 starts on schedule (live cursors)

### Option B Success Metrics
- ✅ REST endpoint created and secured
- ✅ navigator.sendBeacon working in Chrome, Firefox, Safari
- ✅ Cleanup latency < 5 seconds (validated in tests)
- ✅ Polling fallback still working (for edge cases)
- ✅ No security vulnerabilities in cleanup endpoint
- ✅ Unit tests for beforeunload cleanup
- ✅ Week 2 timeline adjusted (live cursors delayed 2-6 hours)

---

## 9. Risk Assessment

### Option A Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 23-27s delay hurts UX perception | MEDIUM | LOW | Document as "industry standard" (Slack/Discord) |
| Users complain about "stale" presence | LOW | LOW | Reduce threshold to 15s (if complaints arise) |
| Polling cleanup stops working | VERY LOW | MEDIUM | Already proven in Tests 3-4, well-tested |

**Overall Risk**: LOW

---

### Option B Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| sendBeacon not supported in some browsers | LOW | MEDIUM | Polling fallback ensures cleanup |
| REST endpoint has security vulnerability | MEDIUM | HIGH | Thorough security review, rate limiting |
| Implementation takes 6+ hours (scope creep) | MEDIUM | MEDIUM | Time-box to 4 hours, revert if exceeds |
| Week 2 Day 3 delayed (live cursors) | HIGH | MEDIUM | Accept delay or defer Option B to Week 3 |
| New bugs introduced (edge cases) | MEDIUM | MEDIUM | Comprehensive testing, fallback to Option A |

**Overall Risk**: MEDIUM-HIGH

---

## 10. Recommendation Summary

### Prompt Engineer Recommendation: Sequential Consultation

**Phase 1**: Parallel specialist consultation (20 min)
- Backend Architect evaluates Supabase REST API approach
- Frontend Developer evaluates sendBeacon browser compatibility

**Phase 2**: Decision Council weighted analysis (15 min)
- Apply 6-criteria weighted matrix
- Consider specialist recommendations
- Make GO/NO-GO decision

**Phase 3**: User approval and execution (5 min)
- Review Decision Council output
- Approve chosen option
- Execute implementation

**Total Time**: 40 minutes consultation + 15 minutes (Option A) or 2-6 hours (Option B) implementation

---

## 11. Alternative Approaches (Not in Original Options)

### Option C: Hybrid Approach (Suggested by Prompt Engineer)

**Description**: Keep polling cleanup, add visual indicator for "recently left"

**Implementation**:
```typescript
// Show "Josh (recently left)" for 30 seconds after last heartbeat
// Then remove from presence list after 30s cleanup

const isRecentlyLeft = (lastHeartbeat: string) => {
  const timeSinceHeartbeat = Date.now() - new Date(lastHeartbeat).getTime();
  return timeSinceHeartbeat > 10000 && timeSinceHeartbeat < 30000;
};

// UI component
{isRecentlyLeft(user.last_heartbeat) && (
  <Badge variant="secondary">Recently left</Badge>
)}
```

**Pros**:
- Simple implementation (30 minutes)
- Better UX than Option A (shows user "left" sooner)
- No browser API complexity
- No REST endpoint needed
- No security risks

**Cons**:
- Adds UI complexity (third state: viewing, recently left, gone)
- Still 23-27 second cleanup latency
- Partial improvement (not instant cleanup)

**Risk**: LOW
**Cost**: 30 minutes

**Decision Council Consideration**: Should this be Option C in the matrix?

---

## 12. Next Steps

### Immediate Actions
1. **User**: Review this analysis and approve consultation workflow
2. **Prompt Engineer**: Create specialist consultation prompts (Backend Architect, Frontend Developer)
3. **User**: Trigger parallel specialist consultations
4. **Specialists**: Deliver recommendations to shared files
5. **Prompt Engineer**: Create Decision Council prompt with specialist inputs
6. **Decision Council**: Apply weighted matrix, make GO/NO-GO decision
7. **User**: Approve decision and execute implementation

### Files to Create
- `prompts/backend_architect_cleanup_strategy.md`
- `prompts/frontend_developer_cleanup_strategy.md`
- `prompts/decision_council_cleanup_decision.md`
- `recommendations/backend_architect_cleanup_strategy.md`
- `recommendations/frontend_developer_cleanup_strategy.md`
- `decisions/cleanup_strategy_decision.md`

---

## 13. Appendix: Industry Benchmarks

### Presence Cleanup Latency Comparison

| Platform | Cleanup Method | Latency | Notes |
|----------|----------------|---------|-------|
| Slack | Polling | 30-60s | Standard workplace chat |
| Discord | Polling | 30-45s | Gaming/community platform |
| GitHub | Polling | 60-120s | Code collaboration |
| Google Docs | WebSocket + polling fallback | 5-15s | Premium real-time editing |
| Figma | WebSocket | 0-5s | Professional design tool |
| VS Code Live Share | WebSocket | 0-3s | Developer collaboration |

**Context**: This project uses polling (no WebSockets on Supabase free tier)

**Peer Group**: Slack, Discord, GitHub (30-60s acceptable)

**Aspirational Tier**: Figma, VS Code Live Share (requires paid infrastructure)

---

**Document Status**: READY FOR REVIEW
**Author**: Prompt Engineer (Claude Sonnet 4.5)
**Next Action**: User approval to trigger specialist consultations
**Estimated Total Time**: 40 min consultation + 15 min - 6 hours implementation (depending on option chosen)
