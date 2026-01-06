# Multi-Agent Consultation Strategy: Supabase Migration Recovery

**Status**: ACTIVE - Blocking Week 2 Progress
**Created**: 2026-01-06
**Target Resolution**: 60 minutes
**Consultation ID**: supabase-migration-001-recovery

---

## Executive Summary

**Problem**: Migration 001_create_realtime_schema.sql partially failed on Supabase free tier
- 2/4 tables created successfully (presence, cursor)
- 2/4 tables failed or missing (pr_sessions, comments)
- Need to create migration 002 that handles partial state safely

**Root Cause Analysis** (Preliminary):
The migration script has DROP CASCADE statements (lines 37-40) followed by CREATE TABLE statements. If the script ran partially:
1. SUCCESS: pr_sessions table created (line 51-61)
2. SUCCESS: presence table created (line 72-85) - depends on pr_sessions
3. SUCCESS: cursors table created (line 95-108) - depends on pr_sessions
4. LIKELY FAILURE POINT: comments table creation (line 118-131)

**Constraint**: This suggests the script ran successfully through line ~112, then failed. The user reports "only presence and cursor exist" which contradicts the dependency chain (both depend on pr_sessions). Need clarification.

**Critical Constraint**: User is on Supabase free tier using SQL Editor (copy/paste only, no CLI).

---

## Optimized Consultation Strategy

### Phase 1: PARALLEL Diagnostic (10 minutes)
Run these consultations simultaneously to gather comprehensive data:

