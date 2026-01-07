# Presence System Cleanup Decision - Summary

**Status**: Ready for Decision Council Consultation
**Date**: 2026-01-06
**Session**: #5

---

## Quick Decision

**Should we fix the beforeunload cleanup or accept current polling behavior?**

- **Option A**: Accept polling cleanup (23-27s latency, 15 min to implement)
- **Option B**: Fix with navigator.sendBeacon (0-5s latency, 2-6 hours to implement)
- **Option C**: Hybrid UI approach (show "recently left" badge, 30 min to implement)

**Prompt Engineer Recommendation**: YES, Decision Council consultation is MANDATORY

---

## Why Decision Council is Required

This decision meets ALL criteria for complex consultation:
1. ✅ Multiple valid solutions exist
2. ✅ Clear tradeoffs (UX vs maintainability vs timeline)
3. ✅ Requires specialist input (Backend Architect, Frontend Developer)
4. ✅ Timeline implications (Week 2 Day 3 live cursors)
5. ✅ Architecture implications (REST endpoint, browser APIs)

**Cannot skip** - this is exactly the type of decision the Agent Consultation Policy was designed for.

---

## Key Numbers

| Metric | Option A (Polling) | Option B (sendBeacon) | Option C (Hybrid) |
|--------|-------------------|----------------------|-------------------|
| **Cleanup Latency** | 23-27 seconds | 0-5 seconds | 23-27s (better UX) |
| **Implementation Time** | 15 minutes | 2-6 hours | 30 minutes |
| **Complexity** | Remove dead code | Add REST endpoint | Add UI state |
| **Risk Level** | LOW | MEDIUM-HIGH | LOW |
| **Week 2 Day 3 Impact** | No delay | 2-6 hour delay | No delay |

---

## Consultation Workflow (40 minutes)

### Phase 1: Parallel Specialists (20 min)
**Backend Architect** (10 min):
- Evaluate Supabase REST API + sendBeacon compatibility
- Security implications of cleanup endpoint
- Realistic implementation time

**Frontend Developer** (10 min):
- navigator.sendBeacon browser compatibility
- Best practices for beforeunload cleanup
- Testing strategies

### Phase 2: Decision Council (15 min)
- Apply weighted decision matrix (6 criteria)
- Read specialist recommendations
- Make GO/NO-GO decision

### Phase 3: User Approval (5 min)
- Review decision
- Execute implementation

---

## Files Created

**Analysis Document** (13,000+ words):
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/prompt_engineer_cleanup_decision_analysis.md`

**This Summary**:
- `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/CLEANUP_DECISION_SUMMARY.md`

---

## Next Steps

**Option 1: Full Consultation (Recommended)**
1. Review analysis document (10 min read)
2. Trigger Backend Architect consultation
3. Trigger Frontend Developer consultation (parallel)
4. Trigger Decision Council with specialist inputs
5. Execute approved decision

**Option 2: Quick Decision (If Time-Constrained)**
1. Accept Option A (polling cleanup, 15 min implementation)
2. Defer Option B/C to Week 3 if UX complaints arise
3. Continue Week 2 Day 3 (live cursors) on schedule

**Option 3: Emergency Bypass (NOT Recommended)**
- This doesn't meet emergency criteria (no production outage)
- User data not at risk
- Should follow standard consultation workflow

---

## Recommendation

**Prompt Engineer Strongly Recommends**: Full consultation workflow (40 min)

**Reasoning**:
1. This is exactly what Agent Consultation Policy was designed for
2. 40 minutes investment prevents 2-6 hours of wrong path
3. Specialists may identify Option C (hybrid) or Option D we haven't considered
4. Decision Council weighted matrix removes personal bias
5. Documentation of rationale helps future sessions

**Quick Decision Acceptable If**:
- Timeline pressure (must start live cursors NOW)
- User confident in Option A (polling cleanup)
- Willing to revisit in Week 3 if UX complaints arise

---

## Key Quote from Analysis

> "The beforeunload handler (use-presence.ts:221-246) uses async Supabase operations, but browsers don't wait for async operations to complete when closing pages. The page closes immediately, cleanup doesn't fire, and polling cleanup removes stale presence after 30 seconds."

**Translation**: The code we wrote doesn't work. Polling cleanup works. Question is: fix it (complex) or accept it (simple)?

---

**Status**: Awaiting user direction
**Total Consultation Time**: 40 minutes
**Post-Decision Implementation**: 15 min (Option A) or 2-6 hours (Option B) or 30 min (Option C)
