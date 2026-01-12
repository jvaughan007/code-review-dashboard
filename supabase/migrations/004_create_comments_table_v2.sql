-- Migration 004 v2: Comments Table for PR Discussions
-- Created: 2026-01-12
-- Purpose: Enable comment threading on pull requests
--
-- IMPORTANT: Run this directly in Supabase SQL Editor
-- The comments table has been dropped, so this creates it fresh

-- ==================================================
-- 1. Drop existing table if any (cleanup)
-- ==================================================

DROP TABLE IF EXISTS comments CASCADE;

-- ==================================================
-- 2. Create comments table with all required fields
-- ==================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,                        -- Format: "owner/repo/number"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,                     -- Denormalized from auth.users for performance
  avatar_url TEXT,                            -- Denormalized from auth.users for performance
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- NULL for top-level comments
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 10000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL

  -- NOTE: Max threading depth enforced in application code (see CommentItem.tsx)
  -- PostgreSQL CHECK constraints don't support subqueries
);

-- ==================================================
-- 3. Create indexes for performance
-- ==================================================

-- Index for fetching all comments for a PR (most common query)
CREATE INDEX idx_comments_pr_id
  ON comments(pr_id, created_at DESC);

-- Index for fetching replies to a comment
CREATE INDEX idx_comments_parent
  ON comments(parent_comment_id)
  WHERE parent_comment_id IS NOT NULL;

-- Index for user's own comments (for editing/deleting)
CREATE INDEX idx_comments_user_id
  ON comments(user_id);

-- Composite index for efficient filtering
CREATE INDEX idx_comments_pr_user
  ON comments(pr_id, user_id);

-- ==================================================
-- 4. Enable Row Level Security (RLS)
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
-- 5. Create updated_at trigger
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
-- 6. Create utility functions
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
-- 7. Verification queries
-- ==================================================

-- Verify table exists and has correct structure
DO $$
BEGIN
  RAISE NOTICE 'Verifying comments table...';

  -- Check if table exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'comments'
  ) THEN
    RAISE NOTICE '✓ Table exists';
  ELSE
    RAISE EXCEPTION '✗ Table does not exist';
  END IF;

  -- Check if RLS is enabled
  IF EXISTS (
    SELECT FROM pg_class
    WHERE relname = 'comments'
    AND relrowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled';
  ELSE
    RAISE WARNING '✗ RLS is not enabled';
  END IF;

  RAISE NOTICE 'Migration complete!';
END $$;

-- Show table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- Show indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'comments';

-- Show RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'comments';