#### Agent 1: Supabase Database Specialist (Already Active - Resume a9e7855)
**Status**: Check if already investigating
**If Active**: Wait for findings
**If Not Active**: Skip (we'll handle this ourselves)

#### Agent 2: Backend Architect
**Purpose**: Migration strategy assessment
**Consultation Type**: Parallel (no dependency on other agents)
**Deliverable**: Strategic recommendation document

---

### Phase 2: SEQUENTIAL Decision Making (15 minutes)
Based on Phase 1 findings, consult Decision Council for final strategy.

#### Agent 3: Decision Council
**Purpose**: Synthesize diagnostics into actionable decision
**Consultation Type**: Sequential (requires Phase 1 completion)
**Deliverable**: Go/No-Go decision with rationale

---

### Phase 3: Implementation (35 minutes)
Execute approved solution based on Decision Council recommendation.

---

## Detailed Agent Prompts

### Agent 2: Backend Architect Consultation

**Prompt File**: `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/backend_architect_migration_strategy.md`

```markdown
# Backend Architect Consultation: Supabase Migration Recovery Strategy

## Context
You are the Backend Architect reviewing a partially failed Supabase database migration for a real-time code review dashboard.

## Current State
**Migration**: 001_create_realtime_schema.sql (279 lines)
**Execution Environment**: Supabase free tier, SQL Editor (copy/paste)
**Partial Success**: User reports only 2/4 tables exist (presence, cursors)

**Migration Script Location**:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/supabase/migrations/001_create_realtime_schema.sql

**Key Features of Migration 001**:
- DROP CASCADE cleanup (lines 12-45) - idempotent design
- Creates 4 tables: pr_sessions, presence, cursors, comments
- Foreign key dependencies: presence/cursors → pr_sessions (FK constraints)
- RLS policies for all tables (lines 143-212)
- Cleanup functions (lines 218-245)
- Triggers for updated_at (lines 262-278)

**Dependency Chain**:
```
pr_sessions (parent)
  ↓ FK: session_id
  ├── presence (child)
  └── cursors (child)

comments (independent - only refs auth.users)
```

**Problem**: User reports presence + cursors exist, but this is impossible without pr_sessions due to FK constraints. Need to verify actual database state.

## Your Task

Provide a strategic recommendation for ONE of these approaches:

### Option A: Create Migration 002 (Incremental Fix)
**Pros**:
- Preserves migration history
- Standard practice
- Allows rollback

**Cons**:
- More complex (must detect existing objects)
- Potential for partial state inconsistencies

### Option B: Fix Migration 001 (Retry)
**Pros**:
- Idempotent script already has DROP CASCADE
- Clean slate approach
- Simpler mental model

**Cons**:
- Loses migration history if 001 partially recorded
- May confuse Supabase migration tracking

### Option C: Manual Cleanup + Migration 002
**Pros**:
- Explicit state management
- Clear audit trail

**Cons**:
- Requires two copy/paste operations
- More user actions = more error risk

## Required Analysis

1. **Root Cause Hypothesis**: Why did migration 001 fail?
   - Line-by-line analysis (which statement likely failed?)
   - Supabase free tier limitations that could cause this?
   - FK constraint timing issues?

2. **State Verification Strategy**: How should we verify current database state?
   - SQL query to check existing tables
   - SQL query to check existing policies
   - SQL query to check existing functions

3. **Recommended Approach**: A, B, or C above (or hybrid)
   - Rationale based on Supabase free tier constraints
   - Risk assessment for each approach
   - Rollback strategy if recommendation fails

4. **Migration 002 Design** (if recommending Option A or C):
   - Idempotency strategy (IF NOT EXISTS vs DROP IF EXISTS)
   - Dependency handling (ensure pr_sessions exists before children)
   - Error handling for partial state
   - Verification queries at end

5. **Constraints Checklist**:
   - [ ] Works on Supabase free tier (no pg_cron, no custom extensions beyond uuid-ossp)
   - [ ] Copy/paste friendly (single SQL block preferred)
   - [ ] TypeScript strict mode compatible (schema types)
   - [ ] Zero cost (no additional Supabase features required)

## Deliverable Format

Provide a markdown document with:

### Section 1: Diagnostic Summary
- Root cause hypothesis (most likely failure point)
- State verification SQL (copy/paste ready)

### Section 2: Strategic Recommendation
- Recommended approach (A/B/C or hybrid)
- Rationale (3-5 bullet points)
- Risk assessment (low/medium/high)

### Section 3: Implementation Plan
- Step-by-step execution (numbered list)
- SQL scripts (copy/paste ready, in code blocks)
- Verification queries (how to confirm success)

### Section 4: Rollback Plan
- If this fails, what's the recovery path?
- Emergency cleanup SQL if needed

## Success Criteria
- Strategy is executable within 30 minutes
- Single copy/paste operation (or clearly separated steps)
- Idempotent (can be re-run safely)
- Compatible with Supabase free tier
- Preserves data integrity (FK constraints enforced)

---

**Consultation Deadline**: 10 minutes from receipt
**Output File**: /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md
```

---

### Agent 3: Decision Council Consultation

**Prompt File**: `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/decision_council_migration_decision.md`

```markdown
# Decision Council Consultation: Supabase Migration Recovery Decision

## Context
You are the Decision Council, responsible for making the final strategic decision on how to recover from a partially failed Supabase database migration.

## Input Documents (Read These First)

1. **Migration Script**:
   /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/supabase/migrations/001_create_realtime_schema.sql

2. **Backend Architect Recommendation**:
   /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md

3. **Supabase Specialist Findings** (if available):
   /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/supabase_specialist_findings.md

## Your Task

Synthesize the recommendations from Backend Architect (and Supabase Specialist if available) and make a SINGLE, CLEAR decision:

### Decision Framework

Use this weighted scoring system:

| Criterion | Weight | Option A (Mig 002) | Option B (Fix 001) | Option C (Manual + 002) |
|-----------|--------|--------------------|--------------------|-------------------------|
| **Execution Speed** (minutes to implement) | 30% | Score: __ | Score: __ | Score: __ |
| **Risk of Data Loss** (low=10, high=1) | 25% | Score: __ | Score: __ | Score: __ |
| **Idempotency** (can retry safely) | 20% | Score: __ | Score: __ | Score: __ |
| **User Complexity** (fewer steps=better) | 15% | Score: __ | Score: __ | Score: __ |
| **Future Maintainability** | 10% | Score: __ | Score: __ | Score: __ |
| **TOTAL SCORE** | 100% | **__** | **__** | **__** |

### Decision Criteria

**MUST HAVE**:
- [ ] Works on Supabase free tier (no CLI, no pg_cron)
- [ ] Executable via SQL Editor copy/paste
- [ ] Idempotent (safe to retry)
- [ ] Preserves data integrity (FK constraints)
- [ ] Executable in <30 minutes

**NICE TO HAVE**:
- [ ] Single operation (no multi-step process)
- [ ] Clear rollback path
- [ ] Preserves migration history
- [ ] Future-proof (won't cause issues with migration 003+)

## Required Analysis

1. **Multi-Perspective Review**:
   - Backend Architect's recommendation (strategy perspective)
   - Supabase Specialist's findings (technical perspective)
   - User constraint perspective (free tier, copy/paste only)

2. **Consensus or Conflict**:
   - Do the agents agree on approach?
   - If conflicting, what's the tie-breaker criterion?
   - Are there hidden assumptions that need testing?

3. **Risk Assessment**:
   - What's the worst-case scenario for each option?
   - What's the most likely failure mode?
   - How do we detect failure quickly?

4. **Validation Strategy**:
   - How do we verify the database is in correct state after execution?
   - What SQL queries confirm success?
   - What metrics indicate health?

## Deliverable Format

Provide a markdown document with:

### Section 1: Decision Summary (3 sentences max)
**DECISION**: [Option A / Option B / Option C / Hybrid]
**RATIONALE**: [One sentence why]
**CONFIDENCE**: [High / Medium / Low]

### Section 2: Scoring Matrix
[Fill in the table above with actual scores and justification]

### Section 3: Agent Synthesis
- Backend Architect recommended: [Summary]
- Supabase Specialist recommended: [Summary]
- Agreement level: [Full / Partial / Conflicting]
- Tie-breaker used (if needed): [Criterion]

### Section 4: Implementation Order
**Step-by-step execution plan**:
1. [Action 1] - [Who does it] - [Expected time]
2. [Action 2] - [Who does it] - [Expected time]
3. [Action 3] - [Who does it] - [Expected time]

**Total estimated time**: [X] minutes

### Section 5: Go/No-Go Checklist
Before executing, verify:
- [ ] User has SQL Editor open in Supabase
- [ ] Backup strategy confirmed (if applicable)
- [ ] Verification queries ready
- [ ] Rollback plan documented
- [ ] Expected outcome clearly defined

### Section 6: Success Metrics
We'll know we succeeded when:
- [ ] All 4 tables exist (pr_sessions, presence, cursors, comments)
- [ ] FK constraints are enforced
- [ ] RLS policies are active
- [ ] No orphaned objects (triggers, functions)
- [ ] TypeScript types can be generated

## Success Criteria
- Decision is clear and actionable (no ambiguity)
- Implementation plan is <30 minutes
- Risk is acceptable (data loss unlikely)
- User can execute with minimal technical knowledge
- Rollback is documented

---

**Consultation Deadline**: 5 minutes from receipt
**Output File**: /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md
```

---

## Consultation Sequencing

### Recommended Sequence: HYBRID (Parallel Diagnostic → Sequential Decision)

```
START (T+0)
  ↓
┌─────────────────────────────────────────┐
│ PHASE 1: PARALLEL DIAGNOSTIC (T+0-10m)  │
├─────────────────────────────────────────┤
│                                         │
│  Agent: Backend Architect              │
│  Task: Migration strategy analysis      │
│  Output: backend_architect_migration_   │
│          strategy.md                    │
│  Dependency: None (reads migration 001) │
│                                         │
│  Time: 10 minutes                       │
│                                         │
└─────────────────────────────────────────┘
  ↓ (Wait for completion)
  ↓
┌─────────────────────────────────────────┐
│ PHASE 2: DECISION SYNTHESIS (T+10-15m)  │
├─────────────────────────────────────────┤
│                                         │
│  Agent: Decision Council               │
│  Task: Synthesize recommendations       │
│  Input: backend_architect_migration_    │
│         strategy.md                     │
│  Output: migration_recovery_decision.md │
│  Dependency: Backend Architect complete │
│                                         │
│  Time: 5 minutes                        │
│                                         │
└─────────────────────────────────────────┘
  ↓
  ↓
┌─────────────────────────────────────────┐
│ PHASE 3: IMPLEMENTATION (T+15-50m)      │
├─────────────────────────────────────────┤
│                                         │
│  Actor: Prompt Engineer (you)          │
│  Task: Execute approved solution        │
│  Input: migration_recovery_decision.md  │
│  Output: Migration 002 SQL (if needed)  │
│  Dependency: Decision Council approval  │
│                                         │
│  Time: 35 minutes                       │
│                                         │
└─────────────────────────────────────────┘
  ↓
END (T+50m) - VERIFIED SUCCESS
```

### Why This Sequence?

**Parallel Diagnostic (Phase 1)**:
- Backend Architect doesn't need Supabase Specialist's findings to analyze migration strategy
- Both can work independently on different aspects:
  - Backend Architect: Strategy and design patterns
  - Supabase Specialist: Database state verification (if active)
- Saves 10 minutes vs sequential consultation

**Sequential Decision (Phase 2)**:
- Decision Council MUST wait for Backend Architect to finish
- Cannot make informed decision without strategic analysis
- 5-minute window is realistic for synthesis (not full analysis)

**Linear Implementation (Phase 3)**:
- Only one person can execute SQL in Supabase (the user)
- No parallelization possible
- Requires focused attention (can't split)

### Alternative Sequence (If Speed Critical)

If you need to cut time to 30 minutes total:

```
FAST TRACK (30 minutes total)
  ↓
Skip Backend Architect consultation
  ↓
Prompt Engineer (you) directly analyzes migration 001
  ↓
Creates Migration 002 using standard patterns
  ↓
User executes immediately
  ↓
Verify success
```

**Tradeoff**: Lower quality decision, higher risk of failure, but 20 minutes faster.

---

## Decision Synthesis Framework

### How to Synthesize Agent Recommendations

Once Backend Architect completes their analysis, use this framework:

#### Step 1: Extract Key Recommendations
```
Backend Architect recommends: [Option A / B / C]
Key rationale:
1. [Point 1]
2. [Point 2]
3. [Point 3]

Confidence level: [High / Medium / Low]
```

#### Step 2: Validate Against Constraints
```
Constraint Checklist:
[ ] Works on Supabase free tier? [YES/NO - Evidence: ___]
[ ] Copy/paste friendly? [YES/NO - Evidence: ___]
[ ] Idempotent? [YES/NO - Evidence: ___]
[ ] TypeScript compatible? [YES/NO - Evidence: ___]
[ ] <30 min execution? [YES/NO - Evidence: ___]

If ANY = NO, recommendation is REJECTED. Request revision.
```

#### Step 3: Risk Assessment
```
Risk Matrix:
- Data Loss Risk: [Low / Medium / High] - [Why?]
- Execution Failure Risk: [Low / Medium / High] - [Why?]
- Future Migration Risk: [Low / Medium / High] - [Why?]
- User Error Risk: [Low / Medium / High] - [Why?]

Overall Risk: [Low / Medium / High]
Acceptable? [YES / NO]
```

#### Step 4: Final Decision
```
APPROVED: [YES / NO]

If YES:
  Execute: [Step-by-step plan from recommendation]

If NO:
  Reason: [Why rejected]
  Alternative: [What to do instead]
  Escalation: [Who to consult next]
```

---

## Execution Plan

### Phase 1: Launch Backend Architect Consultation (T+0)

**Action**: Create prompt file and shared context
```bash
# 1. Create prompts directory
mkdir -p /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts

# 2. Create recommendations directory (for agent outputs)
mkdir -p /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations

# 3. Create decisions directory (for final decision)
mkdir -p /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions
```

**Then**:
1. Copy Backend Architect prompt (from this doc) to `prompts/backend_architect_migration_strategy.md`
2. Switch to Backend Architect agent
3. Give instruction: "Read the prompt file at prompts/backend_architect_migration_strategy.md and provide your analysis. Write your output to recommendations/backend_architect_migration_strategy.md"

**Expected Output**: `recommendations/backend_architect_migration_strategy.md` (created by Backend Architect)

**Time**: 10 minutes

---

### Phase 2: Launch Decision Council Consultation (T+10)

**Prerequisites**:
- [ ] Backend Architect has created `recommendations/backend_architect_migration_strategy.md`
- [ ] You have verified the recommendation file exists and is complete

**Action**:
1. Copy Decision Council prompt (from this doc) to `prompts/decision_council_migration_decision.md`
2. Switch to Decision Council agent
3. Give instruction: "Read the prompt file at prompts/decision_council_migration_decision.md and provide your decision. Read the input files specified in the prompt, then write your output to decisions/migration_recovery_decision.md"

**Expected Output**: `decisions/migration_recovery_decision.md` (created by Decision Council)

**Time**: 5 minutes

---

### Phase 3: Execute Approved Solution (T+15)

**Prerequisites**:
- [ ] Decision Council has created `decisions/migration_recovery_decision.md`
- [ ] Decision is GO (not NO-GO)
- [ ] User has Supabase SQL Editor open

**Action**:
1. Read the decision file
2. Extract the approved SQL migration
3. Verify idempotency (has IF NOT EXISTS or DROP IF EXISTS)
4. Provide to user as copy/paste ready SQL
5. User pastes into Supabase SQL Editor and runs
6. User runs verification queries
7. Confirm success or diagnose failure

**Expected Output**: Functional database with all 4 tables + policies + functions

**Time**: 35 minutes (includes user execution + verification)

---

## Success Metrics

### Consultation Success
- [ ] Backend Architect provides clear recommendation (Option A/B/C) within 10 minutes
- [ ] Decision Council synthesizes into single decision within 5 minutes
- [ ] No conflicting recommendations (or conflicts resolved with clear tie-breaker)
- [ ] Recommendation meets all MUST HAVE constraints

### Execution Success
- [ ] Migration executes without errors in Supabase SQL Editor
- [ ] All 4 tables exist: pr_sessions, presence, cursors, comments
- [ ] All FK constraints are enforced (can verify with test inserts)
- [ ] All RLS policies are active (can verify with \dp command or Supabase UI)
- [ ] All functions exist: cleanup_stale_sessions, cleanup_stale_presence, update_updated_at_column
- [ ] All triggers exist: update_comments_updated_at, update_cursors_updated_at
- [ ] TypeScript types can be generated (supabase gen types)

### Time Success
- [ ] Total consultation time <15 minutes (Phase 1 + Phase 2)
- [ ] Total execution time <35 minutes (Phase 3)
- [ ] Total end-to-end time <50 minutes
- [ ] User blocked time <10 minutes (only Phase 3 execution step)

---

## Rollback Plan

If execution fails at any phase:

### Phase 1 Failure (Backend Architect doesn't respond)
**Symptom**: No output file after 10 minutes
**Action**:
1. Skip agent consultation
2. Prompt Engineer (you) performs analysis directly
3. Create Migration 002 using standard best practices
4. Document that this was emergency fast-track

### Phase 2 Failure (Decision Council blocked)
**Symptom**: Cannot synthesize (conflicting recommendations, missing data)
**Action**:
1. Escalate to user with options
2. User makes final call based on simplified risk matrix
3. Document decision rationale for future reference

### Phase 3 Failure (Migration execution fails)
**Symptom**: SQL errors in Supabase
**Action**:
1. Capture full error message
2. Run diagnostic queries (what exists? what failed?)
3. Create EMERGENCY_ROLLBACK.sql if needed
4. Document failure for post-mortem
5. Consider manual table creation as last resort

---

## File Structure (Expected Outputs)

```
code-review-dashboard/
├── supabase/
│   └── migrations/
│       ├── 001_create_realtime_schema.sql (EXISTING - partial failure)
│       └── 002_fix_missing_tables.sql (TO BE CREATED - based on decision)
├── prompts/ (TO BE CREATED)
│   ├── backend_architect_migration_strategy.md (INPUT for Agent 2)
│   └── decision_council_migration_decision.md (INPUT for Agent 3)
├── recommendations/ (TO BE CREATED)
│   └── backend_architect_migration_strategy.md (OUTPUT from Agent 2)
├── decisions/ (TO BE CREATED)
│   └── migration_recovery_decision.md (OUTPUT from Agent 3)
└── AGENT_CONSULTATION_STRATEGY.md (THIS FILE)
```

---

## Next Steps (Immediate Actions)

1. **Create directory structure** (see Phase 1 bash commands above)
2. **Copy prompts** from this document to prompt files
3. **Launch Backend Architect** with instruction to read prompt file
4. **Wait for completion** (set 10-minute timer)
5. **Launch Decision Council** with instruction to synthesize
6. **Wait for decision** (set 5-minute timer)
7. **Execute approved solution** (user action with your guidance)

---

## Estimated Timeline

| Phase | Duration | Cumulative | Blocking User? |
|-------|----------|------------|----------------|
| **Setup** (create dirs, prompts) | 5 min | 5 min | No (you do this) |
| **Phase 1** (Backend Architect) | 10 min | 15 min | No (agent works async) |
| **Phase 2** (Decision Council) | 5 min | 20 min | No (agent works async) |
| **Phase 3** (Execute migration) | 30 min | 50 min | YES (user must execute) |
| **Verification** | 5 min | 55 min | YES (user must verify) |
| **Buffer** (for retries) | 5 min | 60 min | YES (if needed) |

**Total**: 60 minutes wall-clock time
**User-blocking**: ~35 minutes (only Phase 3 + verification)

---

**Status**: READY TO EXECUTE
**Created by**: Prompt Engineer
**Consultation ID**: supabase-migration-001-recovery
**Priority**: HIGH (blocking Week 2 progress)
