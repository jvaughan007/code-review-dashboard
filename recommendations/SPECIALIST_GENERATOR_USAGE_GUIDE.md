# Specialist Generator Usage Guide

**Version**: 1.0.0
**Created**: 2026-01-07
**Purpose**: Step-by-step guide for using Specialist Generator to create high-quality agents in 10-15 minutes

---

## Quick Start (5 Minutes)

### What You'll Need
1. Technology name (e.g., "React 19", "Supabase", "TypeScript 5.9")
2. Official documentation URL (e.g., "https://react.dev")
3. Version number (e.g., "19.0.0")
4. (Optional) Project context (e.g., "code-review-dashboard uses React Server Components")

### 3-Step Process
1. Open `SPECIALIST_GENERATOR_TEMPLATE.md`
2. Copy the prompt template and fill in 4 variables
3. Paste into Claude Code and wait 10-15 minutes

---

## Detailed Usage Guide

### Step 1: Prepare Your Inputs

Before starting, gather the required information:

#### Required Inputs

**Technology Name**:
- What technology do you need a specialist for?
- Examples: "React 19", "Next.js 15", "Supabase", "TypeScript 5.9", "Tailwind CSS", "Prisma"

**Official Documentation URL**:
- Where is the official documentation hosted?
- Must be the canonical/official source (not Medium, blogs, etc.)
- Examples:
  - React: https://react.dev
  - Next.js: https://nextjs.org/docs
  - Supabase: https://supabase.com/docs
  - TypeScript: https://www.typescriptlang.org/docs/

**Version Number**:
- What specific version do you need?
- Be exact (e.g., "19.0.0" not "19" or "latest")
- Find version in official docs or package.json

**Project Context** (Optional but Recommended):
- How will you use this technology in your project?
- Examples:
  - "code-review-dashboard uses React Server Components and Next.js 15 App Router"
  - "Building real-time collaboration with Supabase Realtime and RLS policies"
  - "TypeScript strict mode with Zod for runtime validation"

---

### Step 2: Fill in the Template

Open `/Users/joshcodesirl/projects/AIclaudecode/vibecoding/portfolio/code-review-dashboard/recommendations/SPECIALIST_GENERATOR_TEMPLATE.md`

Find the section titled **"SPECIALIST GENERATOR PROMPT"** and copy everything from:
```
You are the Specialist Generator meta-agent...
```

To the end of that section.

Replace these 4 placeholders:

```
**Technology Name**: {TECHNOLOGY}           → React 19
**Official Documentation URL**: {DOCS_URL}  → https://react.dev
**Version Number**: {VERSION}               → 19.0.0
**Project Context**: {PROJECT_CONTEXT}      → code-review-dashboard uses React Server Components
```

---

### Step 3: Run the Generator

1. Open Claude Code
2. Paste the filled-in template
3. Press Enter
4. Wait 10-15 minutes (sometimes up to 24 minutes for complex technologies)

You'll see progress updates:
```
Phase 1: Documentation Research (3-5 min)
    Fetching official documentation...
    Extracting version-specific features...
    Recording citation URLs...
    ✅ Phase 1 complete

Phase 2: Expert/Literature Discovery (2-3 min)
    Searching for authoritative books...
    Searching for expert resources...
    Cross-referencing with official recommendations...
    ✅ Phase 2 complete

Phase 3: Agent Synthesis (3-5 min)
    Generating agent metadata...
    Generating core mission...
    Generating code examples...
    ✅ Phase 3 complete

Phase 4: Quality Validation (1-2 min)
    Validating grounding: 2/2
    Validating expertise: 2/2
    Validating examples: 2/2
    Validating collaboration: 2/2
    Validating freshness: 2/2
    Total Score: 10/10
    ✅ Phase 4 complete - PASSED

Phase 5: Output Generation (1 min)
    Writing specialist to ~/.claude/agents/engineering/react-19-specialist.md
    ✅ Generation complete
```

---

### Step 4: Review the Output

Claude Code will show you a summary:

