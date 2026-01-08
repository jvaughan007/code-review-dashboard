# Specialist Generator Meta-Agent Architecture

**Version**: 1.0.0
**Created**: 2026-01-07
**Purpose**: Generate high-quality specialist agents in 10-15 minutes (vs 2-3 hours manual)
**Quality Target**: 8/10 or higher without manual editing

---

## Overview

The Specialist Generator is a meta-agent that automates the creation of specialist agent markdown files for Claude Code. It uses a multi-phase pipeline to research, synthesize, and validate specialist agents grounded in official documentation and authoritative literature.

### Key Innovation

Instead of manually researching documentation and drafting agent files for 2-3 hours, the Specialist Generator:

1. **Scrapes official documentation** using WebFetch tool
2. **Identifies authoritative books/experts** using WebSearch
3. **Generates code examples** grounded in official docs
4. **Validates quality** using multi-phase scoring rubric
5. **Outputs production-ready** agent markdown file

**Time Savings**: 2-3 hours → 10-15 minutes (85-90% reduction)

---

## Architecture: 5-Phase Pipeline

```
Phase 1: Documentation Research (3-5 min)
    ↓
Phase 2: Expert/Literature Discovery (2-3 min)
    ↓
Phase 3: Agent Synthesis (3-5 min)
    ↓
Phase 4: Quality Validation (1-2 min)
    ↓
Phase 5: Output Generation (1 min)
```

### Phase 1: Documentation Research

**Goal**: Extract official documentation content, version-specific features, best practices

**Inputs**:
- Technology name (e.g., "React 19")
- Official docs URL (e.g., "https://react.dev")
- Version number (e.g., "19.2.3")

**Process**:
1. Use WebFetch to retrieve main documentation page
2. Identify key sections: Getting Started, Core Concepts, API Reference, Best Practices
3. Extract version-specific features (e.g., "React 19 introduces Server Components, use() hook")
4. Capture official code examples with correct syntax
5. Record documentation URLs for citations

**Tools Used**: WebFetch, WebSearch (for finding specific doc pages)

**Outputs**:
- `docs_summary.txt`: Key features, APIs, patterns from official docs
- `version_features.txt`: Version-specific capabilities
- `official_examples.txt`: Code snippets from documentation
- `citation_urls.txt`: List of official doc URLs to cite

**Quality Check**: Verify all URLs resolve and content is version-specific

---

### Phase 2: Expert/Literature Discovery

**Goal**: Identify 2-3 authoritative books, experts, or resources for the technology

**Inputs**:
- Technology name
- Version number
- Documentation summary from Phase 1

**Process**:
1. Use WebSearch to find: "{technology} best books 2026"
2. Use WebSearch to find: "{technology} {version} expert resources"
3. Filter for:
   - Books with >4.0 stars on Amazon/Goodreads
   - Authors who are core contributors or recognized experts
   - Resources updated for current version (not outdated)
4. Cross-reference with official documentation "Recommended Learning" sections
5. Prioritize official guides, O'Reilly books, and recognized authorities

**Tools Used**: WebSearch

**Outputs**:
- `expert_resources.txt`: 2-3 books/courses/experts with:
  - Title/Name
  - Author
  - Publication year
  - Why it's authoritative (e.g., "Author is React core team member")
  - URL (if available)

**Quality Check**: All resources must be from last 2 years OR explicitly updated for current version

---

### Phase 3: Agent Synthesis

**Goal**: Generate specialist agent markdown file following standard template

**Inputs**:
- Documentation summary (Phase 1)
- Expert resources (Phase 2)
- Project context (optional, e.g., "code-review-dashboard uses React Server Components")
- Standard agent template structure

**Process**:

#### 3.1: Generate Agent Metadata
```yaml
---
name: [Technology] Specialist
description: Expert in [technology] [version] with focus on [key capabilities]
color: cyan  # or relevant color
version: 1.0.0
updated: 2026-01-07
model: sonnet
frameworks:
  [technology]: [version]
changelog:
  - "1.0.0 (2026-01-07): Initial specialist - [key features]"
---
```

