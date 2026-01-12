# Database Migration Instructions

## Current Status

✅ **Comments table has been dropped** (user action completed)
✅ **Supabase CLI is NOT installed** (not needed for this project)
⚠️ **Ready for fresh table creation**

## Issue Fixed

**Problem**: Comments were failing to post because the database schema was missing required columns (`username` and `avatar_url`) that the application code expected.

**Solution**: Created fresh migration `004_create_comments_table_v2.sql` with all required fields.

## How to Apply the Migration

### ✅ Recommended: Supabase Dashboard (Direct SQL)

**Since you already deleted the comments table, use this clean migration:**

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Copy Migration SQL**
   - Open file: `supabase/migrations/004_create_comments_table_v2.sql`
   - Copy the ENTIRE contents (includes DROP TABLE, CREATE TABLE, indexes, RLS policies)

3. **Run Migration**
   - Paste into SQL Editor
   - Click **Run** button
   - Wait for "Success" message

4. **Verify**
   - Scroll down in the results panel
   - You should see:
     - ✓ Table exists
     - ✓ RLS is enabled
     - Table structure with all columns
     - List of indexes
     - List of RLS policies

### ❌ NOT Recommended: Supabase CLI

Supabase CLI is **not installed** in this project and is **not needed**. The dashboard SQL Editor is simpler and works perfectly for this use case.

## Expected Table Structure

After migration, the `comments` table will have:

**Columns:**
- ✅ `id` (UUID, PRIMARY KEY) - Auto-generated
- ✅ `pr_id` (TEXT, NOT NULL) - Format: "owner/repo/number"
- ✅ `user_id` (UUID, NOT NULL) - References auth.users
- ✅ `username` (TEXT, NOT NULL) - Denormalized for performance
- ✅ `avatar_url` (TEXT, NULLABLE) - Denormalized for performance
- ✅ `parent_comment_id` (UUID, NULLABLE) - For threading (max depth 3)
- ✅ `body` (TEXT, NOT NULL) - Comment content (max 10,000 chars)
- ✅ `created_at` (TIMESTAMPTZ, NOT NULL) - Auto-timestamp
- ✅ `updated_at` (TIMESTAMPTZ, NOT NULL) - Auto-updated via trigger

**Indexes (for performance):**
- ✅ `idx_comments_pr_id` - Fast PR comment queries
- ✅ `idx_comments_parent` - Fast reply lookups
- ✅ `idx_comments_user_id` - Fast user comment queries
- ✅ `idx_comments_pr_user` - Composite index

**RLS Policies (security):**
- ✅ Anyone can read comments
- ✅ Authenticated users can insert comments
- ✅ Users can update own comments (15-minute window)
- ✅ Users can delete own comments

## Testing After Migration

### 1. Verify Migration Success

The migration script includes verification output. You should see:
```
NOTICE:  Verifying comments table...
NOTICE:  ✓ Table exists
NOTICE:  ✓ RLS is enabled
NOTICE:  Migration complete!
```

### 2. Test in Application

```bash
# Start dev server
npm run dev
```

**Test Steps:**
1. ✅ **Log in** with GitHub OAuth
2. ✅ **Navigate** to any PR detail page
3. ✅ **Post a comment** → Should appear immediately with your username/avatar
4. ✅ **Reply** to the comment → Should thread correctly (indented)
5. ✅ **Delete** your comment → Should remove completely
6. ✅ **Check real-time sync** → Open same PR in another browser window, comment should sync within 3 seconds

### Expected Behavior

- **Optimistic UI**: Comments appear instantly before server saves
- **Real-time sync**: Comments sync every 3 seconds via polling
- **Character counter**: Max 10,000 characters
- **Relative timestamps**: "2 minutes ago", "1 hour ago", etc.
- **Threading**: Up to 3 levels deep (original → reply → reply to reply)
- **Delete button**: Only visible on hover, only for your own comments

All operations should work without errors! 🎉
