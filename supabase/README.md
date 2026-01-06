# Supabase Real-Time Collaboration Schema

This directory contains the database schema and migrations for the real-time code review dashboard.

## Files

- **`migrations/001_create_realtime_schema.sql`** - Main migration file (idempotent, safe to re-run)
- **`MIGRATION_CLEANUP_GUIDE.md`** - Comprehensive troubleshooting guide for migration errors
- **`test_migration.sql`** - Verification queries to test migration success
- **`database.types.ts`** - TypeScript type definitions for type-safe database access

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

**IMPORTANT**: The migration is now **idempotent** (safe to run multiple times). If you get "relation already exists" errors, just re-run it.

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration (auto-cleanup + recreate)
npx supabase db push
```

**Option B: Using Supabase SQL Editor**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `migrations/001_create_realtime_schema.sql`
5. Paste into the query editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify all tables were created (check "Table Editor" tab)

### 2. Verify Setup

**Option A: Quick Verification (SQL Editor)**

Run this in Supabase SQL Editor:
```sql
-- Check that tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pr_sessions', 'presence', 'cursors', 'comments');
```

Expected: 4 rows (all tables present)

**Option B: Comprehensive Verification**

Copy and run the entire `test_migration.sql` file in SQL Editor. It will verify:
- All tables exist
- RLS enabled on all tables
- All indexes created
- All policies exist
- All functions exist
- All triggers exist
- All foreign keys valid

Expected results:
- 4 tables created
- RLS enabled on all 4 tables (status: "✓ ENABLED")
- 13 RLS policies total
- 10+ indexes
- 3 functions (all with SECURITY DEFINER)
- 2 triggers

### 3. Update TypeScript Types (Optional)

If you want type-safe database access:

```bash
# Generate fresh types from database
npx supabase gen types typescript --local > supabase/database.types.ts

# Or from remote project
npx supabase gen types typescript --project-id [your-project-id] > supabase/database.types.ts
```

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

### "ERROR: 42P07: relation already exists"

**Cause**: Partial migration was previously run

**Solutions**:
1. **Just re-run it** - The migration is now idempotent and will auto-cleanup
2. **Use CLI**: `npx supabase db reset` (destroys all data, use with caution)
3. **Manual cleanup**: See `MIGRATION_CLEANUP_GUIDE.md` for detailed instructions

### "permission denied for table X"
- **Cause**: RLS policies not set up correctly or not authenticated
- **Fix**: Re-run the migration, ensure all policies are created. Make sure you're using Supabase CLI (`npx supabase db push`) not direct psql

### "permission denied for schema auth"
- **Cause**: Trying to reference `auth.users` without proper permissions
- **Fix**: Use Supabase CLI which has proper permissions, not direct SQL execution

### "relation does not exist"
- **Cause**: Migration didn't run successfully
- **Fix**: Check Supabase SQL Editor for error messages, verify tables exist with quick verification query

### Stale presence data not cleaning up
- **Cause**: Cleanup functions not being called
- **Fix**: Set up a Supabase Edge Function or cron job to call cleanup functions every 5 minutes

### RLS blocks all queries
- **Cause**: Not authenticated or RLS policies too restrictive
- **Fix**: Make sure you're authenticated (`auth.uid()` exists). For testing, temporarily disable RLS:
  ```sql
  ALTER TABLE pr_sessions DISABLE ROW LEVEL SECURITY; -- Testing only!
  ```

For comprehensive troubleshooting, see **`MIGRATION_CLEANUP_GUIDE.md`**

---

## TypeScript Integration

The `database.types.ts` file provides type-safe database access:

```typescript
import type { Database, PRSession, Presence, Comment } from './supabase/database.types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Type-safe queries
const { data: sessions } = await supabase
  .from('pr_sessions')
  .select('*')
  .eq('pr_id', 'facebook/react/12345')

// Type-safe inserts
const { data: newSession } = await supabase
  .from('pr_sessions')
  .insert({
    pr_id: 'facebook/react/12345',
    user_id: currentUserId,
  })
  .select()
  .single()
```

### Available Types

- `Database` - Full database schema type
- `PRSession`, `PRSessionInsert`, `PRSessionUpdate` - Session types
- `Presence`, `PresenceInsert`, `PresenceUpdate` - Presence types
- `Cursor`, `CursorInsert`, `CursorUpdate` - Cursor types
- `Comment`, `CommentInsert`, `CommentUpdate` - Comment types
- `PresenceStatus` - Type-safe status enum ('viewing' | 'commenting' | 'idle')
- `PRId` - Type-safe PR ID format (`owner/repo/number`)

---

## Performance Optimization

### Database Polling Strategy

**Recommended Polling Intervals:**
- **Presence/Cursors**: 500ms - 1s (high frequency for smooth UI)
- **Comments**: 2-5s (moderate frequency)
- **Sessions**: 5-10s (low frequency)

### Query Optimization

All polling queries are optimized with:
- Indexes on all commonly queried columns
- Partial indexes for filtered queries (e.g., `WHERE is_active = true`)
- Efficient filtering with timestamp comparisons

Example efficient polling query:
```typescript
// Only fetch recent updates (last 5 seconds)
const { data } = await supabase
  .from('presence')
  .select('*')
  .eq('pr_id', prId)
  .gte('last_heartbeat', new Date(Date.now() - 5000).toISOString())
```

### Monitoring Performance

Check index usage:
```sql
SELECT indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename IN ('pr_sessions', 'presence', 'cursors', 'comments')
ORDER BY idx_scan DESC;
```

Check slow queries:
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%presence%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Next Steps

After completing this setup:
1. ✅ All tables created
2. ✅ RLS policies active
3. ✅ TypeScript types available
4. ⏭️ Start building React components that poll these tables
5. ⏭️ Implement optimistic UI with Zustand
6. ⏭️ Test database polling and performance
7. ⏭️ Set up cleanup functions (cron job or Edge Function)

**Architecture Note**: This implementation uses **database polling** instead of WebSockets (Supabase Realtime requires alpha access/paid plan). We achieve "real-time feel" through:
- Optimistic UI updates (instant feedback)
- Efficient polling every 2-3 seconds
- Smart caching with Zustand
- Indexed queries for fast lookups

See `WEEK2_PLAN.md` for development roadmap.

---

## Additional Resources

- **Migration Troubleshooting**: See `MIGRATION_CLEANUP_GUIDE.md`
- **Verification Queries**: See `test_migration.sql`
- **TypeScript Types**: See `database.types.ts`
- **Supabase Docs**: https://supabase.com/docs/guides/database
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
