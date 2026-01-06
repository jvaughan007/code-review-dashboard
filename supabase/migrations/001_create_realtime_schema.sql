-- Real-Time Code Review Dashboard - Database Schema
-- Migration: 001 - Create core real-time tables
-- SAFE IDEMPOTENT VERSION: Can be run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLEANUP: Drop existing objects in correct order (dependencies first)
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

-- ============================================================================
-- PR Sessions Table
-- Tracks active viewing sessions for pull requests
-- ============================================================================
CREATE TABLE pr_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id TEXT NOT NULL, -- Format: "owner/repo/number"
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraints
  CONSTRAINT pr_sessions_unique UNIQUE (pr_id, user_id)
);

-- Indexes for pr_sessions
CREATE INDEX idx_pr_sessions_pr_id ON pr_sessions(pr_id);
CREATE INDEX idx_pr_sessions_user_id ON pr_sessions(user_id);
CREATE INDEX idx_pr_sessions_active ON pr_sessions(pr_id, is_active) WHERE is_active = true;

-- ============================================================================
-- Presence Table
-- Real-time presence data for active users
-- ============================================================================
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES pr_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  current_file TEXT, -- Which file they're viewing
  current_line INTEGER, -- Which line they're at
  status TEXT DEFAULT 'viewing', -- viewing, commenting, idle
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT presence_unique UNIQUE (session_id)
);

-- Indexes for presence
CREATE INDEX idx_presence_pr_id ON presence(pr_id);
CREATE INDEX idx_presence_heartbeat ON presence(last_heartbeat);

-- ============================================================================
-- Live Cursors Table
-- Track cursor positions in real-time
-- ============================================================================
CREATE TABLE cursors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES pr_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  x INTEGER NOT NULL, -- X coordinate (px)
  y INTEGER NOT NULL, -- Y coordinate (px)
  line_number INTEGER, -- Which line cursor is on
  color TEXT NOT NULL, -- Cursor color (hex)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cursors_unique UNIQUE (session_id, file_path)
);

-- Indexes for cursors
CREATE INDEX idx_cursors_pr_file ON cursors(pr_id, file_path);
CREATE INDEX idx_cursors_updated ON cursors(updated_at);

-- ============================================================================
-- Comments Table
-- Real-time synchronized comments on code lines
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded replies
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Indexes for comments
CREATE INDEX idx_comments_pr_file_line ON comments(pr_id, file_path, line_number);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- PR Sessions Policies
CREATE POLICY "Users can view all active sessions"
  ON pr_sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert their own sessions"
  ON pr_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON pr_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Presence Policies
CREATE POLICY "Users can view all presence data"
  ON presence FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own presence"
  ON presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
  ON presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
  ON presence FOR DELETE
  USING (auth.uid() = user_id);

-- Cursors Policies
CREATE POLICY "Users can view all cursors"
  ON cursors FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own cursors"
  ON cursors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cursors"
  ON cursors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cursors"
  ON cursors FOR DELETE
  USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Users can view all comments"
  ON comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (is_deleted = true);

-- ============================================================================
-- Automatic Cleanup Functions
-- ============================================================================

-- Function to clean up stale sessions (inactive for >5 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pr_sessions
  SET is_active = false
  WHERE last_seen_at < NOW() - INTERVAL '5 minutes'
    AND is_active = true;
END;
$$;

-- Function to clean up old presence data
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM presence
  WHERE last_heartbeat < NOW() - INTERVAL '5 minutes';

  DELETE FROM cursors
  WHERE updated_at < NOW() - INTERVAL '5 minutes';
END;
$$;

-- ============================================================================
-- Realtime Publication
-- Enable Realtime for all tables
-- ============================================================================

-- This will be enabled in Supabase dashboard
-- ALTER PUBLICATION supabase_realtime ADD TABLE pr_sessions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE presence;
-- ALTER PUBLICATION supabase_realtime ADD TABLE cursors;
-- ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursors_updated_at
  BEFORE UPDATE ON cursors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
