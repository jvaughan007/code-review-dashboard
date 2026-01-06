-- ============================================================================
-- COMPREHENSIVE DIAGNOSTIC QUERY
-- Run this FIRST to understand what went wrong with the migration
-- ============================================================================

-- =============================================================================
-- SECTION 1: VERIFY AUTH SCHEMA EXISTS
-- =============================================================================
SELECT
  '=== SECTION 1: AUTH SCHEMA CHECK ===' as section;

SELECT
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN '✓ auth.users EXISTS - Foreign keys should work'
  ELSE '✗ auth.users MISSING - This is why migration failed!' END as auth_status;

-- =============================================================================
-- SECTION 2: LIST ALL TABLES IN PUBLIC SCHEMA
-- =============================================================================
SELECT
  '=== SECTION 2: ALL PUBLIC TABLES ===' as section;

SELECT
  table_name,
  CASE
    WHEN table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')
    THEN '✓ EXPECTED'
    ELSE 'UNEXPECTED'
  END as expected_status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =============================================================================
-- SECTION 3: CHECK FOR TYPO VARIANTS (cursor vs cursors)
-- =============================================================================
SELECT
  '=== SECTION 3: TYPO CHECK ===' as section;

SELECT
  'pr_sessions' as table_we_want,
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
SELECT 'cursor (singular)', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cursor'
  ) THEN '✓ EXISTS (WRONG NAME!)' ELSE '✗ MISSING' END
UNION ALL
SELECT 'cursors (plural)', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cursors'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'comments', CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END;

-- =============================================================================
-- SECTION 4: CHECK TABLE COLUMNS (for tables that DO exist)
-- =============================================================================
SELECT
  '=== SECTION 4: TABLE COLUMNS ===' as section;

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('pr_sessions', 'presence', 'cursor', 'cursors', 'comments')
ORDER BY table_name, ordinal_position;

-- =============================================================================
-- SECTION 5: CHECK FOREIGN KEY CONSTRAINTS
-- =============================================================================
SELECT
  '=== SECTION 5: FOREIGN KEY CONSTRAINTS ===' as section;

SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
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
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- SECTION 6: CHECK FOR PARTIAL CREATION ERRORS
-- =============================================================================
SELECT
  '=== SECTION 6: ERROR ANALYSIS ===' as section;

-- Count tables created
SELECT
  COUNT(*) as tables_created,
  CASE
    WHEN COUNT(*) = 4 THEN '✓ All 4 tables created'
    WHEN COUNT(*) = 2 THEN '⚠ Only 2 tables created (partial failure)'
    WHEN COUNT(*) = 0 THEN '✗ No tables created'
    ELSE '⚠ Unexpected count: ' || COUNT(*)::text
  END as diagnosis
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pr_sessions', 'presence', 'cursor', 'cursors', 'comments');

-- =============================================================================
-- SECTION 7: CHECK RLS STATUS (for existing tables)
-- =============================================================================
SELECT
  '=== SECTION 7: RLS STATUS ===' as section;

SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '✗ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================================================
-- SECTION 8: CHECK INDEXES
-- =============================================================================
SELECT
  '=== SECTION 8: INDEXES ===' as section;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================================================
-- SECTION 9: CHECK FUNCTIONS
-- =============================================================================
SELECT
  '=== SECTION 9: FUNCTIONS ===' as section;

SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column')
ORDER BY routine_name;

-- =============================================================================
-- SECTION 10: CHECK POLICIES
-- =============================================================================
SELECT
  '=== SECTION 10: RLS POLICIES ===' as section;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- SECTION 11: SUMMARY AND RECOMMENDATIONS
-- =============================================================================
SELECT
  '=== SECTION 11: SUMMARY ===' as section;

SELECT
  'Expected Tables' as metric,
  '4 (pr_sessions, presence, cursors, comments)' as expected_value,
  (SELECT COUNT(*)::text FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')) as actual_value,
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')) = 4
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as result
UNION ALL
SELECT
  'Auth Schema',
  'auth.users must exist',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
       THEN 'EXISTS' ELSE 'MISSING' END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
       THEN '✓ PASS' ELSE '✗ FAIL - Enable Supabase Auth!' END
UNION ALL
SELECT
  'UUID Extension',
  'uuid-ossp must be enabled',
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp')
       THEN 'ENABLED' ELSE 'DISABLED' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp')
       THEN '✓ PASS' ELSE '✗ FAIL' END;

-- =============================================================================
-- SECTION 12: RECOMMENDED NEXT STEPS
-- =============================================================================
SELECT
  '=== SECTION 12: NEXT STEPS ===' as section;

SELECT
  CASE
    -- Case 1: auth.users missing
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '1. Enable Supabase Auth in dashboard (Settings > Authentication)
2. Run cleanup_and_recovery.sql
3. Run 001_create_realtime_schema.sql again'

    -- Case 2: Tables partially created
    WHEN (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')) < 4
    AND (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')) > 0
    THEN '1. Run cleanup_and_recovery.sql to remove partial state
2. Verify auth.users exists
3. Run 001_create_realtime_schema.sql again'

    -- Case 3: All tables exist
    WHEN (SELECT COUNT(*) FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')) = 4
    THEN '✓ All tables created successfully!
Run test_migration.sql to verify everything works.'

    -- Case 4: No tables
    ELSE '1. Check if migration SQL was actually executed
2. Verify auth.users exists
3. Run 001_create_realtime_schema.sql'
  END as recommended_action;
