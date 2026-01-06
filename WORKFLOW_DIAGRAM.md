# Multi-Agent Consultation Workflow Diagram

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           START: SUPABASE MIGRATION FAILURE             │
│                    (Only 2/4 tables exist: presence, cursors)           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PREPARATION (T+0 to T+5 min)                                           │
│  Actor: Prompt Engineer (you)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Actions:                                                               │
│  ✓ Create directory structure (prompts/, recommendations/, decisions/)  │
│  ✓ Create Backend Architect prompt file                                │
│  ✓ Create Decision Council prompt file                                 │
│  ✓ Review migration 001 to understand failure                          │
│                                                                         │
│  Deliverable: Prompt files ready for agents                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DIAGNOSTIC (T+5 to T+15 min) - PARALLEL                      │
│  Agent: Backend Architect                                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Input:                                                                 │
│  → Reads: prompts/backend_architect_migration_strategy.md               │
│  → Reads: supabase/migrations/001_create_realtime_schema.sql           │
│                                                                         │
│  Task:                                                                  │
│  • Analyze why migration 001 failed (root cause)                       │
│  • Evaluate 3 options: Migration 002 / Fix 001 / Manual + 002          │
│  • Recommend best approach with rationale                              │
│  • Provide copy/paste ready SQL                                        │
│  • Include verification queries                                        │
│  • Document rollback plan                                              │
│                                                                         │
│  Output:                                                                │
│  → Writes: recommendations/backend_architect_migration_strategy.md      │
│                                                                         │
│  Success Criteria:                                                      │
│  ✓ Clear recommendation (Option A/B/C)                                 │
│  ✓ SQL is idempotent (safe to retry)                                   │
│  ✓ Works on Supabase free tier                                         │
│  ✓ Single copy/paste operation                                         │
│  ✓ Completed in 10 minutes                                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  VERIFICATION CHECKPOINT (T+15 min)                                     │
│  Actor: Prompt Engineer (you)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Check:                                                                 │
│  [ ] Backend Architect created output file                             │
│  [ ] Output file contains recommendation                               │
│  [ ] Recommendation includes SQL scripts                               │
│  [ ] SQL appears valid (no obvious errors)                             │
│                                                                         │
│  If ANY check fails → Troubleshoot or skip to fast-track               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: DECISION SYNTHESIS (T+15 to T+20 min) - SEQUENTIAL           │
│  Agent: Decision Council                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Input:                                                                 │
│  → Reads: prompts/decision_council_migration_decision.md                │
│  → Reads: recommendations/backend_architect_migration_strategy.md       │
│  → Reads: supabase/migrations/001_create_realtime_schema.sql           │
│                                                                         │
│  Task:                                                                  │
│  • Synthesize Backend Architect's recommendation                       │
│  • Apply weighted scoring matrix (Speed 30%, Risk 25%, etc.)           │
│  • Make GO/NO-GO decision                                              │
│  • Create step-by-step implementation plan                             │
│  • Define success metrics and verification queries                     │
│                                                                         │
│  Output:                                                                │
│  → Writes: decisions/migration_recovery_decision.md                     │
│                                                                         │
│  Success Criteria:                                                      │
│  ✓ Clear decision (GO with Option X / NO-GO)                           │
│  ✓ Decision justified with scoring matrix                              │
│  ✓ Implementation plan has numbered steps                              │
│  ✓ Success metrics are measurable                                      │
│  ✓ Completed in 5 minutes                                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  GO/NO-GO DECISION POINT (T+20 min)                                     │
│  Actor: Prompt Engineer + User                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Read: decisions/migration_recovery_decision.md                         │
│                                                                         │
│  If GO:                                                                 │
│  → Proceed to Phase 3 (Execution)                                      │
│                                                                         │
│  If NO-GO:                                                              │
│  → Review why decision was rejected                                    │
│  → Escalate to user for manual decision                                │
│  → Or switch to fast-track approach                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: EXECUTION (T+20 to T+50 min) - USER ACTION REQUIRED          │
│  Actor: User (guided by Prompt Engineer)                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Step 1: Extract SQL (5 min)                                           │
│  • Prompt Engineer reads decision file                                 │
│  • Extracts approved SQL migration                                     │
│  • Provides to user as copy/paste block                                │
│                                                                         │
│  Step 2: User Opens Supabase (2 min)                                   │
│  • User logs into Supabase Dashboard                                   │
│  • User navigates to SQL Editor                                        │
│  • User creates new query                                              │
│                                                                         │
│  Step 3: Execute Migration (20 min)                                    │
│  • User pastes SQL into editor                                         │
│  • User clicks "Run"                                                   │
│  • User reports any errors (if any)                                    │
│  • If errors: diagnose and retry                                       │
│                                                                         │
│  Step 4: Verification (8 min)                                          │
│  • User runs verification queries (check tables exist)                 │
│  • User runs verification queries (check RLS enabled)                  │
│  • User runs verification queries (check policies exist)               │
│  • User runs verification queries (check functions exist)              │
│  • User runs verification queries (check triggers exist)               │
│  • User confirms all checks pass                                       │
│                                                                         │
│  Success Criteria:                                                      │
│  ✓ SQL executed without errors                                         │
│  ✓ All 4 tables exist (pr_sessions, presence, cursors, comments)       │
│  ✓ RLS enabled on all tables                                           │
│  ✓ All policies created                                                │
│  ✓ All functions exist                                                 │
│  ✓ All triggers exist                                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FINAL VERIFICATION (T+50 to T+55 min)                                  │
│  Actor: Prompt Engineer                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Actions:                                                               │
│  • Review user's verification query results                            │
│  • Confirm all success criteria met                                    │
│  • Document any issues encountered                                     │
│  • Update migration tracking (if applicable)                           │
│                                                                         │
│  Deliverable:                                                           │
│  ✓ Confirmation that database is in correct state                      │
│  ✓ Week 2 progress is unblocked                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUCCESS: MIGRATION COMPLETE                      │
│         All 4 tables exist with policies, functions, and triggers       │
│                     Total time: 55 minutes (5 min buffer)               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────┐
│  Migration 001 SQL   │ ──────────────┐
│  (partial failure)   │               │
└──────────────────────┘               │
                                       │
                                       ▼
                            ┌────────────────────────┐
                            │  Backend Architect     │
                            │  (reads migration)     │
                            └───────────┬────────────┘
                                       │
                                       │ writes
                                       ▼
                            ┌────────────────────────┐
                            │  Recommendation File   │
                            │  (Option A/B/C + SQL)  │
                            └───────────┬────────────┘
                                       │
                                       │ reads
                                       ▼
                            ┌────────────────────────┐
                            │  Decision Council      │
                            │  (synthesizes)         │
                            └───────────┬────────────┘
                                       │
                                       │ writes
                                       ▼
                            ┌────────────────────────┐
                            │  Decision File         │
                            │  (GO/NO-GO + steps)    │
                            └───────────┬────────────┘
                                       │
                                       │ reads
                                       ▼
                            ┌────────────────────────┐
                            │  Prompt Engineer       │
                            │  (extracts SQL)        │
                            └───────────┬────────────┘
                                       │
                                       │ provides
                                       ▼
                            ┌────────────────────────┐
                            │  User                  │
                            │  (executes in Supabase)│
                            └───────────┬────────────┘
                                       │
                                       │ creates
                                       ▼
                            ┌────────────────────────┐
                            │  Database Tables       │
                            │  (verified success)    │
                            └────────────────────────┘
