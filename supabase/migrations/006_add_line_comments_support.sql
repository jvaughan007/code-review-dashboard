-- Migration 006: Add Line-Specific Comments Support
-- Created: 2026-01-13
-- Purpose: Enable comments on specific lines in diffs
--
-- IMPORTANT: Run this directly in Supabase SQL Editor

-- ==================================================
-- 1. Add line-specific columns to comments table
-- ==================================================

-- file_path: The file in the PR (e.g., "src/components/diff-viewer.tsx")
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- line_number: The line number in the diff (1-indexed)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS line_number INTEGER;

-- line_type: Type of line (addition, deletion, or context)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS line_type TEXT
  CHECK (line_type IS NULL OR line_type IN ('addition', 'deletion', 'context'));

-- line_content: Snapshot of the line content (for reference when PR is updated)
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS line_content TEXT;

-- ==================================================
-- 2. Add index for line-specific comment queries
-- ==================================================

-- Index for fetching comments for a specific file and line
-- Only indexes rows where file_path and line_number are NOT NULL
CREATE INDEX IF NOT EXISTS idx_comments_line
  ON comments(pr_id, file_path, line_number)
  WHERE file_path IS NOT NULL AND line_number IS NOT NULL;

-- Index for fetching all line comments for a file
CREATE INDEX IF NOT EXISTS idx_comments_file
  ON comments(pr_id, file_path)
  WHERE file_path IS NOT NULL;

-- ==================================================
-- 3. Create utility functions for line comments
-- ==================================================

-- Function to get comment count for a specific line
CREATE OR REPLACE FUNCTION get_line_comment_count(
  pr_id_param TEXT,
  file_path_param TEXT,
  line_number_param INTEGER
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM comments
  WHERE pr_id = pr_id_param
    AND file_path = file_path_param
    AND line_number = line_number_param;
$$;

-- Function to get file comment summary (line numbers with comment counts)
CREATE OR REPLACE FUNCTION get_file_comment_summary(
  pr_id_param TEXT,
  file_path_param TEXT
)
RETURNS TABLE(line_number INTEGER, comment_count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    line_number,
    COUNT(*) as comment_count
  FROM comments
  WHERE pr_id = pr_id_param
    AND file_path = file_path_param
    AND line_number IS NOT NULL
  GROUP BY line_number
  ORDER BY line_number;
$$;

-- ==================================================
-- 4. Verification
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE 'Verifying line comment columns...';

  -- Check if columns exist
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name = 'file_path'
  ) THEN
    RAISE NOTICE '✓ file_path column exists';
  ELSE
    RAISE EXCEPTION '✗ file_path column missing';
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name = 'line_number'
  ) THEN
    RAISE NOTICE '✓ line_number column exists';
  ELSE
    RAISE EXCEPTION '✗ line_number column missing';
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name = 'line_type'
  ) THEN
    RAISE NOTICE '✓ line_type column exists';
  ELSE
    RAISE EXCEPTION '✗ line_type column missing';
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'comments'
    AND column_name = 'line_content'
  ) THEN
    RAISE NOTICE '✓ line_content column exists';
  ELSE
    RAISE EXCEPTION '✗ line_content column missing';
  END IF;

  RAISE NOTICE 'Migration 006 complete!';
END $$;

-- Show updated table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;
