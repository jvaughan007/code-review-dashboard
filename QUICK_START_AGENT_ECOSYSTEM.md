# Quick Start: Agent Ecosystem Setup

**Time**: 3-4 hours | **Outcome**: Complete agent ecosystem with mandatory consultation workflow

---

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: AUDIT (30 min)                                     │
│ ┌─────────────────┐    ┌─────────────────┐                 │
│ │ Existing Agents │───▶│ Quality Report  │                 │
│ │ - Frontend      │    │ - Pass/Fail     │                 │
│ │ - Backend       │    │ - Gaps          │                 │
│ │ - Database      │    │ - Actions       │                 │
│ └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: GENERATE SPECIALISTS (90 min)                      │
│                                                              │
│ Tier 1 (CRITICAL):                                          │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ React 19     │  │ Next.js 16   │  │ GitHub API   │      │
│ │ 30 min       │  │ 30 min       │  │ 20 min       │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ TypeScript   │  │ Supabase     │  │ Tailwind CSS │      │
│ │ 5.9 - 20 min │  │ Realtime 15m │  │ 4 - 15 min   │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: WORKFLOW ENFORCEMENT (30 min)                      │
│                                                              │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ CLAUDE.md    │  │ Templates    │  │ SESSION_     │      │
│ │ Consultation │──│ Planning     │──│ TRACKER.md   │      │
│ │ Policy       │  │ Implementation│  │ Reminder     │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: COLLABORATION GUIDE (20 min)                       │
│                                                              │
│ Common Scenarios:                                           │
│ • New React Component ───▶ Consultation Order              │
│ • GitHub API Endpoint ───▶ Handoff Files                   │
│ • Realtime Feature    ───▶ Integration Steps               │
│ • Database Changes    ───▶ Common Pitfalls                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: TEST WORKFLOW (30 min)                             │
│                                                              │
│ Live Cursors Feature:                                       │
│ Planning ───▶ Consultation ───▶ Implementation ───▶ Review │
│                                                              │
│ Validates: Workflow practical? Value added? Friction?       │
└─────────────────────────────────────────────────────────────┘
```

---

## The 3 Documents You Need

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **AGENT_ECOSYSTEM_STRATEGY.md** | Master plan, templates, mapping | Reference throughout |
| **AGENT_GENERATION_PROMPTS.md** | Copy-paste prompts for execution | During execution |
| **AGENT_ECOSYSTEM_SUMMARY.md** | Quick reference, FAQ, decisions | When stuck/confused |

---

## Copy-Paste Quick Start

### Option A: Audit First (Recommended)

**Step 1**: Copy this into Claude Code
```
I need you to audit the existing Frontend Developer agent against our quality standards.

Agent Location: ~/.claude/agents/engineering/engineering-frontend-developer.md

Quality Criteria:
1. ✅ References official documentation with URLs
2. ✅ Cites best literature (books, experts with attribution)
3. ✅ Grounded in latest versions (React 19, Next.js 15+)
4. ✅ No deprecated patterns or hallucinated features
5. ✅ Includes code examples matching official docs
6. ✅ Specifies when to consult other agents

