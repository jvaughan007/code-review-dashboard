-- ============================================================================
-- CLEANUP AND RECOVERY SCRIPT
-- Use this to clean up partial migration state and start fresh
-- ============================================================================

-- =============================================================================
-- STEP 1: DISABLE ALL TRIGGERS (prevent cascade issues during cleanup)
-- =============================================================================

SET session_replication_role = replica;

-- =============================================================================
-- STEP 2: DROP ALL TRIGGERS
-- =============================================================================

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_cursors_updated_at ON cursors;
DROP TRIGGER IF EXISTS update_comments_updated_at ON cursor; -- in case of typo

-- =============================================================================
-- STEP 3: DROP ALL RLS POLICIES
-- =============================================================================

-- pr_sessions policies
DROP POLICY IF EXISTS "Users can view all active sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON pr_sessions;

-- presence policies
DROP POLICY IF EXISTS "Users can view all presence data" ON presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON presence;
DROP POLICY IF EXISTS "Users can delete their own presence" ON presence;

-- cursors policies (plural)
DROP POLICY IF EXISTS "Users can view all cursors" ON cursors;
DROP POLICY IF EXISTS "Users can insert their own cursors" ON cursors;
DROP POLICY IF EXISTS "Users can update their own cursors" ON cursors;
DROP POLICY IF EXISTS "Users can delete their own cursors" ON cursors;

-- cursor policies (singular - in case of typo)
DROP POLICY IF EXISTS "Users can view all cursors" ON cursor;
DROP POLICY IF EXISTS "Users can insert their own cursors" ON cursor;
DROP POLICY IF EXISTS "Users can update their own cursors" ON cursor;
DROP POLICY IF EXISTS "Users can delete their own cursors" ON cursor;

-- comments policies
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- =============================================================================
-- STEP 4: DROP ALL TABLES (including typo variants)
-- =============================================================================

-- Drop in dependency order (child tables first)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS cursors CASCADE;
DROP TABLE IF EXISTS cursor CASCADE; -- in case of typo
DROP TABLE IF EXISTS presence CASCADE;
DROP TABLE IF EXISTS pr_sessions CASCADE;

-- =============================================================================
-- STEP 5: DROP ALL FUNCTIONS
-- =============================================================================

DROP FUNCTION IF EXISTS cleanup_stale_sessions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_stale_presence() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================================================
-- STEP 6: RE-ENABLE TRIGGERS
-- =============================================================================

SET session_replication_role = DEFAULT;

-- =============================================================================
-- VERIFICATION: Confirm cleanup was successful
-- =============================================================================

SELECT
  '=== CLEANUP VERIFICATION ===' as section;

-- Check that all tables are gone
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✓ All tables successfully removed'
    ELSE '✗ WARNING: ' || COUNT(*)::text || ' tables still exist: ' ||
         string_agg(table_name, ', ')
  END as cleanup_status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pr_sessions', 'presence', 'cursor', 'cursors', 'comments');

-- Check that all functions are gone
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✓ All functions successfully removed'
    ELSE '✗ WARNING: ' || COUNT(*)::text || ' functions still exist'
  END as function_cleanup_status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column');

-- =============================================================================
-- NEXT STEPS
-- =============================================================================

SELECT
  '=== NEXT STEPS ===' as section;

SELECT
  '1. Verify auth.users exists (enable Supabase Auth if needed)
2. Run 001_create_realtime_schema.sql
3. Run test_migration.sql to verify success' as instructions;

-- =============================================================================
-- OPTIONAL: Verify auth.users exists before re-running migration
-- =============================================================================

SELECT
  '=== AUTH CHECK ===' as section;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✓ auth.users EXISTS - You can safely run the migration now'
    ELSE '✗ auth.users MISSING - Enable Supabase Auth first!

HOW TO ENABLE AUTH:
1. Go to Supabase Dashboard
2. Navigate to Authentication
3. Click "Enable Authentication"
4. Wait 30 seconds for schema to be created
5. Then run 001_create_realtime_schema.sql'
  END as auth_status;
