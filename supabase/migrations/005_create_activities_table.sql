-- ============================================================================
-- Migration 005: Activity Feed
-- ============================================================================
-- Creates activities table to track user actions on PRs for real-time collaboration
--
-- Features:
-- - Tracks join/leave, comments, cursor activity
-- - JSONB metadata for flexible event data
-- - 7-day TTL for storage management
-- - Optimized indexes for polling queries
-- - RLS policies for secure access
--
-- Free Tier Impact:
-- - Storage: ~350KB per PR (7 days retention)
-- - Requests: ~288k/month for 10 active PRs (58% of 500k limit)
-- - Query time: <10ms with composite indexes
-- ============================================================================

-- ============================================================================
-- Activities Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES pr_sessions(id) ON DELETE SET NULL,

  -- Activity classification
  activity_type TEXT NOT NULL,

  -- Flexible metadata (avoids schema changes for new activity types)
  -- Examples:
  -- - comment_posted: { comment_id, comment_body_preview }
  -- - user_joined: { username, avatar_url }
  -- - cursor_active: { file_path, cursor_color }
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT activities_type_check CHECK (activity_type IN (
    'user_joined',      -- User joined PR session
    'user_left',        -- User left PR session
    'comment_posted',   -- New comment added
    'comment_deleted',  -- Comment removed
    'cursor_active',    -- User cursor became active
    'cursor_idle'       -- User cursor became idle
  ))
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Primary polling query: Get recent activities for a PR
-- Supports: WHERE pr_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_activities_pr_created
  ON activities(pr_id, created_at DESC);

-- JSONB metadata queries (if needed for filtering)
-- Supports: WHERE metadata->>'comment_id' = ?
CREATE INDEX IF NOT EXISTS idx_activities_metadata
  ON activities USING GIN(metadata);

-- User activity history
-- Supports: WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_activities_user
  ON activities(user_id, created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view all activities
-- Rationale: Activities are PR-scoped, not user-private
-- Consistent with existing presence/comments/cursors policies
CREATE POLICY "Users can view all activities"
  ON activities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Users can only insert their own activities
-- Prevents impersonation attacks
CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Deny all updates (activities are immutable)
-- Prevents tampering with historical record
CREATE POLICY "Activities are immutable"
  ON activities FOR UPDATE
  USING (false);

-- DELETE: Only allow cleanup of old activities (>7 days)
-- Enables TTL cleanup while preventing accidental deletion
-- Note: In production, restrict to service role for safety
CREATE POLICY "System can delete old activities"
  ON activities FOR DELETE
  USING (created_at < NOW() - INTERVAL '7 days');

-- ============================================================================
-- Cleanup Function
-- ============================================================================

-- Function to clean up old activities (>7 days)
-- Call this manually on free tier, or via pg_cron on Pro tier
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM activities
  WHERE created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Cleaned up % old activities (>7 days)', deleted_count;
END;
$$;

-- ============================================================================
-- Verification Queries (Run after migration)
-- ============================================================================

-- Verify table exists
-- SELECT EXISTS (
--   SELECT FROM pg_tables
--   WHERE schemaname = 'public'
--   AND tablename = 'activities'
-- );

-- Verify indexes exist
-- SELECT indexname
-- FROM pg_indexes
-- WHERE tablename = 'activities';

-- Verify RLS is enabled
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname = 'activities';

-- Verify RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'activities';

-- Test cleanup function
-- SELECT cleanup_old_activities();

-- ============================================================================
-- Optional: pg_cron Job (Pro Tier Only)
-- ============================================================================

-- Uncomment if you have Supabase Pro tier with pg_cron enabled
-- Runs cleanup daily at 2 AM

-- SELECT cron.schedule(
--   'cleanup-old-activities',      -- Job name
--   '0 2 * * *',                   -- Cron expression (2 AM daily)
--   $$SELECT cleanup_old_activities();$$
-- );

-- To verify cron job:
-- SELECT * FROM cron.job WHERE jobname = 'cleanup-old-activities';

-- To remove cron job:
-- SELECT cron.unschedule('cleanup-old-activities');

-- ============================================================================
-- Migration Complete
-- ============================================================================