#### 3.2: Generate Identity Section
```markdown
# [Technology] Specialist Agent Personality

You are **[Technology] Specialist**, an expert in [technology] [version] who [core mission statement].

## 🧠 Your Identity & Memory
- **Role**: [Specific role, e.g., "React 19 Server Components architecture specialist"]
- **Personality**: [Traits matching technology, e.g., "Performance-focused, component-driven, type-safe"]
- **Memory**: You remember [relevant patterns, e.g., "optimal Server vs Client Component boundaries"]
- **Experience**: You've seen [technology] projects succeed/fail through [specific patterns]
```

#### 3.3: Generate Core Mission Section
Extract 3-5 core responsibilities from documentation:
```markdown
## 🎯 Your Core Mission

### [Responsibility 1 - from docs]
- [Specific capability 1]
- [Specific capability 2]
- **Default requirement**: [Quality standard from docs]

### [Responsibility 2 - from docs]
...
```

#### 3.4: Generate Critical Rules Section
Extract anti-patterns, security warnings, deprecations from docs:
```markdown
## 🚨 Critical Rules You Must Follow

### [Rule Category 1]
- [Specific rule from official docs]
- [Reasoning or consequence]

### [Rule Category 2]
...
```

#### 3.5: Generate Core Technologies Section
List version-specific features, frameworks, tools:
```markdown
## 📚 Your Core Technologies (2026)

### [Technology Ecosystem]
- **[Tool 1]** - [Version] - [Purpose]
- **[Tool 2]** - [Version] - [Purpose]

### Official Documentation References
- [Technology]: [URL]
- [Related Tool]: [URL]

### Authoritative Resources
- **Book**: "[Title]" by [Author] ([Year]) - [Why relevant]
- **Expert**: [Name] - [Credentials] - [Resource URL]
```

#### 3.6: Generate Technical Deliverables Section
Create 3-5 code examples from official documentation:
```markdown
## 📋 Your Technical Deliverables

### [Feature/Pattern 1 from Docs]

[Explanation from documentation]

```[language]
// [Official code example - cited from docs]
[Code here with comments]
```

**When to Use:**
- ✅ [Use case 1]
- ✅ [Use case 2]
- ❌ [Anti-pattern 1]
- ❌ [Anti-pattern 2]

### [Feature/Pattern 2 from Docs]
...
```

#### 3.7: Generate Collaboration Section
Define when to consult other specialists:
```markdown
## 🤝 Collaboration Patterns

### When to Consult Other Specialists

**Backend Architect** - When you need:
- [Specific integration scenario]

**DevOps Automator** - When you need:
- [Specific deployment scenario]

**QA Specialist** - When you need:
- [Specific testing scenario]
```

#### 3.8: Generate Anti-Patterns Section
Extract common mistakes from documentation:
```markdown
## ⚠️ Common Pitfalls & Anti-Patterns

### Anti-Pattern 1: [Name]
**Problem**: [Description]
**Why It Fails**: [Explanation from docs]
**Correct Approach**: [Solution from docs with code example]
```

**Tools Used**: None (synthesis based on Phase 1 & 2 outputs)

**Outputs**:
- `specialist_draft.md`: Complete agent markdown file

**Quality Check**: All code examples must use correct syntax for specified version

---

### Phase 4: Quality Validation

**Goal**: Score generated specialist against 5 quality criteria (8/10 threshold)

**Inputs**:
- Generated specialist draft
- Documentation URLs from Phase 1
- Expert resources from Phase 2

**Scoring Rubric** (2 points each, 10 points total):

#### 4.1: Grounding (2 points)
- 2 pts: Cites 3+ official doc URLs with specific sections
- 1 pt: Cites 1-2 official doc URLs
- 0 pts: No official documentation cited

**Check**:
```
Count URLs matching official documentation domain
Verify URLs resolve and point to correct version
```

#### 4.2: Expertise (2 points)
- 2 pts: References 2-3 authoritative books/experts with details
- 1 pt: References 1 authoritative resource
- 0 pts: No expert resources cited

**Check**:
```
Verify "Authoritative Resources" section exists
Check publication years (must be recent or version-relevant)
Confirm authors are recognized experts
```

#### 4.3: Examples (2 points)
- 2 pts: Includes 3+ accurate, version-specific code examples
- 1 pt: Includes 1-2 code examples
- 0 pts: No code examples or examples use wrong syntax/outdated APIs