```markdown
# ✅ Specialist Generated Successfully

**Technology**: React 19
**Output File**: `~/.claude/agents/engineering/react-19-specialist.md`
**Quality Score**: 10/10
**Generation Time**: 12 minutes
**Status**: PASS

## Validation Results

- ✅ Grounding: 2/2 (5 official doc URLs cited)
- ✅ Expertise: 2/2 (3 authoritative books referenced)
- ✅ Examples: 2/2 (4 version-specific code examples)
- ✅ Collaboration: 2/2 (5 specialist consultation scenarios)
- ✅ Freshness: 2/2 (All content React 19-specific)

## Next Steps

1. Review specialist file at path above
2. Test by invoking: `@react-19-specialist` in Claude Code
3. If quality issues found, provide feedback for improvement
```

---

### Step 5: Test Your New Specialist

Open a new Claude Code chat and invoke your specialist:

```
@react-19-specialist I'm building a new feature with Server Components.
How should I structure my code to follow React 19 best practices?
```

The specialist should:
- Cite official React 19 documentation with URLs
- Provide version-specific code examples (Server Components, use() hook, etc.)
- Explain when to use Server vs Client Components
- Reference authoritative books/resources
- Give practical, actionable advice

---

## Example Walkthroughs

### Example 1: Generate React 19 Specialist

**Scenario**: You're building a Next.js 15 app and need a React 19 specialist for Server Components guidance.

**Step 1 - Gather Inputs**:
```
Technology: React 19
Documentation URL: https://react.dev
Version: 19.0.0
Context: code-review-dashboard uses React Server Components and Next.js 15 App Router
```

**Step 2 - Fill Template**:
Open `SPECIALIST_GENERATOR_TEMPLATE.md`, copy the prompt, and replace:

```
**Technology Name**: React 19
**Official Documentation URL**: https://react.dev
**Version Number**: 19.0.0
**Project Context**: code-review-dashboard uses React Server Components and Next.js 15 App Router
```

**Step 3 - Run Generator**:
Paste into Claude Code and wait ~12 minutes.

**Step 4 - Review Output**:
```
✅ Specialist Generated Successfully
Quality Score: 10/10
Output: ~/.claude/agents/engineering/react-19-specialist.md
```

**Step 5 - Test**:
```
@react-19-specialist How do I use the use() hook for async data fetching?
```

Expected response includes:
- Official React docs URL for use() hook
- Code example from official docs
- Comparison with React 18 pattern
- Citation to authoritative React book

---

### Example 2: Generate Supabase Specialist

**Scenario**: You're implementing real-time cursors with Supabase and need expert guidance on RLS policies.

**Step 1 - Gather Inputs**:
```
Technology: Supabase
Documentation URL: https://supabase.com/docs
Version: 2.40.0
Context: code-review-dashboard uses Supabase for real-time presence, RLS policies, and PostgreSQL database
```

**Step 2 - Fill Template**:
```
**Technology Name**: Supabase
**Official Documentation URL**: https://supabase.com/docs
**Version Number**: 2.40.0
**Project Context**: code-review-dashboard uses Supabase for real-time presence, RLS policies, and PostgreSQL database
```

**Step 3 - Run Generator**:
Paste into Claude Code and wait ~14 minutes.

**Step 4 - Review Output**:
```
✅ Specialist Generated Successfully
Quality Score: 9/10
Output: ~/.claude/agents/engineering/supabase-specialist.md

⚠️ Freshness: 1/2 - One example uses generic RLS pattern, recommend manual review
```

**Step 5 - Manual Review** (if needed):
Open `~/.claude/agents/engineering/supabase-specialist.md` and check the flagged example:

```markdown
### RLS Policies

```sql
-- Generic pattern
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```
```

Improve to be version-specific:
```markdown
### RLS Policies (Supabase 2.40.0)

**Official Documentation**: https://supabase.com/docs/guides/database/postgres/row-level-security

```sql
-- Supabase 2.40.0 pattern with auth.jwt()
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (
  auth.uid() = id
  AND (auth.jwt() ->> 'role')::text = 'authenticated'
);
```
```

**Step 6 - Test**:
```
@supabase-specialist How do I implement RLS for real-time presence data?
```

---

### Example 3: Generate TypeScript 5.9 Specialist

**Scenario**: You need strict TypeScript guidance for a type-safe codebase with Zod validation.

**Step 1 - Gather Inputs**:
```
Technology: TypeScript
Documentation URL: https://www.typescriptlang.org/docs/
Version: 5.9.0
Context: code-review-dashboard uses TypeScript strict mode with Zod for runtime validation
```

