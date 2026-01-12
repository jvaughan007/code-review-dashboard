# Database Migration Instructions

## Issue Fixed

**Problem**: Comments were failing to post with database errors because the `comments` table schema was missing required columns (`username` and `avatar_url`).

**Solution**: Updated migration `004_create_comments_table.sql` to include these columns.

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/004_create_comments_table.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI (if configured)

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

### Option 3: Drop and Recreate (Development Only)

If you're in development and have no production data:

```sql
-- Run this in Supabase SQL Editor
DROP TABLE IF EXISTS comments CASCADE;

-- Then run the full migration from 004_create_comments_table.sql
```

## Verification

After applying the migration, verify the table structure:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (UUID, NOT NULL)
- `pr_id` (TEXT, NOT NULL)
- `user_id` (UUID, NOT NULL)
- `username` (TEXT, NOT NULL) ← **NEW**
- `avatar_url` (TEXT, NULLABLE) ← **NEW**
- `parent_comment_id` (UUID, NULLABLE)
- `body` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

## Testing After Migration

1. Start the dev server: `npm run dev`
2. Log in with GitHub OAuth
3. Navigate to any PR detail page
4. Try posting a comment
5. Verify comment appears with your username and avatar
6. Try replying to the comment
7. Try deleting your comment

All operations should work without errors!
