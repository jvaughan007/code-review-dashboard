# RLS Policy Fix - Deployment Checklist

Use this checklist to safely deploy the RLS policy fix to production.

---

## Pre-Deployment

### 1. Backup Current State

- [ ] **Backup current RLS policies** (for rollback)
  ```sql
  -- Run in Supabase SQL Editor, save output
  SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    pg_get_expr(qual, 0::oid) as using_clause,
    pg_get_expr(with_check, 0::oid) as with_check_clause
  FROM pg_policies
  WHERE tablename = 'pr_sessions'
  ORDER BY policyname;
  ```

- [ ] **Backup current data** (optional, for peace of mind)
  ```sql
  -- Count current sessions
  SELECT COUNT(*) FROM pr_sessions;

  -- Export to CSV (Supabase Dashboard → Table Editor → Export)
  ```

- [ ] **Document current error state**
  - [ ] Screenshot of error in browser console
  - [ ] Copy error message from logs
  - [ ] Note affected user count (if any)

---

## Deployment Steps

### 2. Apply Migration

**Option A: Via Supabase CLI (Recommended)**

- [ ] Open terminal in project directory
  ```bash
  cd /Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard
  ```

- [ ] Verify migration file exists
  ```bash
  ls -la supabase/migrations/002_fix_rls_upsert_policies.sql
  ```

- [ ] Push migration to Supabase
  ```bash
  npx supabase db push
  ```

- [ ] Confirm success message
  ```
  ✅ Migration 002 applied successfully
  ```

**Option B: Via Supabase Dashboard (Manual)**