**Step 2 - Fill Template**:
```
**Technology Name**: TypeScript
**Official Documentation URL**: https://www.typescriptlang.org/docs/
**Version Number**: 5.9.0
**Project Context**: code-review-dashboard uses TypeScript strict mode with Zod for runtime validation
```

**Step 3 - Run Generator**:
Paste into Claude Code and wait ~11 minutes.

**Step 4 - Review Output**:
```
✅ Specialist Generated Successfully
Quality Score: 8/10
Output: ~/.claude/agents/engineering/typescript-59-specialist.md

⚠️ Expertise: 1/2 - Only 1 authoritative resource found (TypeScript Handbook)
```

This is acceptable (8/10 passes threshold). TypeScript Handbook is official and comprehensive.

**Step 5 - Test**:
```
@typescript-59-specialist How do I type Server Actions with Zod validation?
```

---

## Troubleshooting

### Issue 1: Documentation URL Fails

**Symptom**:
```
❌ Error: Cannot retrieve official documentation from https://example.com/docs
Attempted: WebSearch for correct URL
Result: Not Found
User action needed: Verify and provide correct URL
```

**Solution**:
1. Verify the URL is correct (try opening in browser)
2. Check if documentation requires authentication
3. Look for alternative official documentation URL
4. Common fixes:
   - React: Use `https://react.dev` (not `https://reactjs.org`)
   - Next.js: Use `https://nextjs.org/docs` (not `https://nextjs.org`)
   - Ensure no trailing slash

---

### Issue 2: Generation Takes Longer Than 15 Minutes

**Symptom**:
Claude is still in Phase 1 or 2 after 10+ minutes.

**Solution**:
- This is normal for technologies with extensive documentation
- Maximum expected time: 24 minutes
- If exceeds 30 minutes, cancel and retry
- Check if documentation site is slow/down

---

### Issue 3: Quality Score Below 8/10

**Symptom**:
```
❌ Quality Score: 7/10 - FAIL
Failing Criteria:
- Expertise: 0/2 - No authoritative resources found
- Examples: 1/2 - Only 1 code example with source
```

**Solution (Automatic)**:
Generator will automatically retry up to 2 times to fix failing criteria.

**Solution (Manual)**:
If still fails after retries, you'll get a diagnostic report:

```
Manual Review Required
Estimated Editing Time: ~30 minutes

Missing Elements:
- Expertise: Add 2 authoritative books/resources manually
  → Search "{technology} best books 2026"
  → Add to "Authoritative Resources" section

- Examples: Add 2 more sourced code examples
  → Visit official documentation examples page
  → Copy code with source URL comments
```

Follow the recommendations to manually improve the specialist.

---

### Issue 4: Generated Specialist Seems Generic

**Symptom**:
Specialist file doesn't show version-specific features prominently.

**Solution**:
1. Check Freshness score in validation report
2. If Freshness = 1/2, review examples for version-specific content
3. Manually add version labels:
   ```markdown
   ### New in {VERSION}: {Feature Name}
   ```
4. Ensure code examples use version-specific APIs
5. Update changelog to emphasize version features

---

### Issue 5: Code Examples Use Deprecated APIs

**Symptom**:
Validation report shows:
```
❌ Freshness: 0/2 - Deprecated APIs found: ReactDOM.render()
```

**Solution (Automatic)**:
Generator should catch this in Phase 4 and regenerate examples.

**Solution (Manual)**:
1. Search official docs for current API
2. Replace deprecated code:
   ```diff
   - // ❌ Deprecated
   - ReactDOM.render(<App />, root);

   + // ✅ React 19
   + import { createRoot } from 'react-dom/client';
   + const root = createRoot(document.getElementById('root'));
   + root.render(<App />);
   ```
3. Add source URL comment

---

### Issue 6: Cannot Find Specialist File After Generation

**Symptom**:
Generator says "✅ Generation complete" but file not found at path.

**Solution**:
1. Check exact path in output summary
2. Verify `~/.claude/agents/engineering/` directory exists:
   ```bash
   ls ~/.claude/agents/engineering/
   ```
3. If directory missing, create it:
   ```bash
   mkdir -p ~/.claude/agents/engineering/
   ```
4. Re-run generator

---

