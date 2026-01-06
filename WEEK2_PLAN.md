# Week 2 Plan: Real-Time Collaboration Features

**Duration**: Week 2 (Jan 6-12, 2026)
**Goal**: Add live collaboration features that differentiate this from basic PR viewers
**Time Budget**: 20-25 hours

---

## 🎯 Week 2 Objectives

Transform the Code Review Dashboard from a **GitHub PR viewer** into a **real-time collaborative tool** where teams can review code together simultaneously.

### Core Features to Build:

1. **Presence System** - See who's online and viewing each PR
2. **Live Cursors** - See where teammates are in the code in real-time
3. **Real-Time Comments** - Synchronized comment threads on code lines
4. **Optimistic UI** - Instant feedback for all interactions
5. **Performance** - Maintain <100ms latency for real-time updates

---

## 📋 Week 2 Tasks Breakdown

### Day 1-2: Supabase Realtime Foundation (6-8 hours)

**Database Schema**:
- [ ] Create `pr_sessions` table (track active PR viewing sessions)
- [ ] Create `presence` table (who's online, viewing which PR)
- [ ] Create `comments` table (PR line comments with real-time sync)
- [ ] Create `cursors` table (live cursor positions)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database indexes for performance

**Supabase Realtime Setup**:
- [ ] Enable Realtime on tables
- [ ] Create Realtime subscriptions
- [ ] Test presence broadcasting
- [ ] Test cursor position updates

**Deliverable**: Database schema deployed, Realtime working in dev

---

### Day 3: Presence System (4-6 hours)

**Features**:
- [ ] Show "X people viewing this PR" indicator
- [ ] Display avatars of active viewers
- [ ] Real-time join/leave notifications
- [ ] Heartbeat system (detect disconnects)

**Components**:
- [ ] `PresenceIndicator` component (avatar badges)
- [ ] `ViewersList` component (sidebar with all viewers)
- [ ] `PresenceProvider` context (manages presence state)

**Deliverable**: See who's online viewing each PR in real-time

---

### Day 4: Live Cursors (5-7 hours)

**Features**:
- [ ] Track mouse position on code diffs
- [ ] Broadcast cursor positions to other viewers
- [ ] Display teammate cursors with names/colors
- [ ] Smooth cursor animations (no jank)
- [ ] Cursor disappears after 3s of inactivity

**Components**:
- [ ] `LiveCursor` component (renders teammate cursors)
- [ ] `CursorTracker` hook (tracks and broadcasts position)
- [ ] Cursor color assignment system (unique per user)

**Technical Challenges**:
- Throttle cursor updates (max 60fps = ~16ms intervals)
- Coordinate translation (relative to code container)
- Handle scrolling/viewport changes

**Deliverable**: See teammate cursors moving in real-time

---

### Day 5: Real-Time Comments (6-8 hours)

**Features**:
- [ ] Add inline comments on code lines
- [ ] Real-time comment sync across viewers
- [ ] Optimistic UI (comment appears instantly)
- [ ] Edit/delete comments
- [ ] Comment threads (replies)
- [ ] @mentions with autocomplete

**Components**:
- [ ] `CommentThread` component
- [ ] `CommentForm` component with optimistic updates
- [ ] `CommentLine` indicator (shows comment count)
- [ ] `CommentsProvider` context

**Database**:
```sql
comments table:
- id (uuid)
- pr_id (text) - "owner/repo/number"
- file_path (text)
- line_number (int)
- user_id (uuid)
- content (text)
- created_at (timestamp)
- updated_at (timestamp)
- parent_id (uuid, nullable) - for threaded replies
```

**Deliverable**: Leave comments that sync in real-time to all viewers

---

### Day 6: Optimistic UI & State Management (4-5 hours)

**Setup Zustand for Real-Time State**:
- [ ] Install `zustand` for client state
- [ ] Create `usePresenceStore` (online users)
- [ ] Create `useCursorsStore` (live cursor positions)
- [ ] Create `useCommentsStore` (comments with optimistic updates)

**Optimistic UI Patterns**:
- [ ] Comment immediately appears (before server confirms)
- [ ] Rollback on error (show error toast)
- [ ] Loading states for sync operations
- [ ] Conflict resolution (if two users comment simultaneously)

**Deliverable**: Instant UI feedback, feels responsive even on slow connections

---

### Day 7: Performance Optimization & Testing (4-5 hours)

**Performance Targets**:
- [ ] Cursor update latency: <100ms
- [ ] Comment sync latency: <200ms
- [ ] Presence update latency: <500ms
- [ ] No UI jank during real-time updates (60fps maintained)

**Optimizations**:
- [ ] Throttle cursor broadcasts (16ms intervals max)
- [ ] Debounce comment typing (300ms)
- [ ] Virtual scrolling for long comment threads
- [ ] Memoize expensive renders
- [ ] Use `React.memo` for cursor components

**Load Testing**:
- [ ] Test with 5 concurrent viewers
- [ ] Test with 10 concurrent viewers
- [ ] Measure WebSocket message throughput
- [ ] Profile React renders (Chrome DevTools)

**Deliverable**: Performance benchmarks documented, <100ms latency achieved

---

## 📊 Success Criteria

**Must-Have (MVP)**:
- ✅ Presence system working (see who's online)
- ✅ Live cursors functional (see where teammates are)
- ✅ Real-time comments syncing
- ✅ <100ms cursor latency
- ✅ No UI blocking during real-time updates

**Nice-to-Have (Stretch)**:
- Code line highlighting when teammate hovers
- Cursor labels showing user's current action ("Reviewing line 42")
- Notification system ("Josh commented on line 15")
- Comment reactions (emoji responses)

**Deferred to Week 3**:
- Dark mode
- Accessibility audit
- E2E tests
- Documentation

---

## 🛠️ Tech Stack (Week 2 Additions)

**New Dependencies**:
```json
{
  "zustand": "^4.5.0",           // Client state management
  "@supabase/realtime-js": "*",  // WebSocket real-time (included in supabase-js)
  "framer-motion": "^11.0.0"     // Smooth cursor animations
}
```

**Database (Supabase)**:
- PostgreSQL tables for presence, cursors, comments
- Realtime subscriptions via WebSocket
- Row Level Security for data access control

**Architecture**:
```
Client (Browser)
  ↓ WebSocket
Supabase Realtime
  ↓ Database triggers
PostgreSQL
  ↓ Broadcasts
All Connected Clients (real-time sync)
```

---

## 🎨 UI/UX Considerations

**Presence Indicator** (top-right of PR page):
```
👤 3 people viewing
  ├─ You
  ├─ @sarah (viewing line 42)
  └─ @mike (adding comment)
```

**Live Cursors**:
- Colored pointer with name label
- Smooth lerp animation (not jerky)
- Fades out after 3s inactivity
- Different color per user (hash username → color)

**Comments**:
- Inline on code lines (like GitHub)
- Real-time badge: "✨ Live" when others are typing
- Optimistic updates (instant feedback)
- Toast notification when new comment arrives

---

## ⚠️ Risks & Mitigation

**Risk 1: WebSocket Connection Instability**
- **Mitigation**: Automatic reconnection logic, connection status indicator

**Risk 2: Too Many Cursor Updates = Performance Degradation**
- **Mitigation**: Throttle to 60fps (16ms), spatial throttling (only update if moved >5px)

**Risk 3: Can't Find Beta Testers**
- **Mitigation**: Test with 2-3 browser windows yourself, document performance with load testing

**Risk 4: Realtime Latency >100ms**
- **Mitigation**: Use Supabase region closest to you, optimize payload size, implement debouncing

---

## 📈 Week 2 Deliverables

**By End of Week 2**:
1. ✅ Presence system (see who's viewing)
2. ✅ Live cursors (see where teammates are)
3. ✅ Real-time comments
4. ✅ Optimistic UI
5. ✅ Performance benchmarks (<100ms latency)
6. ✅ Git commits (daily, ~15-20 commits for the week)

**Demo-able Features**:
- Open PR in 2 browser windows
- See presence update in real-time
- Move cursor in one window, see it in the other
- Add comment in one window, appears instantly in the other

---

## 🚀 Next Steps After Week 2

**Week 3**: Polish & Optimization
- Dark mode
- Accessibility (WCAG 2.1 AA)
- E2E tests
- Lighthouse optimization (95+)

**Week 4**: Documentation & User Testing
- Architecture docs
- ADRs (why Supabase Realtime vs custom WebSocket)
- Get 10+ beta testers
- Performance benchmark documentation

---

**Status**: 📅 Ready to Begin
**Start Date**: 2026-01-06
**Estimated Completion**: 2026-01-12
