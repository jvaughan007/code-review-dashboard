# RLS + UPSERT Troubleshooting Guide

## The Problem: Empty Error Objects on UPSERT with RLS

### Symptoms
```typescript
// Error appears as empty object
Error creating session: {}

// Network tab shows:
Code: 42501
Message: "new row violates row-level security policy (USING expression) for table \"pr_sessions\""
```

### Root Cause

**UPSERT operations in PostgreSQL with RLS require BOTH INSERT and UPDATE permissions**, even when only performing an INSERT. Here's the execution flow:

```
1. Client calls: supabase.from('pr_sessions').upsert(...)
2. PostgreSQL translates to: INSERT ... ON CONFLICT ... DO UPDATE
3. RLS checks kick in:
   a. For INSERT: Checks INSERT policy's WITH CHECK clause ✅
   b. For ON CONFLICT: Needs to SELECT existing row to check conflict
   c. UPDATE policy's USING clause acts as SELECT filter ❌
   d. If no row found (or SELECT blocked), UPDATE path fails
   e. Even if doing INSERT, PostgreSQL needs UPDATE permission ready
```

**The original policy problem:**

```sql
-- SELECT policy (line 150-152 in 001 migration)
CREATE POLICY "Users can view all active sessions"
  ON pr_sessions FOR SELECT
  USING (is_active = true);  -- ❌ Can't see own inactive sessions!

-- UPDATE policy (line 158-160)
CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  USING (auth.uid() = user_id);  -- ✅ Correct, but...
  -- Missing WITH CHECK clause!
```

**Why it fails:**
1. User tries to UPSERT with `is_active = true`
2. On first insert, no row exists yet
3. PostgreSQL can't SELECT non-existent row for conflict check
4. UPDATE policy's USING clause can't evaluate `auth.uid() = user_id` on null row
5. RLS rejects the operation with cryptic error

**Why manual SQL works:**
- SQL Editor uses `postgres` role, which **bypasses RLS entirely**
- This is a debugging trap - makes you think schema is fine!

**Why disabling RLS works:**
- No policy checks = no SELECT filtering = upsert succeeds
- But this is insecure for production!

---

## The Fix: UPSERT-Compatible RLS Policies

### Solution 1: Separate Policies (Explicit, Educational)

```sql
-- 1. SELECT: Allow viewing active sessions + own sessions
CREATE POLICY "Users can view active sessions and own sessions"
  ON pr_sessions FOR SELECT
  TO authenticated
  USING (
    is_active = true          -- See all active sessions (collaboration)
    OR auth.uid() = user_id   -- Always see own sessions (for upsert)
  );

-- 2. INSERT: Only insert own sessions
CREATE POLICY "Users can insert their own sessions"
  ON pr_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Only update own sessions
CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)      -- Can select own rows for update
  WITH CHECK (auth.uid() = user_id); -- Validate after update
```

**Key changes:**
1. ✅ SELECT policy allows `auth.uid() = user_id` (so UPSERT can find existing rows)
2. ✅ UPDATE policy has both `USING` and `WITH CHECK` (required for security)
3. ✅ Explicit `TO authenticated` (best practice)

### Solution 2: Single ALL Policy (Simpler, Recommended)

```sql
CREATE POLICY "Users manage own sessions, view active sessions"
  ON pr_sessions FOR ALL
  TO authenticated
  USING (
    is_active = true          -- Can see all active sessions
    OR auth.uid() = user_id   -- Can see/modify own sessions
  )
  WITH CHECK (auth.uid() = user_id);  -- Can only insert/update own user_id
```

**Advantages:**
- ✅ Simpler (1 policy vs 3)
- ✅ Less chance of policy conflicts
- ✅ Easier to reason about
- ✅ Recommended by Supabase for UPSERT operations