## Advanced Usage

### Custom Output Path

By default, specialists are saved to `~/.claude/agents/engineering/`.

To change this, add to the template **INPUT PARAMETERS** section:

```
**Agent Category** (default: "engineering"): testing
```

Output will be: `~/.claude/agents/testing/{technology}-specialist.md`

Available categories:
- `engineering` - Development specialists
- `testing` - QA and testing specialists
- `security` - Security specialists
- `ai` - AI/ML specialists
- `design` - Design specialists

---

### Custom Quality Threshold

To accept lower quality specialists (useful for very new/niche technologies):

Add to **INPUT PARAMETERS**:

```
**Quality Threshold** (default: 8/10): 7
```

This will pass specialists with 7/10 scores.

**Warning**: Lower thresholds may produce specialists needing manual editing.

---

### Batch Generation

To generate multiple specialists at once:

1. Prepare 3-5 technology inputs
2. Run generators in parallel (separate Claude Code chats)
3. Review all outputs together

**Example**: Generate full stack for a project:
- React 19 Specialist
- Next.js 15 Specialist
- Supabase Specialist
- TypeScript 5.9 Specialist
- Tailwind CSS Specialist

All 5 can be generated in ~15 minutes (parallel execution).

---

## Quality Assessment

### How to Know If Your Specialist is Good

#### Excellent Quality (9-10/10)
- All 5 criteria score 2/2
- No manual editing needed
- Ready for production use
- Grounded in official docs with extensive citations
- Multiple authoritative resources referenced
- Version-specific throughout

#### Good Quality (8/10)
- 4 criteria score 2/2, one scores 1/2
- Minimal manual editing (< 15 minutes)
- Production-ready with minor improvements
- Meets minimum standards across all criteria

#### Acceptable Quality (7/10)
- 3 criteria score 2/2, two score 1/2
- Moderate manual editing (15-30 minutes)
- Usable but could be improved
- May lack some authoritative resources or examples

#### Poor Quality (<7/10)
- Multiple criteria score 0-1/2
- Significant manual editing needed (>30 minutes)
- Specialist Generator failed to meet quality goals
- Should re-run with better inputs or different approach

---

## Best Practices

### 1. Use Specific Version Numbers
❌ **Bad**: "React 19"
✅ **Good**: "React 19.0.0"

Specific versions help generator find version-specific features in docs.

---

### 2. Provide Meaningful Project Context
❌ **Bad**: "Building a web app"
✅ **Good**: "code-review-dashboard uses React Server Components, Supabase real-time, and TypeScript strict mode"

Context helps generator prioritize relevant features and collaboration scenarios.

---

### 3. Verify Documentation URL Before Running
❌ **Bad**: Copy URL from Google search results (may be outdated)
✅ **Good**: Visit official site, confirm it's canonical docs, copy URL

Saves time by avoiding regeneration due to invalid URL.

---

### 4. Review Validation Report, Not Just Score
❌ **Bad**: "9/10, ship it!"
✅ **Good**: "9/10, but Expertise is 1/2 - let me check which resources were found..."

Understanding which criteria scored lower helps identify areas for manual improvement.

---

### 5. Test Specialist Before Using in Production
❌ **Bad**: Generate specialist, immediately use in critical project decision
✅ **Good**: Generate specialist, test with 3-5 questions, verify responses are accurate

Confirms specialist quality before relying on it.

---

## Performance Expectations

### Time Benchmarks

| Technology Complexity | Expected Time | Maximum Time |
|-----------------------|---------------|--------------|
| Simple (e.g., Tailwind CSS) | 10-12 min | 18 min |
| Medium (e.g., React 19) | 12-15 min | 24 min |
| Complex (e.g., Supabase, Next.js) | 15-18 min | 30 min |

### Quality Benchmarks

| Technology Type | Expected Score | Common Issues |
|-----------------|----------------|---------------|
| Mature (e.g., React, TypeScript) | 9-10/10 | None |
| Modern (e.g., Next.js 15) | 8-9/10 | May lack older books (only official docs) |
| Cutting-Edge (e.g., brand new frameworks) | 7-8/10 | Limited expert resources, fewer examples |

---

## Maintenance and Updates

### When to Regenerate a Specialist