- [ ] Login to Supabase Dashboard: https://app.supabase.com
- [ ] Select your project
- [ ] Navigate to: SQL Editor (left sidebar)
- [ ] Click "New query"
- [ ] Open local file: `supabase/migrations/002_fix_rls_upsert_policies.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or press Cmd/Ctrl + Enter)
- [ ] Verify success message: "Success. No rows returned"

---

### 3. Verify Policies Created

- [ ] **Check policies exist**
  ```sql
  -- Run in SQL Editor
  SELECT
    policyname,
    cmd,
    roles
  FROM pg_policies
  WHERE tablename = 'pr_sessions'
  ORDER BY policyname;
  ```

- [ ] **Expected output**: 3 rows (or 1 if using ALL policy)
  - `Users can view active sessions and own sessions` - SELECT - {authenticated}
  - `Users can insert their own sessions` - INSERT - {authenticated}
  - `Users can update their own sessions` - UPDATE - {authenticated}

- [ ] **Verify old policies are gone**
  - Should NOT see: `Users can view all active sessions` (old policy)

---

### 4. Run SQL Verification Tests

- [ ] **Copy test script**
  - Open: `/scripts/verify-rls-policies.sql`
  - Copy all contents

- [ ] **Run in SQL Editor** (must be logged in as authenticated user!)
  - Paste into new query
  - Click "Run"

- [ ] **Verify all tests pass**
  - [ ] ✅ Authentication Check (user_id not null)
  - [ ] ✅ Policy Check (3 policies exist)
  - [ ] ✅ INSERT works
  - [ ] ✅ UPSERT (INSERT path) works
  - [ ] ✅ UPSERT (UPDATE path) works
  - [ ] ✅ No duplicate rows created
  - [ ] ✅ SELECT own sessions works
  - [ ] ✅ UPDATE own sessions works
  - [ ] ✅ Security - cannot update others' sessions
  - [ ] ✅ WITH CHECK prevents user_id changes
  - [ ] ✅ Final summary shows "ALL TESTS PASSED"

- [ ] **If any test fails**:
  - STOP deployment
  - Review error in `/docs/RLS_UPSERT_TROUBLESHOOTING.md`
  - Fix issue
  - Re-run tests

---

### 5. Test in Browser (Staging/Dev)

- [ ] **Open your Next.js app** (local dev or staging)
  ```bash
  npm run dev
  # OR visit staging URL
  ```

- [ ] **Login with GitHub OAuth**
  - Verify authentication succeeds

- [ ] **Open DevTools Console** (F12)

- [ ] **Run browser test script**
  - Copy contents of `/scripts/test-rls-browser.js`
  - Paste into console
  - Press Enter

- [ ] **Verify all tests pass**
  - [ ] ✅ Authentication
  - [ ] ✅ Cleanup
  - [ ] ✅ Basic INSERT
  - [ ] ✅ UPSERT (INSERT path)
  - [ ] ✅ UPSERT (UPDATE path)
  - [ ] ✅ No duplicate rows
  - [ ] ✅ SELECT own sessions
  - [ ] ✅ UPDATE own session
  - [ ] ✅ Security - cannot update others
  - [ ] ✅ Integration test
  - [ ] 🎉 **"ALL TESTS PASSED!"**

- [ ] **If tests fail**:
  - Check network tab for error details
  - Review `/docs/RLS_UPSERT_TROUBLESHOOTING.md`
  - Verify migration was applied correctly
  - DO NOT proceed to production

---

### 6. Test Real Usage (Dev Environment)

- [ ] **Visit a PR page**
  - Example: `/repositories/owner/repo/pull/123`

- [ ] **Check console for errors**
  - Should NOT see: "Error creating session: {}"
  - Should NOT see: Code 42501
  - Should see: "Session created successfully" (or similar)

- [ ] **Verify presence data loads**
  - Check Zustand store (React DevTools)
  - Should see presence array populated

- [ ] **Test heartbeat**
  - Wait 10 seconds
  - Check network tab for presence updates
  - Should see successful `last_heartbeat` updates

- [ ] **Test multi-user (if possible)**
  - Open PR in incognito window
  - Login as different user
  - Both users should see each other's presence

---

## Production Deployment

### 7. Deploy to Production Database

**WARNING**: Only proceed if ALL tests passed above!

- [ ] **Verify production database selected**
  - Check Supabase Dashboard → Project dropdown
  - Confirm correct project name

- [ ] **Apply migration to production**
  - Repeat Step 2 (but for production project)
  - OR use Supabase CLI with production connection

- [ ] **Verify policies created**
  - Repeat Step 3 (in production SQL Editor)

---

### 8. Monitor Production

- [ ] **Enable real-time monitoring**
  - Open: Supabase Dashboard → Logs
  - Filter: "Error" level
  - Keep this open for 5-10 minutes

- [ ] **Deploy frontend** (if needed)
  - If no frontend changes: Skip
  - If updated client code: Deploy via Vercel/etc.

- [ ] **Test with real account**
  - Login to production app
  - Visit any PR page
  - Check console for errors
  - Verify presence system works

- [ ] **Monitor for 5-10 minutes**
  - Check Supabase Logs for RLS errors
  - Check application logs (Vercel, etc.)
  - Watch for user reports (Discord, Slack, etc.)

---

### 9. Smoke Test Production

- [ ] **Test as different users** (if possible)
  - Login with 2-3 different GitHub accounts
  - Verify presence data shows correctly
  - Verify no RLS errors in console

- [ ] **Check database**
  ```sql
  -- Run in production SQL Editor
  SELECT
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN is_active THEN 1 END) as active_sessions
  FROM pr_sessions
  WHERE created_at > NOW() - INTERVAL '1 hour';
  ```

- [ ] **Verify expected behavior**
  - Sessions are being created
  - No duplicate sessions per (pr_id, user_id)
  - Active sessions have recent `last_seen_at`

---

## Post-Deployment

### 10. Document Changes

- [ ] **Update changelog** (if you have one)
  ```markdown
  ## [Version] - 2026-01-06
  ### Fixed
  - Fixed RLS policy preventing presence system from working
  - Added UPSERT-compatible policies for pr_sessions
  - Added security WITH CHECK clauses to prevent privilege escalation
  ```

- [ ] **Update team** (Slack, Discord, etc.)
  ```
  ✅ Deployed RLS policy fix for presence system
  - Fixed error 42501 blocking session creation
  - All tests passing
  - Production monitored for 10 minutes - no issues
  ```

- [ ] **Create incident postmortem** (optional but recommended)
  - What happened?
  - Why did it happen?
  - How did we fix it?
  - How do we prevent it?

---

### 11. Clean Up

- [ ] **Remove test data from production**
  ```sql
  -- Only if test data was created in production
  DELETE FROM pr_sessions WHERE pr_id LIKE 'test/%';
  ```

- [ ] **Archive old policies** (already done in migration)

- [ ] **Update documentation**
  - Mark issue as resolved in project tracking
  - Update RLS documentation if needed

---

## Rollback Plan (Emergency)

If critical issues arise:

### 12. Emergency Rollback

- [ ] **Revert to old policies**
  ```sql
  -- Drop new policies
  DROP POLICY IF EXISTS "Users can view active sessions and own sessions" ON pr_sessions;
  DROP POLICY IF EXISTS "Users can insert their own sessions" ON pr_sessions;
  DROP POLICY IF EXISTS "Users can update their own sessions" ON pr_sessions;

  -- Restore old policies (will still have UPSERT issue!)
  CREATE POLICY "Users can view all active sessions"
    ON pr_sessions FOR SELECT
    USING (is_active = true);

  CREATE POLICY "Users can insert their own sessions"
    ON pr_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own sessions"
    ON pr_sessions FOR UPDATE
    USING (auth.uid() = user_id);
  ```

- [ ] **Disable presence feature** (temporary)
  - Comment out `usePresence()` hook in components
  - Deploy frontend without presence
  - Investigate root cause

- [ ] **Notify users**
  - Post status update
  - Explain presence is temporarily disabled
  - Provide ETA for fix

---

## Success Criteria

All of the following must be true:

- ✅ Migration 002 applied successfully
- ✅ 3 new policies created (or 1 ALL policy)
- ✅ Old policies removed
- ✅ SQL verification tests pass (all 13)
- ✅ Browser tests pass (all 10)
- ✅ Real usage works in dev
- ✅ Production deployment successful
- ✅ Production tests pass
- ✅ No RLS errors in production logs (10+ minutes)
- ✅ Users can see each other's presence
- ✅ No performance degradation

---

## Timeline Estimate

| Phase | Duration | Total |
|-------|----------|-------|
| Pre-deployment (Steps 1) | 5 min | 5 min |
| Deployment (Steps 2-6) | 15 min | 20 min |
| Production (Steps 7-9) | 10 min | 30 min |
| Post-deployment (Steps 10-11) | 5 min | 35 min |

**Total estimated time**: 35 minutes

---

## Contact / Escalation

If you encounter issues:

1. **Check troubleshooting guide**: `/docs/RLS_UPSERT_TROUBLESHOOTING.md`
2. **Review migration**: `/supabase/migrations/002_fix_rls_upsert_policies.sql`
3. **Check Supabase docs**: https://supabase.com/docs/guides/database/postgres/row-level-security
4. **Supabase support**: https://supabase.com/dashboard/support

---

**Checklist Status**: [ ] Not Started | [ ] In Progress | [ ] Complete | [ ] Rolled Back

**Deployed By**: _________________

**Deployment Date**: _________________

**Production Verified**: [ ] Yes [ ] No

**Issues Encountered**: _________________