```

---

## Agent Communication Pattern (Workaround Pattern)

```
Backend Architect Agent                Decision Council Agent
        │                                      │
        │                                      │
        ▼                                      │
 ┌──────────────┐                             │
 │ Reads prompt │                             │
 │     file     │                             │
 └──────┬───────┘                             │
        │                                      │
        ▼                                      │
 ┌──────────────┐                             │
 │  Analyzes    │                             │
 │  migration   │                             │
 └──────┬───────┘                             │
        │                                      │
        ▼                                      │
 ┌──────────────┐                             │
 │   Writes     │                             │
 │ recommenda-  │                             │
 │   tion file  │ ─────────────┐              │
 └──────────────┘               │              │
                                │              │
                         "Shared File"         │
                          (handoff)            │
                                │              │
                                │              ▼
                                │       ┌──────────────┐
                                │       │ Reads prompt │
                                │       │     file     │
                                │       └──────┬───────┘
                                │              │
                                │              ▼
                                │       ┌──────────────┐
                                └─────▶ │    Reads     │
                                        │ recommenda-  │
                                        │  tion file   │
                                        └──────┬───────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │ Synthesizes  │
                                        │  decision    │
                                        └──────┬───────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │   Writes     │
                                        │ decision file│
                                        └──────────────┘

