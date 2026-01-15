-- Migration 008: User Settings (Notification Preferences)
-- Created: 2026-01-15
-- Purpose: Store user notification preferences synced across devices
--
-- IMPORTANT: Run this directly in Supabase SQL Editor

-- ==================================================
-- 1. Create user_settings table
-- ==================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification preferences (JSONB for flexibility)
  notification_settings JSONB NOT NULL DEFAULT '{
    "newComments": true,
    "mentionedInComment": true,
    "prUpdates": true,
    "reviewAssigned": true,
    "soundEnabled": false,
    "browserNotifications": false
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One settings row per user
  UNIQUE (user_id)
);

-- ==================================================
-- 2. Create indexes
-- ==================================================

-- Primary lookup is by user_id (covered by UNIQUE constraint)
CREATE INDEX idx_user_settings_user_id
  ON user_settings(user_id);

-- ==================================================
-- 3. Enable Row Level Security (RLS)
-- ==================================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own settings
CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.role() = 'authenticated'
  );

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ==================================================
-- 4. Create updated_at trigger
-- ==================================================

CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ==================================================
-- 5. Create upsert function for settings
-- ==================================================

CREATE OR REPLACE FUNCTION upsert_user_settings(
  user_id_param UUID,
  settings_param JSONB
)
RETURNS user_settings
LANGUAGE plpgsql
AS $$
DECLARE
  result user_settings;
BEGIN
  INSERT INTO user_settings (user_id, notification_settings)
  VALUES (user_id_param, settings_param)
  ON CONFLICT (user_id)
  DO UPDATE SET
    notification_settings = settings_param,
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ==================================================
-- 6. Verification
-- ==================================================

DO $$
BEGIN
  RAISE NOTICE 'Verifying user_settings table...';

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_settings'
  ) THEN
    RAISE NOTICE '✓ Table exists';
  ELSE
    RAISE EXCEPTION '✗ Table does not exist';
  END IF;

  IF EXISTS (
    SELECT FROM pg_class
    WHERE relname = 'user_settings'
    AND relrowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled';
  ELSE
    RAISE WARNING '✗ RLS is not enabled';
  END IF;

  RAISE NOTICE 'Migration 008 complete!';
END $$;
