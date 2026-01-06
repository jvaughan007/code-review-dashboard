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
