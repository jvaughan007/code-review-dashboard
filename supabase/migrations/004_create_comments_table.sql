-- Migration 004: Comments Table for PR Discussions
-- Created: 2026-01-12
-- Purpose: Enable comment threading on pull requests

-- ==================================================
-- 1. Create comments table
-- ==================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,                        -- Format: "owner/repo/number"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,                     -- Denormalized for performance
  avatar_url TEXT,                            -- Denormalized for performance
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- NULL for top-level comments
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT comments_max_depth CHECK (
    -- Enforce max threading depth of 3 (prevents infinite nesting)
    parent_comment_id IS NULL OR
    (SELECT COUNT(*) FROM comments c2 WHERE c2.id = parent_comment_id) < 3
  )
);

-- ==================================================
-- 2. Create indexes for performance
-- ==================================================

-- Index for fetching all comments for a PR (most common query)
CREATE INDEX IF NOT EXISTS idx_comments_pr_id
  ON comments(pr_id, created_at DESC);

-- Index for fetching replies to a comment
CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON comments(parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;

-- Index for user's own comments (for editing/deleting)
CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON comments(user_id);

-- Composite index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_comments_pr_user
  ON comments(pr_id, user_id);

-- ==================================================
-- 3. Enable Row Level Security (RLS)
-- ==================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments (public PRs)
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can update their own comments (for 15 minutes after creation)
CREATE POLICY "Users can update own comments within 15 minutes"
  ON comments FOR UPDATE
  USING (
    auth.uid() = user_id AND
    auth.role() = 'authenticated' AND
    created_at > NOW() - INTERVAL '15 minutes'
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- ==================================================
-- 4. Create updated_at trigger
-- ==================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on comments table
CREATE TRIGGER update_comments_updated_at_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- ==================================================
-- 5. Create utility functions
-- ==================================================

-- Function to get comment count for a PR
CREATE OR REPLACE FUNCTION get_comment_count(pr_id_param TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM comments
  WHERE pr_id = pr_id_param;
$$;

-- Function to get reply count for a comment
CREATE OR REPLACE FUNCTION get_reply_count(comment_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM comments
  WHERE parent_comment_id = comment_id_param;
$$;

-- ==================================================
-- 6. Create down migration (for rollback)
-- ==================================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS update_comments_updated_at_trigger ON comments;
-- DROP FUNCTION IF EXISTS update_comments_updated_at();
-- DROP FUNCTION IF EXISTS get_comment_count(TEXT);
-- DROP FUNCTION IF EXISTS get_reply_count(UUID);
-- DROP TABLE IF EXISTS comments CASCADE;

-- ==================================================
-- 7. Validation queries (run after migration)
-- ==================================================

-- Verify table exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables
--   WHERE table_schema = 'public'
--   AND table_name = 'comments'
-- );

-- Verify indexes exist
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'comments';

-- Verify RLS is enabled
-- SELECT relname, relrowsecurity
-- FROM pg_class
-- WHERE relname = 'comments';

-- Verify policies exist
-- SELECT policyname, cmd
-- FROM pg_policies
-- WHERE tablename = 'comments';

-- ==================================================
-- 8. Sample test data (optional, for development)
-- ==================================================

-- INSERT INTO comments (pr_id, user_id, body) VALUES
--   ('owner/repo/1', auth.uid(), 'First comment on PR #1'),
--   ('owner/repo/1', auth.uid(), 'Second comment with more detail'),
--   ('owner/repo/2', auth.uid(), 'Comment on different PR');

-- INSERT INTO comments (pr_id, user_id, parent_comment_id, body)
-- SELECT 'owner/repo/1', auth.uid(), id, 'Reply to first comment'
-- FROM comments WHERE body = 'First comment on PR #1';

-- ==================================================
-- Migration complete
-- ==================================================

-- Run this migration with:
-- psql -U postgres -d code_review_dashboard -f supabase/migrations/004_create_comments_table.sql

-- Or via Supabase CLI:
-- supabase db push