KEY INSIGHT: Agents never communicate directly.
They coordinate through shared files (workaround pattern).
```

---

## Timeline Visualization

```
Time (minutes)    0    5    10   15   20   25   30   35   40   45   50   55   60
                  │────│────│────│────│────│────│────│────│────│────│────│────│
                  │                                                              │
Prompt Engineer   │████                                                          │
(Prep)            │                                                              │
                  │                                                              │
Backend Architect │    │███████████                                             │
(Diagnostic)      │                                                              │
                  │                                                              │
Decision Council  │                   │█████                                     │
(Decision)        │                                                              │
                  │                                                              │
Prompt Engineer   │                        │██                                   │
(Extract SQL)     │                                                              │
                  │                                                              │
User              │                          │████████████████████████████████   │
(Execute + Verify)│                                                              │
                  │                                                              │
Buffer            │                                                          │███│
(Contingency)     │                                                              │
                  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

Legend:
█ = Active work (agent or user)
│ = Timeline marker (5-minute intervals)

Total: 60 minutes (wall clock)
User-blocking time: 35 minutes (minutes 20-55)
Agent work: 15 minutes (minutes 5-20)
```

---

## Decision Matrix Visualization

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DECISION SCORING MATRIX                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Criterion             Weight    Option A    Option B    Option C     │
│                                  (Mig 002)   (Fix 001)  (Manual+002)  │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
│  Execution Speed         30%       8/10        9/10        6/10       │
│  (faster = better)                 (2.4)       (2.7)       (1.8)      │
│                                                                        │
│  Risk of Data Loss       25%       9/10        7/10        8/10       │
│  (lower risk = better)             (2.25)      (1.75)      (2.0)      │
│                                                                        │
│  Idempotency             20%       9/10        10/10       9/10       │
│  (safe retry = better)             (1.8)       (2.0)       (1.8)      │
│                                                                        │
│  User Complexity         15%       9/10        10/10       6/10       │
│  (simpler = better)                (1.35)      (1.5)       (0.9)      │
│                                                                        │
│  Future Maintainability  10%       10/10       7/10        9/10       │
│  (better = better)                 (1.0)       (0.7)       (0.9)      │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│  TOTAL SCORE            100%       8.8/10      8.65/10     7.4/10     │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────  │
│  RECOMMENDATION: Option A (Migration 002)                             │
│  CONFIDENCE: High                                                      │
│  ───────────────────────────────────────────────────────────────────  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

This is what Decision Council will produce (example scores).
```

---

## File Dependency Graph

```
                    ┌──────────────────────┐
                    │  Migration 001 SQL   │
                    │   (pre-existing)     │
                    └──────────┬───────────┘
                               │
                               │ read by
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌───────────────────────┐     ┌───────────────────────┐
    │ Backend Architect     │     │ Decision Council      │
    │   Prompt File         │     │   Prompt File         │
    │   (created by PE)     │     │   (created by PE)     │
    └──────────┬────────────┘     └───────────────────────┘
               │                             │
               │ read by                     │ read by
               │                             │
               ▼                             ▼
    ┌───────────────────────┐     ┌───────────────────────┐
    │ Backend Architect     │     │ Decision Council      │
    │     Agent             │     │      Agent            │
    └──────────┬────────────┘     └──────────┬────────────┘
               │                             │
               │ writes                      │ writes
               │                             │
               ▼                             ▼
    ┌───────────────────────┐     ┌───────────────────────┐
    │  Recommendation File  │────▶│   Decision File       │
    │  (agent output)       │ read│   (agent output)      │
    └───────────────────────┘     └──────────┬────────────┘
                                             │
                                             │ read by
                                             │
                                             ▼
                                  ┌───────────────────────┐
                                  │  Prompt Engineer      │
                                  │  (extracts SQL)       │
                                  └──────────┬────────────┘
                                             │
                                             │ provides to
                                             │
                                             ▼
                                  ┌───────────────────────┐
                                  │      User             │
                                  │  (executes in Supabase│
                                  └──────────┬────────────┘
                                             │
                                             │ creates
                                             │
                                             ▼
                                  ┌───────────────────────┐
                                  │  Migration 002 SQL    │
                                  │  (if Option A chosen) │
                                  └───────────────────────┘

Legend:
PE = Prompt Engineer
──▶ = File dependency (reads from)
```

