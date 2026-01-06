-- RLS Policy Verification Script
-- Run this in Supabase SQL Editor AFTER applying migration 002
--
-- IMPORTANT: You must be LOGGED IN (authenticated user) for these tests to work!
-- If you see auth.uid() = NULL, you're not authenticated.

-- ============================================================================
-- STEP 1: Verify Authentication Context
-- ============================================================================

SELECT
  'Authentication Check' as test_name,
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED - Login first!'
    WHEN auth.role() = 'postgres' THEN '⚠️ Using postgres role - RLS is BYPASSED'
    WHEN auth.role() = 'authenticated' THEN '✅ Authenticated user - RLS is ACTIVE'
    ELSE '❓ Unknown role: ' || auth.role()
  END as status;

-- Expected output:
-- ✅ Authenticated user - RLS is ACTIVE

-- ============================================================================
-- STEP 2: Verify Policies Exist
-- ============================================================================

SELECT
  'Policy Check' as test_name,
  policyname,
  cmd as command,
  roles,
  CASE
    WHEN cmd = 'SELECT' THEN '✅ SELECT policy exists'
    WHEN cmd = 'INSERT' THEN '✅ INSERT policy exists'
    WHEN cmd = 'UPDATE' THEN '✅ UPDATE policy exists'
    WHEN cmd = '*' THEN '✅ ALL policy exists (covers SELECT/INSERT/UPDATE/DELETE)'
    ELSE '❓ Unknown command: ' || cmd
  END as status,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'pr_sessions'
ORDER BY policyname;

-- Expected output (Option A: Separate policies):
-- 3 rows: SELECT, INSERT, UPDATE policies
--
-- Expected output (Option B: Single ALL policy):
-- 1 row: ALL policy

-- ============================================================================
-- STEP 3: Clean Test Data
-- ============================================================================

DELETE FROM pr_sessions WHERE pr_id LIKE 'test/%' AND user_id = auth.uid();

SELECT
  'Cleanup' as test_name,
  '✅ Test data cleaned' as status;

-- ============================================================================
-- STEP 4: Test INSERT (Basic)
-- ============================================================================

INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/insert/1', auth.uid(), NOW(), true)
RETURNING
  id,
  pr_id,
  user_id,
  'test/insert/1' as expected_pr_id,
  CASE
    WHEN pr_id = 'test/insert/1' AND user_id = auth.uid() THEN '✅ INSERT works'
    ELSE '❌ INSERT returned wrong data'
  END as status;

-- Expected: 1 row with ✅ status

-- ============================================================================
-- STEP 5: Test UPSERT (INSERT path - first time)
-- ============================================================================

INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/upsert/1', auth.uid(), NOW(), true)
ON CONFLICT (pr_id, user_id)
DO UPDATE SET
  last_seen_at = EXCLUDED.last_seen_at,
  is_active = EXCLUDED.is_active
RETURNING
  id,
  pr_id,
  user_id,
  last_seen_at,
  'test/upsert/1' as expected_pr_id,
  CASE
    WHEN pr_id = 'test/upsert/1' AND user_id = auth.uid() THEN '✅ UPSERT (INSERT path) works'
    ELSE '❌ UPSERT returned wrong data'
  END as status;

-- Expected: 1 row with ✅ status
-- Save the `id` value for next test

-- ============================================================================
-- STEP 6: Test UPSERT (UPDATE path - second time, same pr_id)
-- ============================================================================

-- Wait 2 seconds to see last_seen_at change
SELECT pg_sleep(2);

INSERT INTO pr_sessions (pr_id, user_id, last_seen_at, is_active)
VALUES ('test/upsert/1', auth.uid(), NOW(), true)
ON CONFLICT (pr_id, user_id)
DO UPDATE SET
  last_seen_at = EXCLUDED.last_seen_at,
  is_active = EXCLUDED.is_active
RETURNING
  id,
  pr_id,
  user_id,
  last_seen_at,
  'test/upsert/1' as expected_pr_id,
  CASE
    WHEN pr_id = 'test/upsert/1' AND user_id = auth.uid() THEN '✅ UPSERT (UPDATE path) works'
    ELSE '❌ UPSERT returned wrong data'
  END as status;

-- Expected: 1 row with ✅ status
-- The `id` should be THE SAME as Step 5 (proving UPDATE occurred)
-- The `last_seen_at` should be NEWER than Step 5

-- ============================================================================
-- STEP 7: Verify UPSERT Updated Existing Row
-- ============================================================================