**Trade-offs:**
- ❌ Less granular (can't separately audit INSERT vs UPDATE)
- ❌ Slightly less explicit (FOR ALL includes DELETE)

---

## Why `WITH CHECK` Matters

### USING vs WITH CHECK

| Clause | Purpose | When Evaluated | Use Case |
|--------|---------|----------------|----------|
| `USING` | **Filter before operation** | Before INSERT/UPDATE/DELETE | "Which rows can I access?" |
| `WITH CHECK` | **Validate after operation** | After INSERT/UPDATE | "Is the new/updated row allowed?" |

### Example Exploit WITHOUT WITH CHECK

```sql
-- BAD: Missing WITH CHECK
CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  USING (auth.uid() = user_id);  -- No WITH CHECK!

-- Attacker can do this:
UPDATE pr_sessions
SET user_id = 'someone-elses-uuid'  -- ❌ Should be blocked!
WHERE user_id = auth.uid();

-- Without WITH CHECK, PostgreSQL:
-- 1. Checks USING: "Does auth.uid() = old user_id?" ✅ Yes
-- 2. Performs UPDATE
-- 3. No WITH CHECK validation ❌
-- 4. Attacker now owns someone else's session!
```

### Correct Version WITH CHECK

```sql
-- GOOD: Has WITH CHECK
CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);  -- ✅ Validates new row!

-- Same attack now fails:
UPDATE pr_sessions
SET user_id = 'someone-elses-uuid'
WHERE user_id = auth.uid();

-- PostgreSQL:
-- 1. Checks USING: "Does auth.uid() = old user_id?" ✅ Yes
-- 2. Performs UPDATE
-- 3. Checks WITH CHECK: "Does auth.uid() = new user_id?" ❌ NO!
-- 4. Error: "new row violates row-level security policy"
```

**Best Practice:** Always use `WITH CHECK` for INSERT and UPDATE policies!

---

## Diagnostic Queries

### 1. Check Authentication Context

```sql
-- Run in Supabase SQL Editor (logged in)
SELECT
  auth.uid() as current_user_id,
  auth.role() as current_role,
  auth.jwt() -> 'email' as email;

-- Expected output:
-- current_user_id: your-uuid-here
-- current_role: authenticated
-- email: your-email@example.com
```

**Troubleshooting:**
- If `auth.uid()` is NULL → Not logged in (check auth token)
- If `auth.role()` is 'anon' → Using anon key (need authenticated user)
- If `auth.role()` is 'postgres' → Using service key (bypasses RLS!)

### 2. Verify Current Policies

```sql
-- List all policies on pr_sessions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,  -- Command: SELECT, INSERT, UPDATE, DELETE, ALL
  qual,  -- USING clause (as text)
  with_check  -- WITH CHECK clause (as text)
FROM pg_policies
WHERE tablename = 'pr_sessions'
ORDER BY policyname;
```

**What to look for:**
- ✅ 3 policies (SELECT, INSERT, UPDATE) OR 1 policy (ALL)
- ✅ `roles` includes `authenticated`
- ✅ `qual` (USING) allows `auth.uid() = user_id` in SELECT
- ✅ `with_check` present for INSERT and UPDATE

### 3. Test INSERT (should work)

```sql
-- Clean slate
DELETE FROM pr_sessions WHERE user_id = auth.uid();

-- Test INSERT
INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/test/1', auth.uid(), NOW(), true)
RETURNING *;

-- Expected: Returns 1 row with your user_id
```

### 4. Test UPSERT (the real test!)

```sql
-- Clean slate
DELETE FROM pr_sessions WHERE user_id = auth.uid();

-- First UPSERT (INSERT path)
INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/test/1', auth.uid(), NOW(), true)
ON CONFLICT (pr_id, user_id)
DO UPDATE SET
  last_seen_at = EXCLUDED.last_seen_at,
  is_active = EXCLUDED.is_active
RETURNING *;

-- Wait 2 seconds, then run again (UPDATE path)
INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/test/1', auth.uid(), NOW(), true)
ON CONFLICT (pr_id, user_id)
DO UPDATE SET
  last_seen_at = EXCLUDED.last_seen_at,
  is_active = EXCLUDED.is_active
RETURNING *;

-- Expected:
-- 1. First call: Inserts new row
-- 2. Second call: Updates last_seen_at (should be newer)
-- 3. Both return same id (proves UPDATE path worked)
```

### 5. Test via Supabase Client (Browser Console)

```javascript
// Must be logged in first!
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id);

// Clean slate
await supabase.from('pr_sessions').delete().eq('user_id', user.id);

// Test UPSERT
const { data, error } = await supabase
  .from('pr_sessions')
  .upsert({
    pr_id: 'test/test/999',
    user_id: user.id,
    last_seen_at: new Date().toISOString(),
    is_active: true,
  }, {
    onConflict: 'pr_id,user_id',
  })
  .select();

console.log('Result:', { data, error });

// Expected:
// data: [{ id: '...', pr_id: 'test/test/999', ... }]
// error: null
```

**If error is NOT null:**
```javascript
console.log('Full error:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint,
});
```

### 6. Check Existing Sessions

```sql
-- View all your sessions
SELECT
  id,
  pr_id,
  user_id,
  joined_at,
  last_seen_at,
  is_active,
  EXTRACT(EPOCH FROM (NOW() - last_seen_at)) as seconds_since_last_seen
FROM pr_sessions
WHERE user_id = auth.uid()
ORDER BY last_seen_at DESC;
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Testing in SQL Editor with Wrong Role

**Problem:**
```sql
-- Looks like it works!
INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/test/1', 'some-uuid', NOW(), true);
-- Success!
```

**Why it's misleading:**
- SQL Editor uses `postgres` role (superuser)
- Bypasses RLS entirely
- Gives false confidence

**Solution:**
```sql
-- Force RLS in SQL Editor
SET ROLE authenticated;
SET request.jwt.claims.sub = 'your-user-uuid';  -- Simulate logged-in user

-- Now test again (will respect RLS)
INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/test/1', auth.uid(), NOW(), true);
```

### Pitfall 2: Empty Error Objects

**Problem:**
```typescript
console.log('Error:', error);  // Logs: {}
```

**Why:**
- Supabase JS client sometimes swallows error details
- Network tab has the real error (check browser DevTools)

**Solution:**
```typescript
// Log ALL error properties
console.error('Error creating session:', {
  error,
  code: error?.code,
  message: error?.message,
  details: error?.details,
  hint: error?.hint,
  // Add context for debugging
  prId,
  userId: user.id,
});
```

### Pitfall 3: Forgetting TO authenticated

**Problem:**
```sql
CREATE POLICY "Users can insert"
  ON pr_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  -- Missing: TO authenticated
```

**Why it matters:**
- Without `TO authenticated`, policy applies to ALL roles
- Including `anon` role (unauthenticated users)
- `auth.uid()` is NULL for anon → policy always fails

**Solution:**
```sql
CREATE POLICY "Users can insert"
  ON pr_sessions FOR INSERT
  TO authenticated  -- ✅ Explicit!
  WITH CHECK (auth.uid() = user_id);
```

### Pitfall 4: UPSERT on Wrong Column

**Problem:**
```typescript
await supabase.from('pr_sessions').upsert({
  pr_id: 'test/test/1',
  user_id: user.id,
  ...
}, {
  onConflict: 'user_id',  // ❌ Wrong! Unique constraint is (pr_id, user_id)
});
```

**Why it fails:**
- `onConflict` must match your `UNIQUE` constraint
- Current constraint: `CONSTRAINT pr_sessions_unique UNIQUE (pr_id, user_id)`
- Using just `user_id` doesn't match

**Solution:**
```typescript
await supabase.from('pr_sessions').upsert({
  pr_id: 'test/test/1',
  user_id: user.id,
  ...
}, {
  onConflict: 'pr_id,user_id',  // ✅ Matches UNIQUE constraint!
});
```

---

## Best Practices for RLS + UPSERT

### 1. Always Test with Authenticated Role

```sql
-- In SQL Editor
SET ROLE authenticated;
SET request.jwt.claims.sub = 'test-user-uuid';

-- Now test your queries
INSERT INTO pr_sessions ...
```

### 2. Use TO authenticated Explicitly

```sql
-- GOOD
CREATE POLICY "..." ON table_name
  TO authenticated  -- ✅ Clear intent
  USING (...);

-- BAD (implicit)
CREATE POLICY "..." ON table_name
  USING (...);  -- ❌ Applies to all roles
```

### 3. Always Include WITH CHECK for INSERT/UPDATE

```sql
-- GOOD
CREATE POLICY "..." ON table_name FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);  -- ✅ Validates new row