1. **New Version Released**: React 20 is out → Regenerate React Specialist
2. **Major API Changes**: TypeScript 6.0 with breaking changes → Regenerate
3. **Your Project Evolves**: Started using new features → Regenerate with updated context
4. **Documentation Improved**: Official docs got better examples → Regenerate for better quality

### How to Update Existing Specialist

**Option 1: Full Regeneration** (Recommended)
- Use Specialist Generator with new version number
- Overwrites existing specialist
- Time: 10-15 minutes

**Option 2: Manual Update**
- Open existing specialist file
- Update version numbers in frontmatter
- Add new features from release notes
- Update code examples to use new APIs
- Time: 30-60 minutes

---

## Feedback and Improvement

### How to Provide Feedback

If generated specialist has issues:

1. **Document the Issue**:
   - What was inaccurate?
   - Which criterion failed?
   - What should have been included?

2. **Share Context**:
   - Technology and version
   - Input parameters you used
   - Quality score received
   - Specific section that was problematic

3. **Suggest Improvements**:
   - What would make the specialist better?
   - Which sources should have been found?
   - What validation step was missed?

This helps improve Specialist Generator for future agents.

---

## FAQ

### Q: Can I generate specialists for non-web technologies?

**A**: Yes! Specialist Generator works for any technology with official documentation:
- Python libraries (e.g., "Pandas 2.0", "FastAPI 0.100")
- Mobile frameworks (e.g., "React Native 0.72", "Flutter 3.10")
- Backend frameworks (e.g., "Express 5.0", "Django 5.0")
- Databases (e.g., "PostgreSQL 16", "MongoDB 7.0")

Just provide the official docs URL and version.

---

### Q: What if my technology doesn't have official documentation?

**A**: Specialist Generator requires official documentation to prevent hallucinations. If no official docs exist:
- Use the most authoritative source (e.g., GitHub README for new libraries)
- Set quality threshold to 7/10 (reduce expectations)
- Expect more manual editing needed
- Consider whether a specialist is appropriate

---

### Q: Can I customize the agent template structure?

**A**: Not in v1.0. The template is standardized to ensure consistency across specialists. Future versions may support custom templates.

---

### Q: How do I share generated specialists with my team?

**A**: Generated specialists are at `~/.claude/agents/`. To share:

1. Copy specialist file
2. Send to teammates
3. They place it in their `~/.claude/agents/engineering/` directory
4. Restart Claude Code (if needed)

Alternatively, commit to project repo and document in README.

---

### Q: What if I need a specialist for a combination of technologies?

**A**: For combos like "Next.js + Supabase":

**Option 1**: Generate separate specialists
- `@nextjs-15-specialist` for Next.js questions
- `@supabase-specialist` for Supabase questions

**Option 2**: Create manual combo specialist
- Generate Next.js specialist as base
- Manually add Supabase integration patterns
- Update collaboration section to reference Supabase specialist

**Option 3**: Wait for Specialist Generator v2.0
- Planned feature: Multi-technology specialists
- Example input: "Next.js 15 + Supabase 2.40.0"

---

### Q: How much does it cost to run Specialist Generator?

**A**: Specialist Generator uses Claude Code's built-in tools (WebFetch, WebSearch). Costs depend on your Claude subscription:
- Claude Pro ($20/month): Unlimited usage
- Claude API: ~$0.50-2.00 per specialist generation (varies by documentation size)

---

### Q: Can I run Specialist Generator offline?

**A**: No, it requires internet access to:
- Fetch official documentation (WebFetch)
- Search for expert resources (WebSearch)
- Validate URLs

---

## Next Steps

### After Generating Your First Specialist

1. **Test extensively**: Ask 10+ questions to verify quality
2. **Provide feedback**: Note any issues for improvement
3. **Generate more specialists**: Build your full tech stack
4. **Share with team**: Help teammates benefit from specialists
5. **Maintain regularly**: Regenerate when new versions release

### Building a Complete Specialist Team

For a full-stack project, consider generating:

**Frontend Stack**:
- React 19 Specialist
- Next.js 15 Specialist
- TypeScript 5.9 Specialist
- Tailwind CSS Specialist

**Backend Stack**:
- Supabase Specialist
- PostgreSQL 16 Specialist
- Prisma Specialist

**Testing Stack**:
- Jest Specialist
- React Testing Library Specialist
- Playwright Specialist

