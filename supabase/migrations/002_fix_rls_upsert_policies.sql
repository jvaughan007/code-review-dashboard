-- Migration 002: Fix RLS Policies for UPSERT Support
--
-- PROBLEM: UPSERT operations fail with RLS because:
-- 1. UPSERT requires both INSERT and UPDATE permissions
-- 2. The UPDATE policy's USING clause acts as a SELECT filter
-- 3. If row doesn't exist yet, SELECT returns nothing, causing upsert to fail
-- 4. Current SELECT policy only shows is_active=true rows, blocking updates to inactive sessions
--
-- SOLUTION:
-- 1. Allow users to SELECT their own sessions (regardless of is_active)
-- 2. Keep INSERT policy restrictive (auth.uid() = user_id)
-- 3. Fix UPDATE policy to allow updates to own sessions
-- 4. Add WITH CHECK to UPDATE policy for consistency
--
-- References:
-- - Supabase RLS + UPSERT: https://supabase.com/docs/guides/database/postgres/row-level-security#upsert
-- - PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

-- ============================================================================
-- DIAGNOSTIC QUERIES (Run these first to verify the issue)
-- ============================================================================

-- Check current auth context (should show user_id when logged in)
-- SELECT auth.uid(), auth.role();

-- Check existing pr_sessions for current user
-- SELECT * FROM pr_sessions WHERE user_id = auth.uid();

-- Test INSERT directly (should work)
-- INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
-- VALUES ('test/test/1', auth.uid(), NOW(), true);

-- ============================================================================
-- FIX: Drop and recreate RLS policies for pr_sessions
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all active sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON pr_sessions;

-- ============================================================================
-- NEW POLICIES: UPSERT-compatible RLS
-- ============================================================================

-- 1. SELECT: Users can view ALL active sessions (for presence/collaboration)
--    AND they can always see their own sessions (active or inactive)
CREATE POLICY "Users can view active sessions and own sessions"
  ON pr_sessions FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR auth.uid() = user_id
  );

-- 2. INSERT: Users can only insert sessions for themselves
CREATE POLICY "Users can insert their own sessions"
  ON pr_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update their own sessions
--    USING: Which rows can be selected for update (filter before update)
--    WITH CHECK: Validate the new row after update
CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Alternative: Single ALL policy (simpler, recommended for UPSERT)
-- Uncomment this and comment out the 3 policies above if you prefer:
--
-- DROP POLICY IF EXISTS "Users can view active sessions and own sessions" ON pr_sessions;
-- DROP POLICY IF EXISTS "Users can insert their own sessions" ON pr_sessions;
-- DROP POLICY IF EXISTS "Users can update their own sessions" ON pr_sessions;
--
-- CREATE POLICY "Users manage own sessions, view active sessions"
--   ON pr_sessions FOR ALL
--   TO authenticated
--   USING (
--     is_active = true
--     OR auth.uid() = user_id
--   )
--   WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================================

-- 1. Verify policies are created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'pr_sessions'
-- ORDER BY policyname;

-- 2. Test UPSERT (this should now work)
-- SELECT auth.uid(); -- Copy this user_id for next query
--
-- DELETE FROM pr_sessions WHERE user_id = auth.uid(); -- Clean slate
--
-- -- First upsert (INSERT path)
-- INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
-- VALUES ('test/test/1', auth.uid(), NOW(), true)
-- ON CONFLICT (pr_id, user_id)
-- DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at, is_active = EXCLUDED.is_active
-- RETURNING *;
--
-- -- Second upsert (UPDATE path - should update last_seen_at)
-- INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
-- VALUES ('test/test/1', auth.uid(), NOW(), true)
-- ON CONFLICT (pr_id, user_id)
-- DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at, is_active = EXCLUDED.is_active
-- RETURNING *;
--
-- -- Verify both worked
-- SELECT * FROM pr_sessions WHERE user_id = auth.uid();

-- 3. Test via Supabase client (run in browser console after migration)
-- const { data, error } = await supabase
--   .from('pr_sessions')
--   .upsert({
--     pr_id: 'test/test/999',
--     user_id: (await supabase.auth.getUser()).data.user.id,
--     last_seen_at: new Date().toISOString(),
--     is_active: true,
--   }, {
--     onConflict: 'pr_id,user_id',
--   })
--   .select();
-- console.log('Upsert result:', { data, error });

-- ============================================================================
-- CLEANUP TEST DATA (after verification)
-- ============================================================================

-- DELETE FROM pr_sessions WHERE pr_id LIKE 'test/%';
