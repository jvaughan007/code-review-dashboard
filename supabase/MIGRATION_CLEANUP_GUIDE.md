# Supabase Migration Cleanup Guide

## Problem

You encountered the error:
```
ERROR: 42P07: relation "idx_pr_sessions_pr_id" already exists
```

This indicates a partial migration was previously run, leaving some database objects in place.

## Solution

The migration file `001_create_realtime_schema.sql` has been updated to be **idempotent** (safe to run multiple times). It now includes:

1. `DROP IF EXISTS` statements for all objects
2. Correct dependency ordering (drops children before parents)
3. Clean recreation of all tables, indexes, policies, and functions

---

## Option 1: Run the Fixed Migration (Recommended)

The updated migration will automatically clean up and recreate everything:

```bash
# Reset the migration (this will run the DROP statements)
npx supabase db reset

# Or push just this migration
npx supabase db push
```

This is **safe** because:
- All `DROP` statements use `IF EXISTS`
- Tables are dropped in dependency order (child tables first)
- `CASCADE` ensures referencing objects are cleaned up
- All data will be recreated cleanly

---

## Option 2: Manual Cleanup (If Option 1 Fails)

If you need to manually clean up the partial migration state:

### Step 1: Connect to Supabase SQL Editor

Go to your Supabase dashboard → SQL Editor → New Query

### Step 2: Run Cleanup Script

```sql
-- ============================================================================
-- MANUAL CLEANUP SCRIPT
-- Run this in Supabase SQL Editor if automated cleanup fails
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_cursors_updated_at ON cursors;

-- Drop policies (if tables exist)
DROP POLICY IF EXISTS "Users can view all active sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON pr_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON pr_sessions;

DROP POLICY IF EXISTS "Users can view all presence data" ON presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON presence;
DROP POLICY IF EXISTS "Users can delete their own presence" ON presence;

DROP POLICY IF EXISTS "Users can view all cursors" ON cursors;
DROP POLICY IF EXISTS "Users can insert their own cursors" ON cursors;
DROP POLICY IF EXISTS "Users can update their own cursors" ON cursors;
DROP POLICY IF EXISTS "Users can delete their own cursors" ON cursors;

DROP POLICY IF EXISTS "Users can view all comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Drop tables in dependency order (child tables first)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS cursors CASCADE;
DROP TABLE IF EXISTS presence CASCADE;
DROP TABLE IF EXISTS pr_sessions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_stale_sessions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_stale_presence() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

### Step 3: Verify Cleanup

```sql
-- Check that tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments');
-- Should return 0 rows

-- Check that functions are gone
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column');
-- Should return 0 rows
```

### Step 4: Run Migration

```bash
npx supabase db push
```

---

## Option 3: Reset Entire Database (Nuclear Option)

If you're in development and can afford to lose all data:

```bash
# Reset entire local database
npx supabase db reset

# Or reset remote database (WARNING: destroys all data)
npx supabase db reset --db-url "postgresql://[your-supabase-connection-string]"
```

---

## Verification Steps

After running the migration, verify everything is created correctly:

### 1. Check Tables Exist

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments')
ORDER BY table_name;
```

Expected: 4 rows (all tables present)

### 2. Check Indexes Exist

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments')
ORDER BY tablename, indexname;
```

Expected: 10+ indexes

### 3. Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments');
```

Expected: All should have `rowsecurity = true`

### 4. Check Policies Exist

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected: 13 policies across 4 tables

### 5. Check Functions Exist

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('cleanup_stale_sessions', 'cleanup_stale_presence', 'update_updated_at_column');
```

Expected: 3 functions

### 6. Check Triggers Exist

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('comments', 'cursors');
```

Expected: 2 triggers (one for comments, one for cursors)

---

## Common Issues

### Issue: "permission denied for schema auth"

**Cause**: Trying to reference `auth.users` without proper permissions

**Solution**: Make sure you're running migrations through Supabase CLI, not directly as a database user

```bash
# Use Supabase CLI (has proper permissions)
npx supabase db push

# Don't run SQL directly with psql unless you're superuser
```

### Issue: "relation already exists" after cleanup

**Cause**: Cached schema in Supabase CLI or stale migration tracking

**Solution**:
```bash
# Clear migration history and re-run
npx supabase migration repair --status reverted 001_create_realtime_schema
npx supabase db push
```

### Issue: CASCADE drops more than expected

**Cause**: Other objects (views, functions) reference your tables

**Solution**: The migration now uses `DROP ... CASCADE` to handle this automatically. If you need to preserve other objects, manually exclude them before running the migration.

---

## Migration Changes Made

The fixed migration includes these safety improvements:

1. **Idempotent Design**: Can be run multiple times without errors
2. **Proper Cleanup Order**:
   - Triggers dropped before functions
   - Policies dropped before tables
   - Child tables (with foreign keys) dropped before parent tables
3. **CASCADE Cleanup**: Ensures dependent objects are cleaned up
4. **SECURITY DEFINER**: Added to functions for proper permission handling
5. **IF EXISTS Guards**: All DROP statements use `IF EXISTS`

---

## Next Steps

After successful migration:

1. **Test RLS Policies**: Verify users can only access their own data
2. **Test Functions**: Call `cleanup_stale_sessions()` and verify it works
3. **Check Indexes**: Run `EXPLAIN ANALYZE` on polling queries to verify indexes are used
4. **Seed Test Data**: Create sample sessions/presence/comments for testing
5. **Monitor Performance**: Check query execution times for polling endpoints

---

## Support

If you continue to have issues:

1. Check Supabase logs in Dashboard → Logs
2. Run `\d tablename` in SQL Editor to inspect table structure
3. Verify Supabase CLI version: `npx supabase --version` (should be 1.0+)
4. Check migration status: `npx supabase migration list`

---

**Last Updated**: 2026-01-06
**Migration Version**: 001_create_realtime_schema.sql (idempotent version)
