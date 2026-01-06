# Quick Start: Agent Consultation Execution

**Total Time**: 60 minutes (15 min consultation + 35 min execution + 10 min buffer)
**User-Blocking Time**: 35 minutes (only Phase 3)

---

## Phase 1: Backend Architect Consultation (10 minutes)

### Step 1: Switch to Backend Architect Agent

In your Claude Code interface, switch to the Backend Architect agent.

### Step 2: Give This Instruction

```
Read the prompt file at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/backend_architect_migration_strategy.md

Analyze the Supabase migration failure and provide your strategic recommendation.

Write your complete analysis to:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md

Include:
1. Root cause hypothesis
2. State verification SQL
3. Recommended approach (Option A/B/C)
4. Implementation plan with copy/paste ready SQL
5. Rollback plan

Follow the deliverable format specified in the prompt exactly.
```

### Step 3: Wait for Completion

Set a 10-minute timer. Backend Architect should complete within this time.

### Step 4: Verify Output

Check that this file exists and has content:
```
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md
```

---

## Phase 2: Decision Council Consultation (5 minutes)

### Step 1: Switch to Decision Council Agent

In your Claude Code interface, switch to the Decision Council agent.

### Step 2: Give This Instruction

```
Read the prompt file at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/prompts/decision_council_migration_decision.md

Read the Backend Architect's recommendation at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/backend_architect_migration_strategy.md

Read the original migration script at:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/supabase/migrations/001_create_realtime_schema.sql

Synthesize the recommendation and make a final GO/NO-GO decision.

Write your decision to:
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md

Include:
1. Clear decision (Option A/B/C)
2. Scoring matrix
3. Step-by-step implementation plan
4. Go/No-Go checklist
5. Success metrics

Follow the deliverable format specified in the prompt exactly.
```

### Step 3: Wait for Completion

Set a 5-minute timer. Decision Council should complete within this time.

### Step 4: Verify Output

Check that this file exists and has content:
```
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md
```

---

## Phase 3: Execute Approved Solution (35 minutes)

### Step 1: Read the Decision

Switch back to Prompt Engineer agent (or stay in Decision Council).

Read the decision file:
```
/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/decisions/migration_recovery_decision.md
```

### Step 2: Extract SQL Migration

The decision file should contain:
- Recommended approach
- Copy/paste ready SQL migration
- Step-by-step execution instructions

### Step 3: User Execution (USER ACTION REQUIRED)

**IMPORTANT**: User must now execute the SQL in Supabase.

1. User opens Supabase Dashboard
2. User navigates to SQL Editor
3. User creates new query
4. User pastes the SQL migration from the decision file
5. User runs the query
6. User reports back any errors (if any)

### Step 4: Verification (USER ACTION REQUIRED)

User runs these verification queries in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments');

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column');

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### Step 5: Success Confirmation

User should report:
- [ ] All 4 tables exist
- [ ] RLS is enabled on all tables
- [ ] Policies are created
- [ ] Functions exist
- [ ] Triggers exist
- [ ] No SQL errors during execution

---

## Troubleshooting

### Backend Architect Doesn't Respond

**Symptom**: No output file after 10 minutes

**Solution**:
1. Skip agent consultation
2. Prompt Engineer (you) creates Migration 002 directly using these best practices:
   - Use `CREATE TABLE IF NOT EXISTS` for idempotency
   - Create pr_sessions first (parent table)
   - Then create child tables (presence, cursors)
   - Create comments table (independent)
   - Add RLS policies with `CREATE POLICY IF NOT EXISTS` (if supported) or DROP/CREATE pattern
   - Add functions with `CREATE OR REPLACE FUNCTION`
   - Add triggers with DROP/CREATE pattern

### Decision Council Blocked

**Symptom**: Cannot make decision, asks for more info

**Solution**:
1. Provide the missing information
2. If still blocked, make decision yourself based on:
   - Prefer Option A (Migration 002) if no clear winner
   - Reason: Preserves history, standard practice

### SQL Execution Fails

**Symptom**: User reports SQL errors

**Solution**:
1. Capture exact error message
2. Run state verification queries (see Step 4 above)
3. Create corrective migration based on error
4. If critical failure, consider manual cleanup:

```sql
-- EMERGENCY CLEANUP (use with caution)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS cursors CASCADE;
DROP TABLE IF EXISTS presence CASCADE;
DROP TABLE IF EXISTS pr_sessions CASCADE;
DROP FUNCTION IF EXISTS cleanup_stale_sessions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_stale_presence() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Then re-run migration 001 from scratch
```

---

## Expected File Structure After Completion

```
code-review-dashboard/
├── supabase/
│   └── migrations/
│       ├── 001_create_realtime_schema.sql (EXISTING)
│       └── 002_fix_missing_tables.sql (CREATED if using Option A)
├── prompts/
│   ├── backend_architect_migration_strategy.md (INPUT - created by Prompt Engineer)
│   └── decision_council_migration_decision.md (INPUT - created by Prompt Engineer)
├── recommendations/
│   └── backend_architect_migration_strategy.md (OUTPUT - created by Backend Architect)
├── decisions/
│   └── migration_recovery_decision.md (OUTPUT - created by Decision Council)
├── AGENT_CONSULTATION_STRATEGY.md (Master strategy doc)
└── QUICK_START_AGENT_CONSULTATION.md (This file)
```

---

## Success Checklist

- [ ] Phase 1 completed: Backend Architect created recommendation file
- [ ] Phase 2 completed: Decision Council created decision file
- [ ] Phase 3 completed: User executed SQL in Supabase
- [ ] Verification passed: All tables/policies/functions exist
- [ ] No blocking errors
- [ ] Total time under 60 minutes
- [ ] Week 2 progress unblocked

---

**Status**: Ready to execute
**Next Action**: Switch to Backend Architect agent and start Phase 1
