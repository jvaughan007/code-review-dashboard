-- ============================================================================
-- MIGRATION VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor after migration completes
-- ============================================================================

-- Test 1: Verify all tables exist
SELECT
  'pr_sessions' as expected_table,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pr_sessions'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 'presence', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'presence'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'cursors', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cursors'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'comments', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END;

-- Test 2: Verify RLS is enabled on all tables
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '✗ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments')
ORDER BY tablename;

-- Test 3: Count indexes per table
SELECT
  tablename,
  COUNT(*) as index_count,
  string_agg(indexname, ', ' ORDER BY indexname) as indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments')
GROUP BY tablename
ORDER BY tablename;

-- Test 4: Verify RLS policies exist
SELECT
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test 5: Verify functions exist
SELECT
  routine_name,
  routine_type,
  CASE WHEN security_type = 'DEFINER' THEN '✓ SECURITY DEFINER' ELSE 'INVOKER' END as security
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column')
ORDER BY routine_name;

-- Test 6: Verify triggers exist
SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing || ' ' || string_agg(event_manipulation, ', ') as trigger_event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('comments', 'cursors')
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY event_object_table, trigger_name;

-- Test 7: Verify foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')
ORDER BY tc.table_name, tc.constraint_name;

-- Test 8: Verify unique constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
AND tc.table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- EXPECTED RESULTS SUMMARY
-- ============================================================================

-- Test 1: Should show 4 tables all with "✓ EXISTS"
-- Test 2: Should show 4 tables all with "✓ ENABLED"
-- Test 3: Should show:
--   - pr_sessions: 3 indexes
--   - presence: 2 indexes
--   - cursors: 2 indexes
--   - comments: 4 indexes
-- Test 4: Should show:
--   - pr_sessions: 3 policies
--   - presence: 4 policies
--   - cursors: 4 policies
--   - comments: 4 policies
-- Test 5: Should show 3 functions, all with "✓ SECURITY DEFINER"
-- Test 6: Should show 2 triggers (comments and cursors)
-- Test 7: Should show foreign keys to auth.users and between tables
-- Test 8: Should show unique constraints on each table

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================================================

-- Uncomment to insert test data
-- Note: Requires auth.users to exist (Supabase Auth enabled)

/*
-- Insert test session
INSERT INTO pr_sessions (id, pr_id, user_id, is_active)
VALUES (
  uuid_generate_v4(),
  'facebook/react/12345',
  (SELECT id FROM auth.users LIMIT 1),
  true
);

-- Insert test presence
INSERT INTO presence (session_id, user_id, pr_id, username)
SELECT
  s.id,
  s.user_id,
  s.pr_id,
  u.email
FROM pr_sessions s
JOIN auth.users u ON u.id = s.user_id
LIMIT 1;

-- Insert test comment
INSERT INTO comments (pr_id, file_path, line_number, user_id, username, content)
SELECT
  'facebook/react/12345',
  'src/App.tsx',
  42,
  id,
  email,
  'This is a test comment'
FROM auth.users
LIMIT 1;
*/

-- ============================================================================
-- CLEANUP FUNCTIONS TESTING
-- ============================================================================

-- Test cleanup_stale_sessions function
-- (Should mark old sessions as inactive)
SELECT cleanup_stale_sessions();

-- Verify result
SELECT
  COUNT(*) FILTER (WHERE is_active = true) as active_sessions,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_sessions
FROM pr_sessions;

-- Test cleanup_stale_presence function
-- (Should delete old presence/cursor data)
SELECT cleanup_stale_presence();

-- Verify result
SELECT
  'presence' as table_name,
  COUNT(*) as remaining_records
FROM presence
UNION ALL
SELECT 'cursors', COUNT(*) FROM cursors;