Deliverable: Create audit report file:
- Filename: audit_reports/frontend_developer_audit.md
- Format:
  - Overall Score: PASS / NEEDS IMPROVEMENT / FAIL
  - Criteria Checklist (✅ / ⚠️ / ❌ for each)
  - Strengths (what it does well)
  - Gaps (what's missing or outdated)
  - Recommendations (specific improvements)
  - Action Items (if any)

Read the agent file and provide detailed audit report.
```

**Step 2**: Review audit results, then proceed to Phase 2

### Option B: Generate Critical Agent (Faster)

**Step 1**: Copy this into Claude Code
```
Generate a new specialist agent for React 19 using the Agent Generation Template.

Specialist: React 19 Expert
Focus: Server Components, use() hook, React Compiler, Actions, useActionState
Primary Use Case: code-review-dashboard (Next.js 16 + React 19 project)

Requirements:
1. Official Documentation: https://react.dev
   - Reference Server Components docs
   - Reference use() hook docs
   - Reference React Compiler docs
   - Reference Actions/useActionState docs

2. Books & Resources:
   - "Learning React" by Eve Porcello & Alex Banks (O'Reilly)
   - React.dev official guides
   - Dan Abramov's blog posts on Server Components

3. Experts:
   - Dan Abramov (@dan_abramov) - React core team
   - Andrew Clark (@acdlite) - React core team
   - Sebastian Markbåge (@sebmarkbage) - React creator

4. Code Examples: Include patterns for:
   - Server Component vs Client Component decision
   - Async Server Components with data fetching
   - use() hook for unwrapping promises
   - Server Actions with useActionState
   - React Compiler optimization (automatic memo)

5. Collaboration:
   - Works with: Next.js 16 Specialist, TypeScript Specialist, Frontend Developer
   - Consult before: Component architecture decisions, state management choices

Deliverable: Create file ~/.claude/agents/engineering/react-19-specialist.md

Use the Agent Generation Template from AGENT_ECOSYSTEM_STRATEGY.md as the structure.
Ground ALL recommendations in official React 19 documentation.
Include version-specific callouts (e.g., "In React 19, not 18...").
```

**Step 2**: Review agent, then generate Next.js 16 Specialist

---

## Technology → Agent Mapping (Quick Reference)

| Working on... | Consult... | Why |
|---------------|------------|-----|
| React component | React 19 Specialist | Server vs Client decision, hooks, patterns |
| Next.js route/layout | Next.js 16 Specialist | App Router, Server Actions, caching |
| TypeScript types | TypeScript 5.9 Specialist | Type safety, generics, inference |
| Tailwind styling | Tailwind CSS 4 Specialist | Utility patterns, responsive design |
| Zustand state | Zustand 5 Specialist | State management patterns |
| Animations | Framer Motion Specialist | Animation best practices |
| Database query | Supabase Specialist | SQL, RLS policies, performance |
| Realtime feature | Supabase Realtime Specialist | Presence, broadcast, PostgreSQL changes |
| GitHub API call | GitHub API Specialist | Rate limiting, pagination, webhooks |
| General frontend | Frontend Developer | Integration, best practices |

---

## Execution Checklist (Print This)

```
PHASE 1: AUDIT (30 min)
□ Audit Frontend Developer (Prompt 1A)
□ Audit Backend/Database agents (Prompt 1B)
□ Review audit reports
□ Decide on improvements

PHASE 2: GENERATE SPECIALISTS (90 min)
□ React 19 Specialist (30 min)
□ Next.js 16 Specialist (30 min)
□ GitHub API Specialist (20 min)
□ TypeScript 5.9 Specialist (20 min)
□ Supabase Realtime Specialist (15 min)
□ Tailwind CSS 4 Specialist (15 min)

PHASE 3: WORKFLOW ENFORCEMENT (30 min)
□ Create CLAUDE.md with policy (15 min)
□ Create templates (10 min)
□ Update SESSION_TRACKER.md (5 min)

PHASE 4: COLLABORATION GUIDE (20 min)
□ Create AGENT_COLLABORATION_PATTERNS.md

PHASE 5: TEST WORKFLOW (30 min)
□ Planning phase test (15 min)
□ Implementation phase test (15 min)
□ Review and refine

POST-IMPLEMENTATION
□ Archive irrelevant agents
□ Update mapping table
□ Create update schedule
```

---

## Common Mistakes to Avoid

❌ **Generating agents without grounding in official docs**
✅ Every agent MUST cite official documentation URLs

❌ **Skipping the test phase (Phase 5)**
✅ Test validates workflow before enforcing it

❌ **Creating too many agents at once**
✅ Start with Tier 1 (6 critical specialists), add others as needed

❌ **Not enforcing consultation workflow**
✅ Update CLAUDE.md and SESSION_TRACKER.md prominently

❌ **Letting agents become outdated**
✅ Include version numbers, create update schedule

---

## Success Indicators

**After 4 hours, you should have:**

✅ **6 new specialist agents** (React 19, Next.js 16, GitHub API, TypeScript 5.9, Supabase Realtime, Tailwind CSS 4)
✅ **CLAUDE.md** with mandatory consultation policy
✅ **Workflow templates** for planning and implementation
✅ **Collaboration patterns** guide for common scenarios
✅ **Test results** from live cursors feature implementation
✅ **Technology mapping** table complete and accurate

**Quality checks:**
- All new agents cite official documentation
- All new agents specify exact versions
- All new agents include collaboration section
- Workflow test identified value (not just overhead)

---

## Troubleshooting

### Issue: Agents are giving conflicting advice
**Solution**: Add "collaboration" section to each agent specifying when to defer to other specialists

### Issue: Consultation workflow feels too slow
**Solution**:
- Create "fast path" exemptions for trivial changes
- Time-box consultations (15 min max per specialist)
- Use templates to speed up planning

### Issue: Can't find the right agent for a task
**Solution**: Reference AGENT_COLLABORATION_PATTERNS.md for common scenarios

### Issue: Agent recommendations seem outdated
**Solution**:
- Check agent version number in frontmatter
- Verify official docs URLs are current
- Update agent with latest patterns

---

## Next Steps After Completion

**Week 1**:
- Use workflow for next feature
- Document friction points
- Refine templates

**Month 1**:
- Review 2-3 agents for quality
- Update version numbers
- Add Tier 3 specialists as needed

**Quarterly**:
- Full agent audit
- Update documentation references
- Measure impact on code quality

---

## Get Help

**Stuck?** Reference these sections:

- **"Which agent do I need?"** → Technology Mapping table (above)
- **"How do agents collaborate?"** → AGENT_COLLABORATION_PATTERNS.md
- **"Is this worth the time?"** → AGENT_ECOSYSTEM_SUMMARY.md FAQ
- **"What's the exact prompt?"** → AGENT_GENERATION_PROMPTS.md

**Still stuck?** Ask Decision Council for strategic guidance

---

## Ready to Start?

**Recommended First Step**:
Copy Prompt 1A from AGENT_GENERATION_PROMPTS.md and paste into Claude Code

**Time Commitment**:
- **Today**: 2 hours (Phases 1-2)
- **Tomorrow**: 1 hour (Phases 3-4)
- **Day 3**: 30 min (Phase 5 test)

**Expected Outcome**:
Professional-grade agent ecosystem that enforces SME consultation for all code-review-dashboard work

---

**LET'S GO!** Open AGENT_GENERATION_PROMPTS.md and start with Prompt 1A.