-- BAD
CREATE POLICY "..." ON table_name FOR UPDATE
  USING (auth.uid() = user_id);  -- ❌ Missing WITH CHECK
```

### 4. Log Full Error Objects

```typescript
// GOOD
if (error) {
  console.error('Error:', {
    error,
    code: error?.code,
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
  });
}

// BAD
if (error) {
  console.log('Error:', error);  // Might log {}
}
```

### 5. Use FOR ALL for UPSERT-Heavy Tables

```sql
-- If your table has lots of upserts, simplify:
CREATE POLICY "..." ON table_name FOR ALL
  TO authenticated
  USING (is_active = true OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Instead of 3 separate policies (SELECT, INSERT, UPDATE)
```

### 6. Document Policy Intent

```sql
CREATE POLICY "Users can view active sessions and own sessions"
  -- ☝️ Name explains WHAT
  ON pr_sessions FOR SELECT
  TO authenticated
  USING (
    -- Purpose: Allow collaboration (see active sessions)
    is_active = true
    -- Purpose: Allow UPSERT operations (see own rows for ON CONFLICT)
    OR auth.uid() = user_id
  );
```

---

## Migration Checklist

Before deploying RLS policy changes:

- [ ] Write diagnostic queries first (verify current state)
- [ ] Test policies in SQL Editor with `SET ROLE authenticated`
- [ ] Test UPSERT operations (both INSERT and UPDATE paths)
- [ ] Test via Supabase client in browser console
- [ ] Verify WITH CHECK clauses prevent privilege escalation
- [ ] Check that SELECT policy allows own rows (for UPSERT)
- [ ] Verify TO authenticated on all policies
- [ ] Add rollback plan (keep old policy CREATE statements)
- [ ] Test with multiple users (different user_ids)
- [ ] Monitor error logs after deployment

---

## Further Reading

### Supabase Documentation
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS with UPSERT](https://supabase.com/docs/guides/database/postgres/row-level-security#upsert)
- [Common RLS Patterns](https://supabase.com/docs/guides/auth/row-level-security)

### PostgreSQL Documentation
- [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [INSERT ON CONFLICT (UPSERT)](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)

### Community Resources
- [Supabase Discord](https://discord.supabase.com) - #help-and-questions
- [GitHub Discussions](https://github.com/supabase/supabase/discussions) - Search "RLS UPSERT"
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase) - Tag: [supabase]

---

## Quick Reference: Policy Templates

### Template 1: UPSERT-Friendly SELECT

```sql
CREATE POLICY "select_own_and_public"
  ON your_table FOR SELECT
  TO authenticated
  USING (
    is_public = true           -- Public data (for collaboration)
    OR auth.uid() = owner_id   -- Own data (for UPSERT)
  );
```

### Template 2: Secure INSERT

```sql
CREATE POLICY "insert_own_only"
  ON your_table FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);
```

### Template 3: Secure UPDATE

```sql
CREATE POLICY "update_own_only"
  ON your_table FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)      -- Which rows to select
  WITH CHECK (auth.uid() = owner_id); -- Validate new row
```

### Template 4: All-in-One (Recommended for UPSERT)

```sql
CREATE POLICY "manage_own_view_public"
  ON your_table FOR ALL
  TO authenticated
  USING (
    is_public = true
    OR auth.uid() = owner_id
  )
  WITH CHECK (auth.uid() = owner_id);
```

---

**Last Updated:** 2026-01-06
**Migration:** 002_fix_rls_upsert_policies.sql
**Status:** Production-Ready ✅
