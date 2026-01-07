# Chrome Extension Claude - Presence System Testing

## Test 3: Browser Close Cleanup (beforeunload)

**Your Task**: Verify presence cleanup works by checking if users disappear from the presence list after closing their browser.

### Alternative Testing Method (Database Verification)

Since the DELETE request happens too fast to catch in Network tab, we'll verify it works by observing the effect.

#### Step-by-Step Instructions

1. **Setup Two Browser Sessions**
   - Browser 1: Your main Chrome profile (logged in as User A)
   - Browser 2: Chrome Incognito or different profile (logged in as User B)
   - Both should navigate to the same PR page

2. **Verify Both Users Appear**
   - In Browser 1, you should see 2 avatars in the presence indicator
   - Note the usernames of both users
   - Example: "alice" (you) and "bob" (other user)

3. **Close Browser 2 Completely**
   - Close the entire window/tab for Browser 2
   - Don't just navigate away - fully close it

4. **Watch Browser 1 Presence Indicator**
   - Within 3 seconds: Browser 2's avatar should disappear (if beforeunload works)
   - Within 30 seconds: Browser 2's avatar MUST disappear (polling cleanup)
   - Time how long it takes for the avatar to disappear

5. **Interpret Results**
   ```
   If avatar disappears in 0-5 seconds:
   ✅ beforeunload cleanup is working perfectly

   If avatar disappears in 5-30 seconds:
   ⚠️ beforeunload might be failing, but polling cleanup saved us

   If avatar is still there after 30 seconds:
   ❌ Both cleanup mechanisms are broken
   ```

6. **Optional: Console Logging Verification**
   - Before closing Browser 2, open its Console (F12)
   - Add a temporary log to see if beforeunload fires:

   ```javascript
   // Paste this in Browser 2's Console
   window.addEventListener('beforeunload', () => {
     console.log('BEFOREUNLOAD FIRED at:', new Date().toISOString());
   });
   ```

   - Try closing the tab
   - If you see the log message flash, beforeunload is firing

7. **Report Findings**
   ```
   Test 3 Results:
   [ ] Both users initially appeared in presence indicator
   [ ] Closed Browser 2 completely
   [ ] Browser 2's avatar disappeared in _____ seconds
   [ ] No errors in Browser 1's Console tab

   Status:
   - 0-5 seconds = EXCELLENT (beforeunload working)
   - 5-30 seconds = GOOD (polling cleanup working)
   - 30+ seconds = FAILED (needs investigation)
   ```

---

## Test 4: Avatar Sorting Stability

**Your Task**: Monitor the presence indicator UI to verify avatars remain in stable alphabetical order during polling.

### Step-by-Step Instructions

1. **Open Console for Logging**
   - Press F12 → Console tab
   - Clear console (trash icon)
   - Keep Console visible alongside the page

2. **Locate Presence Indicator**
   - Look at the top-right of the PR page
   - You should see avatar bubbles showing users viewing the PR
   - Note the usernames (hover over avatars if needed)

3. **Record Initial Order**
   - Write down the order of avatars from left to right
   - Example: "alice, bob, charlie"
   - This should be alphabetical order

4. **Monitor for 60 Seconds**
   - Watch the avatars for 60 seconds straight
   - Polling happens every 3 seconds (you might see subtle re-renders)
   - **Critical**: Avatar positions should NOT change

5. **Check for Shuffling**
   - If avatars switch positions → FAIL (bug still exists)
   - If avatars remain in same positions → PASS (fix works)
   - Example of shuffle: "alice, bob" becomes "bob, alice" after 3 seconds

6. **Verify Alphabetical Order**
   - Confirm the order is alphabetical by username
   - Not by join time, not by user_id, but by username
   - Example: alice → bob → charlie (correct)
   - Example: charlie → alice → bob (incorrect - random order)

7. **Check Console for Errors**
   - Look for any React warnings or errors
   - Look for Supabase query errors
   - No errors = healthy system

8. **Report Findings**
   ```
   Test 4 Results:
   [ ] Avatars appear in alphabetical order
   [ ] Avatars remain stable during 60-second observation
   [ ] No position switching every 3 seconds
   [ ] No console errors or warnings
   Initial Order: [list usernames left to right]
   Final Order (after 60s): [list usernames left to right]
   Match: YES / NO
   ```

