# Risk-Based Checkpoint Framework - Decision Record

**Date**: 2026-01-08
**Sprint**: Sprint 0 (AGILE Transformation)
**Decision Owner**: User
**Recommendation By**: Decision Council (unanimous 4-0 vote)

---

## Decision

**APPROVED: Option D-A - Risk-Based Adaptive Checkpoint Framework (HIGH risk phases only)**

---

## What This Means

### Checkpoint Strategy

**HIGH Risk Phases** → Pause for user approval before proceeding
- Business Analyst requirements (complex, foundational)
- Lead Engineer architecture (hard to reverse)

**MEDIUM/LOW Risk Phases** → Continue autonomous, user reviews at end
- Product Owner user stories
- QA Lead test strategy
- Scrum Master sprint consolidation
- Implementation details

### Risk Classification Criteria

**HIGH Risk**:
- Complex work (14+ agents, architectural decisions)
- Foundational (affects all subsequent work)
- Hard to reverse (changing architecture later is expensive)
- User expertise valuable (user can spot issues we might miss)

**MEDIUM Risk**:
- Important but reviewable later
- Can be adjusted without major rework
- Standard patterns with low novelty

**LOW Risk**:
- Implementation details
- Easily reversible
- Well-understood patterns

---

## Sprint 0 Application

### Planning Phase

1. ✅ **Product Owner** writes user stories → **MEDIUM risk** → Autonomous (approved at end of planning)
2. ✅ **Business Analyst** refines requirements → **HIGH risk** → **CHECKPOINT** (user approved 2026-01-08)
3. ⏳ **Lead Engineer** technical design → **HIGH risk** → **CHECKPOINT** (pending)
4. **QA Lead** test strategy → **LOW risk** → Autonomous
5. **Scrum Master** sprint consolidation → **LOW risk** → Autonomous

### Execution Phase

- TDD RED phase → **LOW risk** (tests can be refined)
- TDD GREEN phase → **MEDIUM risk** (implementation reviewed during refactor)
- TDD REFACTOR phase → **HIGH risk** → **CHECKPOINT** (architecture quality gate)

---

## Rationale (Decision Council Analysis)

### 5-Dimension Scorecard: 39/40

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Efficiency** | 9/10 | Focuses user attention on high-leverage decisions only, eliminates decision fatigue |
| **Quality** | 10/10 | Real quality gates where they matter, not superficial checkpoints |
| **Effectiveness** | 10/10 | User makes informed decisions on complex choices, autonomous on routine work |
| **Security** | N/A | Not applicable to planning phase |
| **Best Practice** | 10/10 | Aligns with risk-based project management (PMI, PRINCE2 standards) |

### Decision Council Vote