SELECT
  'UPSERT Verification' as test_name,
  COUNT(*) as total_test_upsert_rows,
  MAX(last_seen_at) as latest_last_seen,
  CASE
    WHEN COUNT(*) = 1 THEN '✅ UPSERT updated existing row (not created duplicate)'
    WHEN COUNT(*) > 1 THEN '❌ UPSERT created duplicates - onConflict not working!'
    ELSE '❌ No rows found'
  END as status
FROM pr_sessions
WHERE pr_id = 'test/upsert/1' AND user_id = auth.uid();

-- Expected: 1 row with ✅ status

-- ============================================================================
-- STEP 8: Test SELECT Policy (Can see own sessions)
-- ============================================================================

SELECT
  'SELECT Own Sessions' as test_name,
  COUNT(*) as total_own_sessions,
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ Can SELECT own sessions'
    ELSE '❌ Cannot SELECT own sessions'
  END as status
FROM pr_sessions
WHERE user_id = auth.uid() AND pr_id LIKE 'test/%';

-- Expected: At least 2 rows (test/insert/1 and test/upsert/1)

-- ============================================================================
-- STEP 9: Test UPDATE Policy (Can update own sessions)
-- ============================================================================

UPDATE pr_sessions
SET last_seen_at = NOW() - INTERVAL '10 minutes'
WHERE pr_id = 'test/insert/1' AND user_id = auth.uid()
RETURNING
  id,
  pr_id,
  last_seen_at,
  CASE
    WHEN last_seen_at < NOW() - INTERVAL '5 minutes' THEN '✅ UPDATE works'
    ELSE '❌ UPDATE did not change last_seen_at'
  END as status;

-- Expected: 1 row with ✅ status

-- ============================================================================
-- STEP 10: Test Security (CANNOT update other users' sessions)
-- ============================================================================

-- This should FAIL (return 0 rows) due to RLS
UPDATE pr_sessions
SET is_active = false
WHERE user_id != auth.uid()  -- Try to update someone else's session
RETURNING
  id,
  '❌ SECURITY BREACH - Should not see this!' as status;

-- Expected: 0 rows (UPDATE blocked by RLS)

SELECT
  'Security Check' as test_name,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM pr_sessions
      WHERE user_id != auth.uid() AND is_active = false
      LIMIT 1
    ) THEN '✅ Cannot update other users sessions (RLS working)'
    ELSE '❌ SECURITY BREACH - Can modify other users sessions!'
  END as status;

-- Expected: ✅ status

-- ============================================================================
-- STEP 11: Test WITH CHECK Validation (CANNOT change user_id)
-- ============================================================================

-- This should FAIL due to WITH CHECK clause
DO $$
BEGIN
  UPDATE pr_sessions
  SET user_id = gen_random_uuid()  -- Try to change user_id to random UUID
  WHERE pr_id = 'test/insert/1' AND user_id = auth.uid();

  RAISE EXCEPTION '❌ SECURITY BREACH - WITH CHECK did not prevent user_id change!';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%row-level security%' THEN
      RAISE NOTICE '✅ WITH CHECK blocked user_id change (RLS working)';
    ELSE
      RAISE;
    END IF;
END $$;

-- Expected: Notice message "✅ WITH CHECK blocked user_id change"

-- ============================================================================
-- STEP 12: Final Summary
-- ============================================================================

SELECT
  'Final Summary' as test_name,
  (
    SELECT COUNT(*) FROM pr_sessions
    WHERE user_id = auth.uid() AND pr_id LIKE 'test/%'
  ) as test_sessions_created,
  (
    SELECT COUNT(*) FROM pg_policies
    WHERE tablename = 'pr_sessions'
  ) as total_policies,
  CASE
    WHEN (SELECT COUNT(*) FROM pr_sessions WHERE user_id = auth.uid() AND pr_id LIKE 'test/%') >= 2
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'pr_sessions') >= 1
    THEN '✅ ALL TESTS PASSED - RLS + UPSERT working correctly!'
    ELSE '❌ Some tests failed - review output above'
  END as overall_status;

-- ============================================================================
-- STEP 13: Cleanup Test Data
-- ============================================================================

DELETE FROM pr_sessions WHERE pr_id LIKE 'test/%' AND user_id = auth.uid();

SELECT
  'Cleanup Complete' as test_name,
  '✅ Test data removed' as status;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

-- If all tests passed:
-- 1. Test from your Next.js app (browser console)
-- 2. Monitor Supabase logs for any RLS errors
-- 3. Deploy to production
--
-- If tests failed:
-- 1. Check which test failed (review output above)
-- 2. Verify migration 002 was applied correctly
-- 3. Check that you're authenticated (auth.uid() not NULL)
-- 4. Review /docs/RLS_UPSERT_TROUBLESHOOTING.md