**Check**:
```
Parse code blocks
Verify APIs match official documentation
Check for version-specific features (not deprecated APIs)
Run syntax validation if possible
```

#### 4.4: Collaboration (2 points)
- 2 pts: Specifies 3+ scenarios for consulting other specialists
- 1 pt: Specifies 1-2 collaboration scenarios
- 0 pts: No collaboration guidance

**Check**:
```
Verify "Collaboration Patterns" section exists
Count number of specialist consultations defined
Ensure scenarios are specific (not generic)
```

#### 4.5: Freshness (2 points)
- 2 pts: All examples, APIs, and patterns are version-specific
- 1 pt: Mostly current but includes some generic/outdated content
- 0 pts: Uses deprecated APIs or outdated patterns

**Check**:
```
Cross-reference code examples with official docs
Look for deprecated API usage
Verify changelog mentions current version
Check frameworks/tools versions match current ecosystem
```

**Total Score**: Sum of 5 criteria (max 10 points)

**Pass Threshold**: 8/10 or higher

**If Score < 8**:
1. Identify failing criteria
2. Regenerate specific sections
3. Re-validate
4. Maximum 2 retry attempts
5. If still fails, output diagnostic report for manual intervention

**Outputs**:
- `validation_report.txt`: Score breakdown with specific findings
- `pass` or `fail` status

---

### Phase 5: Output Generation

**Goal**: Write validated specialist to correct location with proper formatting

**Inputs**:
- Validated specialist draft
- Technology name (determines file name)
- Validation report (for changelog)

**Process**:
1. Determine output path:
   ```
   ~/.claude/agents/engineering/[technology-name]-specialist.md
   ```
   Example: `~/.claude/agents/engineering/react-19-specialist.md`

2. Add generation metadata to changelog:
   ```yaml
   changelog:
     - "1.0.0 (2026-01-07): Auto-generated by Specialist Generator (Quality Score: 9/10)"
   ```

3. Write file to disk

4. Generate usage summary:
   ```markdown
   # Specialist Generated Successfully

   **Technology**: React 19
   **Output File**: ~/.claude/agents/engineering/react-19-specialist.md
   **Quality Score**: 9/10
   **Generation Time**: 12 minutes

   ## Validation Results
   - ✅ Grounding: 2/2 (5 official doc URLs cited)
   - ✅ Expertise: 2/2 (3 authoritative books referenced)
   - ✅ Examples: 2/2 (4 version-specific code examples)
   - ✅ Collaboration: 2/2 (5 specialist consultation scenarios)
   - ✅ Freshness: 1/2 (One example uses generic pattern, recommend manual review)

   ## Next Steps
   1. Review specialist file at path above
   2. Test by invoking: `@react-19-specialist` in Claude Code
   3. If quality issues found, provide feedback for Specialist Generator improvement
   ```

**Outputs**:
- Specialist agent markdown file at `~/.claude/agents/engineering/[name].md`
- `generation_summary.txt`: Usage instructions and validation results

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPECIALIST GENERATOR                          │
│                      Meta-Agent System                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   USER INPUTS    │
                    ├──────────────────┤
                    │ - Technology     │
                    │ - Docs URL       │
                    │ - Version        │
                    │ - Context (opt)  │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Documentation Research (3-5 min)                       │
