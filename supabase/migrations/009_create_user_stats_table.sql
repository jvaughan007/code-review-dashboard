-- Migration 009: User Stats (Gamification MVP)
-- Created: 2026-01-17
-- Purpose: Store user gamification stats - points, badges, streaks
--
-- Sprint 8 Story #5: Review Gamification MVP
-- IMPORTANT: Run this directly in Supabase SQL Editor

-- ==================================================
-- 1. Create user_stats table
-- ==================================================

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Points
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,

  -- Activity counters
  files_reviewed INTEGER NOT NULL DEFAULT 0,
  comments_posted INTEGER NOT NULL DEFAULT 0,
  prs_completed INTEGER NOT NULL DEFAULT 0,

  -- Streak tracking
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,

  -- Badge (null = no badge, or bronze/silver/gold)
  badge TEXT CHECK (badge IS NULL OR badge IN ('bronze', 'silver', 'gold')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One stats row per user
  UNIQUE (user_id)
);

-- ==================================================
-- 2. Create indexes
-- ==================================================

-- Primary lookup by user_id (covered by UNIQUE constraint)
CREATE INDEX idx_user_stats_user_id
  ON user_stats(user_id);

-- Leaderboard query: top users by weekly points
CREATE INDEX idx_user_stats_weekly_points
  ON user_stats(weekly_points DESC);

-- ==================================================
-- 3. Enable Row Level Security (RLS)
-- ==================================================

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all stats (for leaderboard)
CREATE POLICY "Authenticated users can read all stats"
  ON user_stats FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Users can insert their own stats
CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can update their own stats
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================================================
-- 4. Create updated_at trigger
-- ==================================================

CREATE OR REPLACE FUNCTION update_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at_trigger
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_updated_at();

-- ==================================================
-- 5. Create badge calculation function
-- ==================================================

CREATE OR REPLACE FUNCTION calculate_badge(points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF points >= 1000 THEN
    RETURN 'gold';
  ELSIF points >= 500 THEN
    RETURN 'silver';
  ELSIF points >= 100 THEN
    RETURN 'bronze';
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- ==================================================
-- 6. Create add_points function (atomic update)
-- ==================================================

CREATE OR REPLACE FUNCTION add_user_points(
  user_id_param UUID,
  points_to_add INTEGER,
  action_type TEXT
)
RETURNS user_stats
LANGUAGE plpgsql
AS $$
DECLARE
  result user_stats;
  new_total INTEGER;
  new_weekly INTEGER;
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  current_last_active DATE;
  new_streak INTEGER;
  new_longest INTEGER;
BEGIN
  -- Get current stats or create new
  SELECT last_active_date, current_streak, longest_streak, total_points, weekly_points
  INTO current_last_active, new_streak, new_longest, new_total, new_weekly
  FROM user_stats
  WHERE user_id = user_id_param;

  IF NOT FOUND THEN
    -- Create new stats record
    INSERT INTO user_stats (user_id, total_points, weekly_points, current_streak, longest_streak, last_active_date, badge)
    VALUES (user_id_param, points_to_add, points_to_add, 1, 1, today_date, calculate_badge(points_to_add))
    RETURNING * INTO result;

    -- Update activity counter
    IF action_type = 'file_reviewed' THEN
      UPDATE user_stats SET files_reviewed = 1 WHERE user_id = user_id_param;
    ELSIF action_type = 'comment_posted' THEN
      UPDATE user_stats SET comments_posted = 1 WHERE user_id = user_id_param;
    ELSIF action_type = 'pr_completed' THEN
      UPDATE user_stats SET prs_completed = 1 WHERE user_id = user_id_param;
    END IF;

    RETURN result;
  END IF;

  -- Calculate new totals
  new_total := new_total + points_to_add;
  new_weekly := new_weekly + points_to_add;

  -- Calculate streak
  IF current_last_active IS NULL OR current_last_active < yesterday_date THEN
    -- Streak broken or first activity
    new_streak := 1;
  ELSIF current_last_active = yesterday_date THEN
    -- Consecutive day
    new_streak := new_streak + 1;
    IF new_streak > new_longest THEN
      new_longest := new_streak;
    END IF;
  END IF;
  -- If same day, streak stays the same

  -- Update stats
  UPDATE user_stats
  SET
    total_points = new_total,
    weekly_points = new_weekly,
    current_streak = new_streak,
    longest_streak = new_longest,
    last_active_date = today_date,
    badge = calculate_badge(new_total),
    files_reviewed = CASE WHEN action_type = 'file_reviewed' THEN files_reviewed + 1 ELSE files_reviewed END,
    comments_posted = CASE WHEN action_type = 'comment_posted' THEN comments_posted + 1 ELSE comments_posted END,
    prs_completed = CASE WHEN action_type = 'pr_completed' THEN prs_completed + 1 ELSE prs_completed END
  WHERE user_id = user_id_param
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ==================================================
-- 7. Create weekly reset function (for cron job)
-- ==================================================

CREATE OR REPLACE FUNCTION reset_weekly_points()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_stats
  SET weekly_points = 0
  WHERE weekly_points > 0;

  RAISE NOTICE 'Weekly points reset completed at %', NOW();
END;
$$;

-- ==================================================
-- 8. Create leaderboard view
-- ==================================================

CREATE OR REPLACE VIEW leaderboard AS
SELECT
  us.user_id,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'user_name', 'Anonymous') AS username,
  u.raw_user_meta_data->>'avatar_url' AS avatar_url,
  us.weekly_points,
  us.badge
FROM user_stats us
JOIN auth.users u ON us.user_id = u.id
WHERE us.weekly_points > 0
ORDER BY us.weekly_points DESC
LIMIT 10;

-- ==================================================
-- 9. Verification
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE 'Verifying user_stats table...';

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_stats'
  ) THEN
    RAISE NOTICE '✓ Table exists';
  ELSE
    RAISE EXCEPTION '✗ Table does not exist';
  END IF;

  IF EXISTS (
    SELECT FROM pg_class
    WHERE relname = 'user_stats'
    AND relrowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled';
  ELSE
    RAISE WARNING '✗ RLS is not enabled';
  END IF;

  RAISE NOTICE 'Migration 009 complete!';
END $$;
