# Multi-Agent Consultation: Supabase Migration Recovery

**Status**: READY TO EXECUTE
**Priority**: HIGH (blocking Week 2 progress)
**Total Time**: 60 minutes
**User-Blocking Time**: 35 minutes

---

## Quick Navigation

### For Immediate Execution (Start Here)
- **QUICK_START_AGENT_CONSULTATION.md** - Copy/paste instructions for each phase (5 min read)
- **CONSULTATION_SUMMARY.md** - Executive summary with next steps (10 min read)

### For Full Context (If You Need Details)
- **AGENT_CONSULTATION_STRATEGY.md** - Comprehensive 400+ line strategy document (30 min read)
- **WORKFLOW_DIAGRAM.md** - Visual diagrams of workflow, timeline, data flow (15 min read)

### Agent Prompt Files (Input)
- **prompts/backend_architect_migration_strategy.md** - Input for Backend Architect
- **prompts/decision_council_migration_decision.md** - Input for Decision Council

### Agent Output Files (To Be Created)
- **recommendations/backend_architect_migration_strategy.md** - Output from Backend Architect
- **decisions/migration_recovery_decision.md** - Output from Decision Council

---

## The Problem

Migration 001_create_realtime_schema.sql partially failed on Supabase free tier:
- User reports only 2/4 tables exist (presence, cursors)
- Missing tables: pr_sessions, comments (likely)
- Constraint: SQL Editor only (no CLI), zero cost

---

## The Solution (3 Phases)

### Phase 1: Backend Architect Diagnostic (10 min)
Switch to Backend Architect agent and ask them to:
1. Read prompt file: `prompts/backend_architect_migration_strategy.md`
2. Analyze migration failure
3. Recommend strategy (Option A/B/C)
4. Write to: `recommendations/backend_architect_migration_strategy.md`

### Phase 2: Decision Council Synthesis (5 min)
Switch to Decision Council agent and ask them to:
1. Read prompt file: `prompts/decision_council_migration_decision.md`
2. Read Backend Architect recommendation
3. Make GO/NO-GO decision
4. Write to: `decisions/migration_recovery_decision.md`

### Phase 3: Execute Approved Solution (35 min)
User executes SQL migration in Supabase:
1. Prompt Engineer extracts SQL from decision file
2. User pastes SQL into Supabase SQL Editor
3. User runs migration
4. User runs verification queries
5. Confirm success

---

## Files Created

```
code-review-dashboard/
├── README_CONSULTATION.md                     (THIS FILE - start here)
├── QUICK_START_AGENT_CONSULTATION.md          (Copy/paste instructions)
├── CONSULTATION_SUMMARY.md                    (Executive summary)
├── AGENT_CONSULTATION_STRATEGY.md             (Comprehensive strategy)
├── WORKFLOW_DIAGRAM.md                        (Visual diagrams)
│
├── prompts/
│   ├── backend_architect_migration_strategy.md    (INPUT for Agent 1)
│   └── decision_council_migration_decision.md     (INPUT for Agent 2)
│
├── recommendations/
│   └── backend_architect_migration_strategy.md    (OUTPUT from Agent 1)
│
└── decisions/
    └── migration_recovery_decision.md             (OUTPUT from Agent 2)
```

---

## Next Steps (Copy/Paste)

### 1. Read Quick Start Guide (5 min)
```
Open: QUICK_START_AGENT_CONSULTATION.md
```

### 2. Start Phase 1: Backend Architect (10 min)
```
Switch to: Backend Architect agent

Instruction:
Read the prompt file at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/backend_architect_migration_strategy.md

Analyze the Supabase migration failure and provide your strategic recommendation.

Write your complete analysis to:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md
```

### 3. Verify Backend Architect Completed
```
Check file exists:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md
```

### 4. Start Phase 2: Decision Council (5 min)
```
Switch to: Decision Council agent

Instruction:
Read the prompt file at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/decision_council_migration_decision.md

Read the Backend Architect's recommendation and make a final decision.

Write your decision to:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md
```

### 5. Verify Decision Council Completed
```
Check file exists:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md
```

### 6. Execute Approved Solution (35 min)
```
Read decision file
Extract SQL migration
Provide to user for execution in Supabase
Run verification queries
Confirm success
```

---

## Success Criteria

You'll know this worked when:

