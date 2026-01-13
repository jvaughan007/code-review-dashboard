# Activity Feed - Implementation Plan

## Overview

**Goal**: Show real-time activity on a PR (comments, presence changes, cursor activity)

**Estimated Time**: 3-4 hours

**Polling Architecture**: Uses database polling (no subscription cost)

---

## Requirements

### Functional Requirements

1. **Activity Types to Track**:
   - User joined/left PR (presence changes)
   - Comment posted/deleted
   - User became active (cursor movement detected)
   - User became idle (cursor inactive for 10s)

2. **Feed Behavior**:
   - Show last 20-50 activities
   - Auto-scroll to new activities (or notification badge)
   - Group similar activities (e.g., "3 users joined")
   - Show relative timestamps ("2 minutes ago")
   - Polling interval: 3-5 seconds (same as comments)

3. **UI Requirements**:
   - Sidebar or collapsible panel
   - Avatar + username + action + timestamp
   - Color-coded by activity type
   - Smooth animations for new items

### Non-Functional Requirements

1. **Performance**: <100ms render time for 50 items
2. **Memory**: Limit to last 50 activities (prevent memory leak)
3. **Network**: Efficient polling (only fetch new activities)
4. **UX**: Non-intrusive, doesn't block main UI

---

## Data Model

### Option A: New `activities` Table (RECOMMENDED)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'joined', 'left', 'commented', 'cursor_active', 'cursor_idle'
  metadata JSONB, -- Flexible data (comment_id, cursor_color, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  INDEX idx_activities_pr_created (pr_id, created_at DESC)
);
```

**Pros**:
- Clean separation of concerns
- Easy to query and filter
- Can add activity types without schema changes (use metadata JSONB)
- Efficient pagination

**Cons**:
- New table + migration
- Need to trigger activity creation from multiple places

### Option B: Aggregate Existing Tables (NO MIGRATION)
Query `presence`, `comments`, `cursors` tables and merge results client-side

**Pros**:
- No database changes
- Reuse existing polling infrastructure

**Cons**:
- Complex client-side merging
- Multiple queries = more network overhead
- Harder to get chronological order
- Can't track "left PR" events (presence deleted)

---

## Architecture Questions for Specialists

### Frontend Developer Questions:
1. **UI Pattern**: Sidebar vs floating panel vs bottom sheet?
2. **Grouping**: How to group similar activities (e.g., "3 users joined")?
3. **Animations**: Framer Motion vs CSS transitions for new items?
4. **Infinite scroll**: Virtualized list (react-window) or simple pagination?
5. **Auto-scroll**: Always scroll to new items or only if at bottom?

### Backend Architect Questions:
1. **Data Model**: New `activities` table vs aggregate existing tables?
2. **Polling Strategy**: Incremental fetch (last_seen_id) vs full fetch with limit?
3. **Activity Triggers**: Database triggers vs application-level logging?
4. **Retention**: Keep activities forever or TTL cleanup (e.g., 7 days)?
5. **RLS Policies**: Who can see activities (all users on PR)?

---

## Implementation Phases

### Phase 1: Planning & Consultation (30 min)
- [ ] Consult Frontend Developer for UI/UX design
- [ ] Consult Backend Architect for data model
- [ ] Create detailed implementation plan based on recommendations

### Phase 2: Backend Setup (1 hour)
- [ ] Create migration for `activities` table (if recommended)
- [ ] Set up RLS policies
- [ ] Create helper functions for activity logging
- [ ] Test activity creation manually

### Phase 3: React Components (1.5 hours)
- [ ] Create `activity-store.ts` (Zustand)
- [ ] Create `use-activities.ts` hook (polling)
- [ ] Create `ActivityItem.tsx` component
- [ ] Create `ActivityFeed.tsx` container
- [ ] Create `activity-utils.ts` (formatting, grouping)

### Phase 4: Integration (30 min)
- [ ] Integrate into PR detail page
- [ ] Log activities from existing hooks (presence, comments, cursors)
- [ ] Add activity feed toggle button

### Phase 5: Testing & Polish (30 min)
- [ ] Test with 2+ browser windows
- [ ] Verify polling efficiency
- [ ] Check memory usage (DevTools Performance tab)
- [ ] Add error handling and loading states

---

## Key Decisions Needed

1. **New table vs aggregate?** (Leans toward new table for scalability)
2. **Which activities to track?** (Start minimal: joined, left, commented)
3. **UI placement?** (Right sidebar? Collapsible panel?)
4. **Polling interval?** (3-5 seconds, same as comments)
5. **Activity retention?** (Keep last 50, or TTL cleanup after 7 days?)

---

## Files to Create

1. `supabase/migrations/005_create_activities_table.sql` (if needed)
2. `src/lib/stores/activity-store.ts`
3. `src/lib/hooks/use-activities.ts`
4. `src/components/activity/ActivityItem.tsx`
5. `src/components/activity/ActivityFeed.tsx`
6. `src/lib/utils/activity-utils.ts`

---

## Files to Modify

1. `src/lib/hooks/use-presence.ts` - Log join/leave activities
2. `src/lib/hooks/use-comments.ts` - Log comment activities
3. `src/app/repositories/[owner]/[repo]/pull/[number]/page.tsx` - Add ActivityFeed component

---

## Success Metrics

- [ ] Activity feed shows real-time updates (<5s latency)
- [ ] 50+ activities render without jank
- [ ] Memory stable (no leaks over 5 minutes)
- [ ] Works in 2+ browser windows
- [ ] UI is non-intrusive and helpful

---

## Next Steps

**Immediate**: Consult Frontend Developer + Backend Architect for design recommendations

**Copy/paste ready prompts** below:

### Frontend Developer Consultation
```
Consult the Frontend Developer specialist.

Context: We're implementing a real-time Activity Feed for PR reviews that shows:
- Users joining/leaving
- Comments posted
- Cursor activity

Questions:
1. UI Pattern: Right sidebar vs floating panel vs bottom drawer?
2. Activity Grouping: How to group "User A, User B, User C joined" efficiently?
3. Animation: Framer Motion stagger vs CSS transitions for new items?
4. Scroll Behavior: Auto-scroll always vs only when at bottom?
5. List Virtualization: Need react-window for 50 items or simple map()?

Constraints:
- React 19.2.0, Next.js 16.1.1
- Must integrate with existing PR detail page
- Polling architecture (3-5s interval)
- Mobile-responsive

Reference:
- Existing patterns: use-presence.ts (polling), use-comments.ts (optimistic updates)
- UI library: shadcn/ui components
```

### Backend Architect Consultation
```
Consult the Backend Architect specialist.

Context: Implementing Activity Feed for PR collaboration using database polling

Questions:
1. Data Model: New `activities` table vs aggregate existing tables (presence, comments, cursors)?
2. Polling Strategy: Incremental fetch (WHERE created_at > last_seen) vs full fetch LIMIT 50?
3. Activity Triggers: Database triggers vs app-level logging in hooks?
4. Retention: Keep activities forever vs TTL cleanup (7 days)?
5. RLS Policies: All PR viewers see all activities or filter by user permissions?

Constraints:
- Supabase free tier (500MB database, 500k requests/month)
- Existing tables: pr_sessions, presence, cursors, comments
- Polling architecture (no Realtime subscription)
- Must be efficient (minimize database reads)

Reference:
- Existing pattern: use-presence.ts (polling with timestamp filtering)
- Current RLS policies: User can see all PR data if they have access to PR
```

---

**Status**: Ready for specialist consultation