**Total Time**: ~2-3 hours to generate 10 specialists vs ~20-30 hours manually

---

## Support

### Where to Get Help

1. **Documentation**: Re-read SPECIALIST_GENERATOR_ARCHITECTURE.md for technical details
2. **Quality Gates**: Review SPECIALIST_GENERATOR_QUALITY_GATES.md for validation criteria
3. **Template Reference**: Check SPECIALIST_GENERATOR_TEMPLATE.md for prompt structure
4. **Troubleshooting**: See this guide's Troubleshooting section above

---

## Appendix: Full Example Generation Session

### Complete End-to-End Example

**Goal**: Generate Supabase specialist for code-review-dashboard project

**Step 1 - Prepare**:
```
Technology: Supabase
Docs URL: https://supabase.com/docs
Version: 2.40.0
Context: code-review-dashboard uses Supabase for real-time presence, RLS policies, and PostgreSQL database
```

**Step 2 - Fill Template**:
[Copy from SPECIALIST_GENERATOR_TEMPLATE.md and replace variables]

**Step 3 - Paste into Claude Code**:
```
You are the Specialist Generator meta-agent. Your mission is to create a high-quality specialist agent markdown file in 10-15 minutes that scores 8/10 or higher on quality criteria.

---

## INPUT PARAMETERS

**Technology Name**: Supabase
**Official Documentation URL**: https://supabase.com/docs
**Version Number**: 2.40.0
**Project Context**: code-review-dashboard uses Supabase for real-time presence, RLS policies, and PostgreSQL database

[... rest of template ...]
```

**Step 4 - Wait and Monitor**:
```
Starting Phase 1: Documentation Research...
  Fetching https://supabase.com/docs
  Found sections: Database, Auth, Realtime, Storage, Edge Functions
  Extracting RLS policy examples...
  Recording citation URLs...
✅ Phase 1 complete (4 minutes)

Starting Phase 2: Expert/Literature Discovery...
  Searching "Supabase best books 2026"
  Found: "The Supabase Handbook" by Paul Copplestone (2024)
  Searching "Supabase Realtime tutorial"
  Found: Official Supabase YouTube channel
✅ Phase 2 complete (3 minutes)

Starting Phase 3: Agent Synthesis...
  Generating metadata...
  Generating core mission from docs...
  Extracting 4 code examples from official docs...
  Generating collaboration patterns...
✅ Phase 3 complete (5 minutes)

Starting Phase 4: Quality Validation...
  Grounding: 2/2 (4 official doc URLs cited)
  Expertise: 2/2 (2 authoritative resources)
  Examples: 2/2 (4 sourced code examples)
  Collaboration: 2/2 (5 specialist scenarios)
  Freshness: 2/2 (All Supabase 2.40.0 specific)
  Total Score: 10/10 ✅ PASS
✅ Phase 4 complete (2 minutes)

Starting Phase 5: Output Generation...
  Writing to ~/.claude/agents/engineering/supabase-specialist.md
✅ Phase 5 complete (1 minute)
```

**Step 5 - Review Summary**:
```
✅ Specialist Generated Successfully

Technology: Supabase 2.40.0
Output File: ~/.claude/agents/engineering/supabase-specialist.md
Quality Score: 10/10
Generation Time: 15 minutes
Status: PASS

Validation Results:
- ✅ Grounding: 2/2
- ✅ Expertise: 2/2
- ✅ Examples: 2/2
- ✅ Collaboration: 2/2
- ✅ Freshness: 2/2

Next Steps:
1. Review specialist at ~/.claude/agents/engineering/supabase-specialist.md
2. Test with: @supabase-specialist How do I implement RLS for presence data?
```

**Step 6 - Test**:
```
@supabase-specialist How do I implement RLS policies for real-time presence data that allows users to see each other's cursors but protects session metadata?
```

Expected response:
- Cites Supabase RLS documentation URL
- Provides Supabase 2.40.0-specific RLS policy example
- Explains auth.uid() and auth.jwt() usage
- References Supabase Handbook or official guides
- Suggests collaboration with Security Specialist for auth review

**Success!** You now have a production-ready Supabase specialist.

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-07
**Estimated Reading Time**: 25 minutes
**Estimated First Generation Time**: 15 minutes
