-- Migration 007: Review Progress Tracking
-- Created: 2026-01-15
-- Purpose: Track file-level review progress per user per PR
--
-- IMPORTANT: Run this directly in Supabase SQL Editor

-- ==================================================
-- 1. Create review_progress table
-- ==================================================

CREATE TABLE IF NOT EXISTS review_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,                        -- Format: "owner/repo/number"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,                    -- File path in the PR
  status TEXT NOT NULL DEFAULT 'not_started'  -- not_started, in_progress, completed
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Unique constraint: one progress entry per user per file per PR
  UNIQUE (pr_id, user_id, file_path)
);

-- ==================================================
-- 2. Create indexes for performance
-- ==================================================

-- Index for fetching all progress for a user on a PR (most common query)
CREATE INDEX idx_review_progress_pr_user
  ON review_progress(pr_id, user_id);

-- Index for finding all files a user has reviewed
CREATE INDEX idx_review_progress_user_status
  ON review_progress(user_id, status)
  WHERE status = 'completed';

-- Index for PR-level progress stats
CREATE INDEX idx_review_progress_pr_status
  ON review_progress(pr_id, status);

-- ==================================================
-- 3. Enable Row Level Security (RLS)
-- ==================================================

ALTER TABLE review_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON review_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON review_progress FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON review_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress"
  ON review_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ==================================================
-- 4. Create updated_at trigger
-- ==================================================

CREATE OR REPLACE FUNCTION update_review_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_progress_updated_at_trigger
  BEFORE UPDATE ON review_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_review_progress_updated_at();

-- ==================================================
-- 5. Create utility functions
-- ==================================================

-- Function to get progress stats for a user on a PR
CREATE OR REPLACE FUNCTION get_pr_progress_stats(
  pr_id_param TEXT,
  user_id_param UUID
)
RETURNS TABLE (
  total_files BIGINT,
  completed BIGINT,
  in_progress BIGINT,
  not_started BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*) as total_files,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE status = 'not_started') as not_started
  FROM review_progress
  WHERE pr_id = pr_id_param AND user_id = user_id_param;
$$;

-- ==================================================
-- 6. Verification
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE 'Verifying review_progress table...';

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'review_progress'
  ) THEN
    RAISE NOTICE '✓ Table exists';
  ELSE
    RAISE EXCEPTION '✗ Table does not exist';
  END IF;

  IF EXISTS (
    SELECT FROM pg_class
    WHERE relname = 'review_progress'
    AND relrowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled';
  ELSE
    RAISE WARNING '✗ RLS is not enabled';
  END IF;

  RAISE NOTICE 'Migration 007 complete!';
END $$;