---

## Combined Testing Strategy

**Efficient Testing (10 minutes)**:

1. Open DevTools → Network tab + Console tab (split view)
2. Filter Network by "presence"
3. Navigate to PR page
4. Immediately observe Test 4 (avatar order)
5. Let it run for 60 seconds while watching
6. Then refresh page and check Test 3 (DELETE request)

**What I Need From You**:

```markdown
## Test Results Report

### Test 3: beforeunload Cleanup
- DELETE request fires: YES / NO
- Request URL: [paste URL]
- Response status: [paste status code]
- Errors in console: YES / NO (if yes, paste error)

### Test 4: Avatar Sorting
- Initial avatar order: [list usernames]
- Final avatar order (60s later): [list usernames]
- Order remained stable: YES / NO
- Order is alphabetical: YES / NO
- Errors in console: YES / NO (if yes, paste error)

### Screenshots (if needed)
- Network tab showing DELETE request
- Console tab showing any errors
- Presence indicator showing avatars
```

---

## Troubleshooting

### Test 3 Issues

**If no DELETE request appears**:
- Check Console for JavaScript errors preventing beforeunload
- Verify user is authenticated (check for user session)
- Look for any React errors blocking cleanup

**If DELETE request fails (4xx/5xx)**:
- Check RLS policies in Supabase dashboard
- Verify session_id is correct
- Check Console for detailed error message

### Test 4 Issues

**If avatars don't appear**:
- Check if you're logged in (GitHub OAuth)
- Verify PR URL is correct
- Check Console for presence hook errors

**If avatars shuffle**:
- This means the fix in use-presence.ts:144 isn't applied
- Verify `.order('username', { ascending: true })` exists in code
- Check git log to confirm commit was applied

---

## Expected Network Request Pattern

When everything works correctly, you should see this pattern in Network tab:

```
POST   /rest/v1/pr_sessions      (join session)
POST   /rest/v1/presence          (create presence)
GET    /rest/v1/presence          (poll - every 3 seconds)
PATCH  /rest/v1/presence          (heartbeat - every 10 seconds)
GET    /rest/v1/presence          (poll - every 3 seconds)
PATCH  /rest/v1/presence          (heartbeat - every 10 seconds)
... (continues while page is open)
DELETE /rest/v1/presence          (cleanup on page close)
PATCH  /rest/v1/pr_sessions       (mark session inactive)
```

The key is seeing that DELETE request fire when you close/refresh the page.

---

**Ready to Test?**
1. Open Chrome to `http://localhost:3000`
2. Open DevTools (F12)
3. Follow instructions above
4. Report findings back

---

## SIMPLIFIED COPY/PASTE PROMPT FOR CHROME EXTENSION CLAUDE

```markdown
You are testing the presence system for a Next.js app at http://localhost:3000.

**Test 3: Verify cleanup when user leaves**

Since the DELETE request happens too fast to catch, we'll test by observing the effect:

1. Open TWO browser sessions (main Chrome + Incognito, both logged in with different GitHub accounts)
2. Both navigate to the same PR page (e.g., /repositories/facebook/react/pull/28980)
3. Verify you see 2 avatars in the presence indicator (top-right of page)
4. CLOSE the Incognito window completely
5. In the main window, time how long it takes for the second avatar to disappear
6. Report: How many seconds until avatar disappeared?

**Test 4: Verify avatars don't shuffle**

1. With 2 users on the same PR page
2. Note the order of avatars (left to right, by username)
3. Watch for 60 seconds - avatars should NOT change positions
4. Polling happens every 3 seconds, but positions stay stable
5. Report: Did avatars remain in the same positions? YES/NO

**Report back**:
- Test 3: Avatar disappeared after _____ seconds (0-5s = excellent, 5-30s = good, 30+s = failed)
- Test 3: Any Console errors? YES/NO
- Test 4: Initial avatar order: [list usernames left to right]
- Test 4: Avatars remained stable for 60s? YES/NO
- Test 4: Order is alphabetical by username? YES/NO

Include screenshots if anything unexpected happens.
```
