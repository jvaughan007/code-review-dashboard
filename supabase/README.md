# Supabase Database Setup

This directory contains database migrations for the Code Review Dashboard real-time features.

## Architecture Overview

**Real-Time Implementation**: Database Polling + Optimistic UI

Since Supabase Realtime (WebSockets) requires alpha access or a paid subscription, we're implementing real-time features using:

- **Database Polling**: Efficient queries every 2-3 seconds
- **Optimistic UI**: Instant updates with Zustand (feels real-time)
- **Smart Caching**: Minimize database load
- **Indexed Queries**: Fast lookups with proper indexes

**Result**: Zero-cost solution that feels responsive while maintaining the portfolio project's free-tier requirement.

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

### 2. Verify Setup

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

### Test Database Polling

In your browser console (after deploying app):

```javascript
// Test fetching presence data
const { data, error } = await supabase
  .from('presence')
  .select('*')
  .eq('pr_id', 'facebook/react/12345');

console.log('Active presence:', data);
// You should see all users currently viewing the PR
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

### Stale presence data not cleaning up
- **Cause**: Cleanup functions not being called
- **Fix**: Set up a Supabase Edge Function or cron job to call cleanup functions every 5 minutes

---

## Next Steps

After completing this setup:
1. ✅ All tables created
2. ✅ RLS policies active
3. ⏭️ Start building React components that poll these tables
4. ⏭️ Implement optimistic UI with Zustand
5. ⏭️ Test database polling and performance

**Architecture Note**: This implementation uses **database polling** instead of WebSockets (Supabase Realtime requires alpha access/paid plan). We achieve "real-time feel" through:
- Optimistic UI updates (instant feedback)
- Efficient polling every 2-3 seconds
- Smart caching with Zustand

See `WEEK2_PLAN.md` for development roadmap.