---

## Risk Mitigation Flowchart

```
┌────────────────────┐
│  Start Consultation│
└──────────┬─────────┘
           │
           ▼
    ┌──────────────────┐      NO      ┌────────────────────┐
    │ Backend Architect│─────────────▶│ Fast-track:        │
    │ responds in 10min│              │ PE creates         │
    └──────────┬───────┘              │ Migration 002      │
           │ YES                      │ directly           │
           │                          └────────────────────┘
           ▼
    ┌──────────────────┐      NO      ┌────────────────────┐
    │ Recommendation   │─────────────▶│ Request revision   │
    │ meets constraints│              │ or escalate to user│
    └──────────┬───────┘              └────────────────────┘
           │ YES
           │
           ▼
    ┌──────────────────┐      NO      ┌────────────────────┐
    │ Decision Council │─────────────▶│ User makes final   │
    │ reaches consensus│              │ decision manually  │
    └──────────┬───────┘              └────────────────────┘
           │ YES
           │
           ▼
    ┌──────────────────┐
    │ Decision = GO?   │
    └──────────┬───────┘
           │ YES
           │
           ▼
    ┌──────────────────┐      FAIL    ┌────────────────────┐
    │ User executes SQL│─────────────▶│ Run rollback SQL   │
    │ in Supabase      │              │ or manual cleanup  │
    └──────────┬───────┘              └────────────────────┘
           │ SUCCESS
           │
           ▼
    ┌──────────────────┐      FAIL    ┌────────────────────┐
    │ Verification     │─────────────▶│ Diagnose and retry │
    │ queries pass?    │              │ or escalate        │
    └──────────┬───────┘              └────────────────────┘
           │ SUCCESS
           │
           ▼
    ┌──────────────────┐
    │  Complete Success│
    │  Week 2 unblocked│
    └──────────────────┘
```

---

## Quick Reference: Agent Inputs/Outputs

```
┌──────────────────────────────────────────────────────────────┐
│ Backend Architect                                             │
├──────────────────────────────────────────────────────────────┤
│ INPUT:                                                        │
│ • prompts/backend_architect_migration_strategy.md             │
│ • supabase/migrations/001_create_realtime_schema.sql         │
│                                                               │
│ OUTPUT:                                                       │
│ • recommendations/backend_architect_migration_strategy.md     │
│                                                               │
│ TIME: 10 minutes                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Decision Council                                              │
├──────────────────────────────────────────────────────────────┤
│ INPUT:                                                        │
│ • prompts/decision_council_migration_decision.md              │
│ • recommendations/backend_architect_migration_strategy.md     │
│ • supabase/migrations/001_create_realtime_schema.sql         │
│                                                               │
│ OUTPUT:                                                       │
│ • decisions/migration_recovery_decision.md                    │
│                                                               │
│ TIME: 5 minutes                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ User (guided by Prompt Engineer)                              │
├──────────────────────────────────────────────────────────────┤
│ INPUT:                                                        │
│ • decisions/migration_recovery_decision.md                    │
│   (extracts SQL migration from this file)                    │
│                                                               │
│ OUTPUT:                                                       │
│ • Supabase database with all 4 tables                        │
│ • Supabase database with RLS policies                        │
│ • Supabase database with functions and triggers              │
│                                                               │
│ TIME: 30-35 minutes                                           │
└──────────────────────────────────────────────────────────────┘
```

---

**Created by**: Prompt Engineer
**Purpose**: Visual aid for understanding multi-agent consultation workflow
**Use case**: Reference this when executing similar consultations in future
