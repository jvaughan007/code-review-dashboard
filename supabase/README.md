# Supabase Database Setup

This directory contains database migrations for the Code Review Dashboard real-time features.

## Quick Start

### 1. Apply Database Migration

**Option A: Using Supabase SQL Editor (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `migrations/001_create_realtime_schema.sql`
5. Paste into the query editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify all tables were created (check "Table Editor" tab)

**Option B: Using Supabase CLI** (if installed)
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
```

### 2. Enable Realtime

1. In Supabase dashboard, go to **Database** > **Replication**
2. Enable Realtime for these tables:
   - ✅ `pr_sessions`
   - ✅ `presence`
   - ✅ `cursors`
   - ✅ `comments`

3. Click **Save** for each table

### 3. Verify Setup

Run this query in SQL Editor to verify everything is set up:

```sql
-- Check that tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments');

-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pr_sessions', 'presence', 'cursors', 'comments');

-- Check that policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Expected results:
- 4 tables created
- RLS enabled on all 4 tables
- Multiple policies per table

---

## Database Schema Overview

### Tables

**pr_sessions**
- Tracks active viewing sessions for pull requests
- Used to know who's currently viewing which PR

**presence**
- Real-time presence data (who's online, what they're doing)
- Heartbeat system to detect disconnects
- Shows current file and line number

**cursors**
- Live cursor positions
- Throttled updates (max 60fps)
- Includes color assignment per user

**comments**
- Real-time synchronized comments on code lines
- Supports threaded replies (parent_id)
- Soft delete (is_deleted flag)

### Row Level Security (RLS)

All tables have RLS enabled with these policies:
- ✅ Users can **view** all data (needed for collaboration)
- ✅ Users can **insert/update/delete** only their own data
- ✅ Comments require auth to create
- ✅ Stale data is automatically cleaned up

### Automatic Cleanup

Two cleanup functions run periodically:
- `cleanup_stale_sessions()` - Marks sessions inactive after 5 minutes
- `cleanup_stale_presence()` - Deletes stale presence/cursor data

**Note**: You'll need to set up a cron job or Supabase Edge Function to call these periodically.

---

## Testing the Setup

### Test Presence System

```sql
-- Insert a test session (replace user_id with your actual user ID)
INSERT INTO pr_sessions (pr_id, user_id)
VALUES ('facebook/react/12345', 'YOUR_USER_ID');

-- Insert presence data
INSERT INTO presence (session_id, user_id, pr_id, username, avatar_url)
VALUES (
  (SELECT id FROM pr_sessions WHERE user_id = 'YOUR_USER_ID' LIMIT 1),
  'YOUR_USER_ID',
  'facebook/react/12345',
  'testuser',
  'https://github.com/testuser.png'
);

-- Query active presence
SELECT * FROM presence WHERE pr_id = 'facebook/react/12345';

-- Cleanup
DELETE FROM pr_sessions WHERE user_id = 'YOUR_USER_ID';
```

### Test Realtime Subscriptions

In your browser console (after deploying app):

```javascript
// Subscribe to presence updates
const subscription = supabase
  .channel('presence-test')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'presence' },
    (payload) => console.log('Presence update:', payload)
  )
  .subscribe();

// You should see real-time updates when presence data changes
```

---

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 001 | 2026-01-06 | Initial schema - pr_sessions, presence, cursors, comments |

---

## Troubleshooting

### "permission denied for table X"
- **Cause**: RLS policies not set up correctly
- **Fix**: Re-run the migration, ensure all policies are created

### "relation does not exist"
- **Cause**: Migration didn't run successfully
- **Fix**: Check Supabase SQL Editor for error messages, re-run migration

### Realtime not working
- **Cause**: Realtime not enabled on tables
- **Fix**: Go to Database > Replication, enable for all 4 tables

### Stale presence data not cleaning up
- **Cause**: Cleanup functions not being called
- **Fix**: Set up a Supabase Edge Function or cron job to call cleanup functions every 5 minutes

---

## Next Steps

After completing this setup:
1. ✅ All tables created
2. ✅ RLS policies active
3. ✅ Realtime enabled
4. ⏭️ Start building React components that use these tables
5. ⏭️ Test real-time subscriptions in the app

See `WEEK2_PLAN.md` for development roadmap.