- [ ] Backend Architect created recommendation file (Phase 1)
- [ ] Decision Council created decision file (Phase 2)
- [ ] User executed SQL in Supabase without errors (Phase 3)
- [ ] All 4 tables exist: pr_sessions, presence, cursors, comments
- [ ] All RLS policies are active
- [ ] All functions exist: cleanup_stale_sessions, cleanup_stale_presence, update_updated_at_column
- [ ] All triggers exist: update_comments_updated_at, update_cursors_updated_at
- [ ] Total time under 60 minutes
- [ ] Week 2 progress is unblocked

---

## Troubleshooting

| Issue | File to Read |
|-------|--------------|
| Backend Architect doesn't respond | QUICK_START_AGENT_CONSULTATION.md (Troubleshooting section) |
| Decision Council blocked | QUICK_START_AGENT_CONSULTATION.md (Troubleshooting section) |
| SQL execution fails | QUICK_START_AGENT_CONSULTATION.md (Troubleshooting section) |
| Need full context | AGENT_CONSULTATION_STRATEGY.md (Rollback Plan section) |
| Want to understand workflow | WORKFLOW_DIAGRAM.md (Visual diagrams) |

---

## Why This Approach?

This is an optimized multi-agent consultation strategy using:

1. **Workaround Pattern**: Agents communicate via shared files (can't talk directly)
2. **Parallel Diagnostic**: Backend Architect works independently (saves time)
3. **Sequential Decision**: Decision Council waits for Backend Architect (required dependency)
4. **Structured Prompts**: Each agent gets exactly what they need, no more, no less
5. **Objective Scoring**: Weighted matrix removes bias from decision-making
6. **Built-in Verification**: SQL queries to confirm success at every step

**Result**: 60-minute structured consultation vs 2+ hours of ad-hoc back-and-forth.

---

## Document Reading Order

### If you have 5 minutes
1. Read: **QUICK_START_AGENT_CONSULTATION.md**
2. Execute: Phase 1 → Phase 2 → Phase 3

### If you have 15 minutes
1. Read: **CONSULTATION_SUMMARY.md** (high-level overview)
2. Read: **QUICK_START_AGENT_CONSULTATION.md** (execution steps)
3. Execute: Phase 1 → Phase 2 → Phase 3

### If you have 60 minutes
1. Read: **CONSULTATION_SUMMARY.md** (10 min)
2. Read: **AGENT_CONSULTATION_STRATEGY.md** (30 min)
3. Read: **WORKFLOW_DIAGRAM.md** (15 min)
4. Read: **QUICK_START_AGENT_CONSULTATION.md** (5 min)
5. Execute: Phase 1 → Phase 2 → Phase 3

### If you just want to execute NOW
1. Open: **QUICK_START_AGENT_CONSULTATION.md**
2. Follow: Phase 1 instructions
3. Switch agents and continue

---

## Key Concepts

### Workaround Pattern
Agents can't communicate directly, so they coordinate through shared files:
- Agent A writes to file X
- Agent B reads from file X
- Agent B writes to file Y
- Prompt Engineer reads file Y and executes

### Parallel vs Sequential
- **Parallel**: Backend Architect can work independently (no dependencies)
- **Sequential**: Decision Council MUST wait for Backend Architect (requires input)

### Prompt Engineering Techniques
- Role + Context + Task + Deliverable
- Multiple options with tradeoffs
- Constraint checklists
- Weighted scoring matrices
- Success metrics

---

## Estimated Timeline

| Phase | Duration | Cumulative | Who |
|-------|----------|------------|-----|
| Preparation | 5 min | 5 min | Prompt Engineer |
| Phase 1 (Backend Architect) | 10 min | 15 min | Agent |
| Phase 2 (Decision Council) | 5 min | 20 min | Agent |
| Phase 3 (Execute migration) | 30 min | 50 min | User |
| Verification | 5 min | 55 min | User |
| Buffer | 5 min | 60 min | - |

**Total**: 60 minutes wall-clock time
**User-blocking**: 35 minutes (only Phase 3 + verification)

---

## Contact / Escalation

If this process fails or gets stuck:

1. **Backend Architect doesn't respond (10 min)**: Skip to fast-track (Prompt Engineer creates Migration 002 directly)
2. **Decision Council blocked**: User makes final decision based on Backend Architect recommendation
3. **SQL execution fails**: Run emergency rollback SQL and retry migration 001 from scratch
4. **Complete failure**: Manual table creation as last resort

---

**Created by**: Prompt Engineer
**Date**: 2026-01-06
**Purpose**: Optimize multi-agent consultation for Supabase migration recovery
**Status**: READY TO EXECUTE
**Next Action**: Read QUICK_START_AGENT_CONSULTATION.md and start Phase 1