- **Critical Analyst**: APPROVE (prevents illusion of oversight)
- **Risk Manager**: APPROVE (focuses on compounding defect risk)
- **Innovation Strategist**: APPROVE (scalable framework, portfolio value)
- **Context Researcher**: APPROVE (matches user's demonstrated priorities)

**Unanimous 4-0 for Option D-A**

---

## Benefits

### Immediate (Sprint 0)
- User reviews complex requirements (14 agents) before we build on them
- User approves architecture before implementation
- Team moves fast on low-risk work (QA strategy, sprint consolidation)

### Long-Term (Sprint 1, 2, 3...)
- **No decision fatigue** - User doesn't approve every minor detail
- **Scalable** - Framework works for 1-day features and 2-week features
- **Portfolio value** - Demonstrates sophisticated PM, not just "asking permission"
- **Learning** - User learns where to apply scrutiny in AI agent management

### Process Quality
- **Honest** - Acknowledges not all decisions are equal
- **Efficient** - User time spent on high-value decisions
- **Effective** - Catches issues early (requirements, architecture) before they compound

---

## Implementation Rules

### Rule 1: When in Doubt, Elevate
- If unsure whether something is LOW/MEDIUM/HIGH risk, classify as next level up
- User can always downgrade (e.g., "this is actually LOW, continue autonomous")

### Rule 2: User Can Always Request Review
- Even for LOW risk phases, user can say "pause, I want to review this"
- Framework is default, not straitjacket

### Rule 3: Checkpoints Are Decision Points, Not Approvals
- User sees: "Here's what we designed, here's the trade-offs, approve or modify?"
- NOT: "We did work, please rubber-stamp"

### Rule 4: Document All Checkpoints
- Record what was reviewed
- Record user's decision (approve, modify, or reject)
- Record rationale for risk classification

---

## Escape Hatches

### If User Spots Issue During Autonomous Phase
- User can interrupt anytime with "stop, I see a problem"
- We rollback to last checkpoint
- Re-classify risk level if needed

### If Framework Feels Too Rigid
- User can request "just show me everything" mode
- User can request "full autonomous, review at sprint end" mode
- Framework adapts to user preference

### If Risk Assessment Disagreement
- Lead Engineer proposes risk level
- User can override ("I consider this HIGH risk, let me review")
- Disagreements inform future risk criteria refinement

---

## Success Metrics

### Sprint 0
- **Target**: Complete planning in 45 minutes (vs 30 min baseline, 90 min with all checkpoints)
- **Target**: User approves architecture without major rework
- **Target**: Zero issues discovered during implementation that could have been caught at architecture checkpoint

### Long-Term (Next 3 Sprints)
- **Target**: <2 checkpoints per sprint on average (efficient)
- **Target**: Issues caught at checkpoints, not during implementation (effective)
- **Target**: User reports satisfaction with checkpoint frequency (not too many, not too few)

---

## Framework Application (Sprint 0 Status)

### Completed
1. ✅ Product Owner user stories (6 stories, Sprint goal)
2. ✅ Business Analyst requirements (14 agents, functional/non-functional requirements)
   - **CHECKPOINT**: User approved 2026-01-08

### Next Steps
3. Lead Engineer technical design (architecture, implementation sequence)
   - **CHECKPOINT**: Will pause after completion for user review
4. QA Lead test strategy (validation approach)
   - Autonomous (LOW risk)
5. Scrum Master sprint consolidation
   - Autonomous (LOW risk)

**Current Phase**: Lead Engineer technical design (in progress)

---

## Documentation Location

This framework will be added to CLAUDE.md in the following sections:

### Section: "Risk-Based Checkpoint Framework"
- Classification criteria (HIGH/MEDIUM/LOW)
- Implementation rules
- Escape hatches

### Section: "AGILE Sprint Planning Workflow"
- Checkpoint points marked in workflow
- Risk level for each phase
- Example checkpoint conversations

### Section: "Anti-Patterns to Avoid"
- ❌ Uniform checkpoints at every phase (inefficient)
- ❌ No checkpoints (risky)
- ❌ Superficial summaries without meaningful review (illusion of oversight)
- ✅ Risk-based checkpoints (smart balance)

---

## Questions Answered

### Q: "How often will you need my approval?"
**A**: For Sprint 0, 2 checkpoints (Business Analyst requirements ✅, Lead Engineer architecture ⏳). For typical sprints, 1-2 checkpoints depending on complexity.

### Q: "What if I want to see more/less?"
**A**: You can always request review (even for LOW risk) or waive review (even for HIGH risk). Framework is flexible default, not rigid rule.

### Q: "How is this different from just 'ask permission for everything'?"
**A**: We classify WHICH decisions need your input vs which are routine. You make architectural choices (your expertise valuable), we execute implementation details (our expertise). Respects both roles.

### Q: "What if I disagree with risk classification?"
**A**: You override. If we say "LOW risk, continuing autonomous" and you say "actually I want to review this," we pause. You have veto power always.

---

## Lessons Learned (To Be Updated)

This section will be updated after Sprint 0 completes to capture:
- What worked well about the framework
- What needs adjustment
- Actual vs estimated checkpoint frequency
- User satisfaction feedback
- Process improvements for Sprint 1

---

**Status**: ACTIVE - Framework approved and in use for Sprint 0

**Next Review**: End of Sprint 0 (during Sprint Retrospective)

**Owner**: User + Scrum Master (framework maintenance)

**Last Updated**: 2026-01-08