├─────────────────────────────────────────────────────────────────┤
│ Tools: WebFetch, WebSearch                                       │
│ Process:                                                         │
│   1. Fetch official docs homepage                               │
│   2. Search for key documentation sections                      │
│   3. Extract version-specific features                          │
│   4. Collect official code examples                             │
│   5. Record citation URLs                                       │
├─────────────────────────────────────────────────────────────────┤
│ Outputs:                                                         │
│   • docs_summary.txt                                            │
│   • version_features.txt                                        │
│   • official_examples.txt                                       │
│   • citation_urls.txt                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Expert/Literature Discovery (2-3 min)                  │
├─────────────────────────────────────────────────────────────────┤
│ Tools: WebSearch                                                 │
│ Process:                                                         │
│   1. Search "{tech} best books 2026"                           │
│   2. Search "{tech} {version} expert resources"                │
│   3. Filter by ratings, authority, recency                      │
│   4. Cross-reference with official recommendations             │
│   5. Select 2-3 authoritative resources                        │
├─────────────────────────────────────────────────────────────────┤
│ Outputs:                                                         │
│   • expert_resources.txt                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Agent Synthesis (3-5 min)                              │
├─────────────────────────────────────────────────────────────────┤
│ Tools: None (synthesis from Phase 1 & 2)                        │
│ Process:                                                         │
│   1. Generate metadata (name, version, frameworks)              │
│   2. Generate identity section                                  │
│   3. Generate core mission (from docs)                          │
│   4. Generate critical rules (anti-patterns from docs)          │
│   5. Generate core technologies (version-specific)              │
│   6. Generate technical deliverables (code examples)            │
│   7. Generate collaboration patterns                            │
│   8. Generate anti-patterns section                             │
├─────────────────────────────────────────────────────────────────┤
│ Outputs:                                                         │
│   • specialist_draft.md (complete agent file)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: Quality Validation (1-2 min)                           │
├─────────────────────────────────────────────────────────────────┤
│ Tools: None (rule-based validation)                             │
│ Scoring Rubric (8/10 threshold):                                │
│   1. Grounding (2 pts): 3+ official doc URLs cited             │
│   2. Expertise (2 pts): 2-3 authoritative books/experts        │
│   3. Examples (2 pts): 3+ accurate code examples               │
│   4. Collaboration (2 pts): 3+ specialist scenarios            │
│   5. Freshness (2 pts): Version-specific, no deprecated APIs   │
├─────────────────────────────────────────────────────────────────┤
│ If score < 8: Regenerate failing sections (max 2 retries)      │
├─────────────────────────────────────────────────────────────────┤
│ Outputs:                                                         │
│   • validation_report.txt                                       │
│   • pass/fail status                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Output Generation (1 min)                              │
├─────────────────────────────────────────────────────────────────┤
│ Tools: Write                                                     │
│ Process:                                                         │
│   1. Determine output path (~/.claude/agents/engineering/)      │
│   2. Add generation metadata to changelog                       │
│   3. Write specialist file                                      │
│   4. Generate usage summary                                     │
├─────────────────────────────────────────────────────────────────┤
│ Outputs:                                                         │
│   • ~/.claude/agents/engineering/[tech]-specialist.md           │
│   • generation_summary.txt                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  FINAL OUTPUT    │
                    ├──────────────────┤
                    │ Specialist Agent │
                    │ Quality: 8-10/10 │
                    │ Time: 10-15 min  │
                    └──────────────────┘
```

---

## Tools Required

### Claude Code Built-in Tools
- **WebFetch**: Retrieve official documentation pages
- **WebSearch**: Find expert resources, books, recent articles
- **Read**: (optional) Read existing specialist files for template reference
- **Write**: Output final specialist markdown file

### External Tools (Optional)
- **Syntax Validator**: Validate code examples (Phase 4)
- **Link Checker**: Verify all URLs resolve (Phase 4)

---

## Error Handling & Edge Cases

### Edge Case 1: Documentation URL is Invalid
**Scenario**: User provides wrong URL or site is down
**Handling**:
1. Attempt WebSearch for "{technology} official documentation"
2. If found, use discovered URL and notify user
3. If not found, exit with error: "Cannot proceed without official documentation. Please verify URL."

### Edge Case 2: No Expert Resources Found
**Scenario**: Technology is too new or niche
**Handling**:
1. Accept official documentation as sole authoritative source
2. Score "Expertise" criterion as 1/2 (reduced from 2/2)
3. Adjust pass threshold to 7/10 (from 8/10) with warning
4. Note in generation summary: "Limited expert resources available, recommend manual review"

### Edge Case 3: Version Mismatch
**Scenario**: Official docs don't clearly specify version features
**Handling**:
1. Search for "{technology} {version} release notes"
2. Search for "{technology} {version} changelog"
3. Extract version-specific features from release notes
4. If unavailable, warn user: "Version-specific features unclear, specialist may be generic"

### Edge Case 4: Quality Validation Fails After 2 Retries
**Scenario**: Generated specialist scores < 8/10 after regeneration attempts
**Handling**:
1. Output specialist draft anyway (for manual editing)
2. Generate detailed diagnostic report:
   - Which criteria failed
   - Specific missing elements
   - Recommendations for manual improvement
3. Estimate manual editing time needed (e.g., "~30 minutes to add missing code examples")

### Edge Case 5: Code Examples Use Deprecated APIs
**Scenario**: Official docs still show old patterns alongside new ones
**Handling**:
1. Prioritize examples marked "Recommended" or "Latest"
2. Exclude examples with warnings like "Legacy API" or "Deprecated"
3. Cross-reference with changelog to identify newest patterns
4. If ambiguous, include both with clear "Old vs New" labels

---

## Performance Targets

| Phase | Target Time | Maximum Time |
|-------|-------------|--------------|
| Phase 1: Documentation Research | 3-5 min | 7 min |
| Phase 2: Expert Discovery | 2-3 min | 5 min |
| Phase 3: Agent Synthesis | 3-5 min | 7 min |
| Phase 4: Quality Validation | 1-2 min | 3 min |
| Phase 5: Output Generation | 1 min | 2 min |
| **Total** | **10-15 min** | **24 min** |

**Note**: Maximum times account for retries, slower WebFetch, and edge cases

---

## Success Metrics

### Primary Success Criteria
- **Generation Time**: 10-15 minutes (85-90% time savings vs manual 2-3 hours)
- **Quality Score**: 8/10 or higher without manual editing
- **Manual Edit Time**: <30 minutes to reach 10/10 quality (if needed)
- **Accuracy**: Zero hallucinations (all content grounded in official docs)

### Secondary Success Criteria
- **Reusability**: Generated specialist works across 3+ projects without modification
- **Completeness**: Specialist answers 80%+ of technology-specific questions without escalation
- **Maintainability**: Easy to regenerate when new version is released (just update version input)

---

## Future Enhancements (v2.0+)

### Potential Improvements
1. **Multi-Language Support**: Generate specialists for Python, Go, Rust, etc. (not just web technologies)
2. **Framework Combos**: Handle "Next.js + Supabase" or "React + TanStack Query" specialists
3. **Incremental Updates**: Update existing specialist for new version (preserve customizations)
4. **Custom Templates**: Allow project-specific agent template structures
5. **Automated Testing**: Generate test conversations to validate specialist quality
6. **Community Library**: Share/download community-validated specialists

### Known Limitations (v1.0)
- Requires official documentation URL (doesn't work for undocumented tools)
- English-only documentation support
- Cannot validate code examples in languages without syntax checkers
- Manual intervention required if quality score < 8/10 after retries

---

## Appendix: Agent Template Structure

### Standard Specialist Agent Template
```markdown
---
name: [Technology] Specialist
description: [One-line description with key capabilities]
color: cyan
version: 1.0.0
updated: YYYY-MM-DD
model: sonnet
frameworks:
  [tech]: [version]
changelog:
  - "1.0.0 (YYYY-MM-DD): [Summary]"
---

# [Technology] Specialist Agent Personality

You are **[Technology] Specialist**, [core mission statement].

## 🧠 Your Identity & Memory
- **Role**: [Specific expertise area]
- **Personality**: [Key traits]
- **Memory**: You remember [relevant patterns]
- **Experience**: You've seen [success/failure patterns]

## 🎯 Your Core Mission

### [Responsibility 1]
- [Capability details]
- **Default requirement**: [Quality standard]

## 🚨 Critical Rules You Must Follow

### [Rule Category]
- [Specific rules from docs]

## 📚 Your Core Technologies (2026)

### [Technology Ecosystem]
- **[Tool]** - [Version] - [Purpose]

### Official Documentation References
- [Technology]: [URL]

### Authoritative Resources
- **Book**: "[Title]" by [Author] ([Year]) - [Why relevant]

## 📋 Your Technical Deliverables

### [Feature/Pattern from Docs]

[Explanation]

```[language]
// [Code example from official docs]
```

**When to Use:**
- ✅ [Use case]
- ❌ [Anti-pattern]

## 🤝 Collaboration Patterns

### When to Consult Other Specialists

**[Other Specialist]** - When you need:
- [Specific scenario]

## ⚠️ Common Pitfalls & Anti-Patterns

### Anti-Pattern 1: [Name]
**Problem**: [Description]
**Why It Fails**: [Explanation]
**Correct Approach**: [Solution with code]
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-07
**Next Review**: When Specialist Generator v2.0 development begins
