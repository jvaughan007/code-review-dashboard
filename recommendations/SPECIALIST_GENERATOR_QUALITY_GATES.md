# Specialist Generator Quality Gates

**Version**: 1.0.0
**Created**: 2026-01-07
**Purpose**: Validation criteria and scoring rubric for specialist agent quality

---

## Overview

Quality gates prevent hallucinations and ensure generated specialists are grounded in official documentation and authoritative sources. Every generated specialist must score 8/10 or higher to be considered production-ready.

### Quality Philosophy

**Ground in Truth, Not Invention**
- Every statement must trace back to official documentation or authoritative source
- Code examples must be from official docs (with source URLs)
- Anti-patterns must be documented warnings (not assumed)
- Expert resources must be verifiable (books, courses, recognized authorities)

**Zero Hallucination Tolerance**
- No invented APIs or syntax
- No made-up best practices
- No fictional books or experts
- No outdated/deprecated patterns presented as current

---

## Scoring Rubric: 5 Criteria (10 Points Total)

### Criterion 1: Grounding (2 points)

**What We're Measuring**: Are claims backed by official documentation with citations?

#### Scoring:
- **2 points**: Cites 3+ official doc URLs with specific sections
- **1 point**: Cites 1-2 official doc URLs
- **0 points**: No official documentation cited OR URLs are broken

#### Validation Checklist:
```
□ Count official documentation URLs in specialist file
□ Verify each URL resolves (no 404s)
□ Check URLs point to correct version documentation
□ Ensure URLs are scattered throughout (not all in one section)
□ Confirm "Official Documentation References" section exists
```

#### Examples:

**2 Points (Excellent)**:
```markdown
### React 19 Server Components

**Official Documentation**: https://react.dev/reference/rsc/server-components

Server Components run on the server and can access backend resources directly.

**Official Documentation**: https://react.dev/reference/rsc/use-server

Use the `use server` directive for Server Actions...

### When to Use Server vs Client Components

**Official Documentation**: https://react.dev/learn/start-a-new-react-project#which-features-do-i-need
```
(3+ URLs cited throughout)

**1 Point (Acceptable)**:
```markdown
### React 19 Server Components

**Official Documentation**: https://react.dev

Server Components are a new feature in React 19...
```
(1-2 URLs, less specific)

**0 Points (Fail)**:
```markdown
### React 19 Server Components

Server Components are a new feature in React 19 that run on the server...
```
(No URLs cited)

#### Automated Check:
```python
def validate_grounding(specialist_content, official_domain):
    """
    Returns score 0-2 for grounding criterion
    """
    # Extract all URLs from specialist content
    urls = extract_urls(specialist_content)

    # Filter for official documentation URLs
    official_urls = [url for url in urls if official_domain in url]

    # Check if URLs resolve
    valid_urls = [url for url in official_urls if url_resolves(url)]

    if len(valid_urls) >= 3:
        return 2
    elif len(valid_urls) >= 1:
        return 1
    else:
        return 0
```

---

### Criterion 2: Expertise (2 points)

**What We're Measuring**: Are authoritative books/experts referenced beyond official docs?

#### Scoring:
- **2 points**: References 2-3 authoritative books/experts with full details (title, author, year, why authoritative)
- **1 point**: References 1 authoritative resource with details
- **0 points**: No expert resources cited OR resources lack details OR resources are not authoritative

#### Validation Checklist:
```
□ Check "Authoritative Resources" section exists
□ Count number of resources listed
□ Verify each has: Title, Author, Year, Why Authoritative
□ Confirm publication years are 2024-2026 OR version-compatible
□ Validate authors are recognized experts (via WebSearch if needed)
□ Ensure resources are not random blog posts (must be books, courses, official guides)
```

#### Examples:

**2 Points (Excellent)**:
```markdown
### Authoritative Resources

- **Book**: "React 19: The Complete Guide" by Maximilian Schwarzmüller (2025) - Comprehensive course creator with 500K+ students, updated for React 19 Server Components and Actions
- **Book**: "Learning React" by Alex Banks & Eve Porcello (O'Reilly, 2024 3rd Edition) - Covers React 19 features, published by O'Reilly, authors are experienced React trainers
- **Expert Resource**: "React Official Blog - React 19 Release" (2024) - Direct from React core team, explains design decisions behind Server Components
```
(3 resources, all with full details)

**1 Point (Acceptable)**:
```markdown
### Authoritative Resources

- **Book**: "Learning React" by Alex Banks & Eve Porcello (O'Reilly, 2024) - Covers React 19 features
```
(1 resource with details)

**0 Points (Fail)**:
```markdown
### Authoritative Resources

- Check out the React blog for more info
```
(No proper citations, no details)

#### What Counts as Authoritative:
✅ **Yes**:
- O'Reilly books
- Manning books
- Packt books (4+ stars)
- Udemy/Coursera courses by recognized instructors (50K+ students)
- Official guides/tutorials from technology creators
- Authors who are core contributors to the technology
- Published papers/research from recognized institutions

❌ **No**:
- Random blog posts
- Medium articles (unless by core team member)
- Self-published books with no reviews
- YouTube tutorials (unless from official channel)
- Stack Overflow answers
- Reddit posts

#### Automated Check:
```python
def validate_expertise(specialist_content):
    """
    Returns score 0-2 for expertise criterion
    """
    # Find "Authoritative Resources" section
    section = extract_section(specialist_content, "Authoritative Resources")

    # Count resources with full details
    resources = []
    for line in section:
        if has_title_author_year(line):
            resources.append(line)

    if len(resources) >= 2:
        return 2
    elif len(resources) >= 1:
        return 1
    else:
        return 0
```

---

### Criterion 3: Examples (2 points)

**What We're Measuring**: Are code examples accurate, version-specific, and sourced?

#### Scoring:
- **2 points**: Includes 3+ accurate, version-specific code examples with source URLs
- **1 point**: Includes 1-2 code examples with sources
- **0 points**: No code examples OR examples lack source attribution OR use wrong syntax/deprecated APIs

#### Validation Checklist:
```
□ Count code blocks in "Technical Deliverables" section
□ Verify each code block has a source URL comment
□ Check for version-specific features in code (not generic patterns)
□ Look for deprecated API usage (red flag)
□ Ensure code uses correct syntax for specified language/version
□ Confirm examples are practical (not trivial "hello world")
```

#### Examples:

**2 Points (Excellent)**:
```markdown
### Server Components in React 19

**Official Documentation**: https://react.dev/reference/rsc/server-components

```tsx
// Server Component - async by default in React 19
// Source: https://react.dev/reference/rsc/server-components
import { db } from '@/lib/db';

export default async function ProductsPage() {
  // Direct database access - only possible in Server Components
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

### Server Actions in React 19

**Official Documentation**: https://react.dev/reference/rsc/use-server

```tsx
// Server Action - use 'use server' directive
// Source: https://react.dev/reference/rsc/use-server
'use server';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;

  // Server-only code
  await db.product.create({
    data: { name }
  });

  revalidatePath('/products');
}
```

### Client Components with use() Hook

**Official Documentation**: https://react.dev/reference/react/use

```tsx
// use() hook - new in React 19
// Source: https://react.dev/reference/react/use
'use client';

import { use } from 'react';

export function ProductDetail({ productPromise }) {
  // use() unwraps promises in client components
  const product = use(productPromise);

  return <div>{product.name}</div>;
}
```
```
(3+ examples, all with source URLs, version-specific features)

**1 Point (Acceptable)**:
```markdown
### Server Components

```tsx
// Source: https://react.dev
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```
```
(1-2 examples, has source)

**0 Points (Fail)**:
```markdown
### Server Components

```tsx
// Server components are async
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```
```
(No source URL)

OR

```markdown
### Server Components

```tsx
// ❌ WRONG - Uses deprecated ReactDOM.render from React 17
// No source cited, outdated API
ReactDOM.render(<App />, document.getElementById('root'));
```
```
(Uses deprecated API)

#### Red Flags (Automatic Fail):
- Uses APIs marked "deprecated" in official docs
- Syntax errors (missing brackets, incorrect keywords)
- Imports from non-existent packages
- Mixes patterns from different versions (e.g., React 17 + React 19)
- Generic "// example code here" placeholders

#### Automated Check:
```python
def validate_examples(specialist_content, version):
    """
    Returns score 0-2 for examples criterion
    """
    code_blocks = extract_code_blocks(specialist_content)

    valid_examples = 0
    for block in code_blocks:
        # Check for source URL in comments
        if 'Source:' in block or 'https://' in block:
            # Check for version-specific features
            if version_specific_features_present(block, version):
                valid_examples += 1

    if valid_examples >= 3:
        return 2
    elif valid_examples >= 1:
        return 1
    else:
        return 0
```

---

### Criterion 4: Collaboration (2 points)

**What We're Measuring**: Does specialist define when to consult other agents?

#### Scoring:
- **2 points**: Specifies 3+ specific scenarios for consulting other specialists
- **1 point**: Specifies 1-2 collaboration scenarios
- **0 points**: No collaboration guidance OR scenarios are too generic

#### Validation Checklist:
```
□ Check "Collaboration Patterns" section exists
□ Count number of specialist consultations defined
□ Ensure scenarios are specific to technology (not generic)
□ Verify at least 3 different specialist types mentioned
□ Confirm scenarios describe actual integration points (not vague)
```

#### Examples:

**2 Points (Excellent)**:
```markdown
## 🤝 Collaboration Patterns

### When to Consult Other Specialists

**Backend Architect** - When you need:
- Design GraphQL schema for React Server Components data fetching
- Implement tRPC endpoints for type-safe React Query integration
- Architect database queries optimized for Server Components streaming

**DevOps Automator** - When you need:
- Configure Next.js 15 edge runtime deployment on Vercel
- Set up ISR (Incremental Static Regeneration) cache invalidation
- Implement React Server Components build optimization in CI/CD

**Security Specialist** - When you need:
- Validate Server Actions against CSRF attacks
- Implement proper authentication in Server Components
- Review RLS (Row Level Security) policies for direct database access

**QA Specialist** - When you need:
- Write tests for Server Components with async data fetching
- Set up React Testing Library for Client Components with use() hook
- Implement E2E tests for Server Actions with Playwright

**TypeScript Specialist** - When you need:
- Type Server Action return values and form data
- Configure TypeScript for Server/Client component boundaries
- Implement Zod schemas for Server Action input validation
```
(5+ specific scenarios, technology-specific integration points)

**1 Point (Acceptable)**:
```markdown
## 🤝 Collaboration Patterns

**Backend Architect** - When you need:
- API design for React application

**DevOps Automator** - When you need:
- Deployment configuration
```
(1-2 scenarios, somewhat generic but present)

**0 Points (Fail)**:
```markdown
## 🤝 Collaboration Patterns

Consult other specialists as needed for their areas of expertise.
```
(Too generic, no specific scenarios)

OR

(Section missing entirely)

#### What Makes a Scenario "Specific":
✅ **Specific**:
- Mentions technology-specific integration (e.g., "GraphQL schema for React Server Components")
- Describes concrete technical situation (e.g., "CSRF attacks on Server Actions")
- References version-specific features (e.g., "Next.js 15 edge runtime")

❌ **Generic**:
- "Ask Backend Architect for API help"
- "Consult DevOps for deployment"
- "Get Security Specialist for security issues"

#### Automated Check:
```python
def validate_collaboration(specialist_content):
    """
    Returns score 0-2 for collaboration criterion
    """
    section = extract_section(specialist_content, "Collaboration Patterns")

    # Count distinct specialist types mentioned
    specialists = set()
    scenarios = 0

    for line in section:
        if '**' in line and 'Specialist' in line:
            specialists.add(extract_specialist_name(line))
        if line.strip().startswith('-'):
            scenarios += 1

    if len(specialists) >= 3 and scenarios >= 3:
        return 2
    elif len(specialists) >= 1 and scenarios >= 1:
        return 1
    else:
        return 0
```

---

### Criterion 5: Freshness (2 points)

**What We're Measuring**: Is content version-specific (not generic or outdated)?

#### Scoring:
- **2 points**: All examples, APIs, and patterns are version-specific
- **1 point**: Mostly current but includes some generic/outdated content
- **0 points**: Uses deprecated APIs OR outdated patterns

#### Validation Checklist:
```
□ Check changelog mentions correct version number
□ Verify "frameworks" section uses current versions
□ Look for version-specific features in examples (e.g., "React 19 use() hook")
□ Check for deprecated API warnings in official docs
□ Ensure patterns match latest official documentation
□ Confirm no "old way vs new way" without clear labels
```

#### Examples:

**2 Points (Excellent)**:
```markdown
---
frameworks:
  react: 19.0.0
  nextjs: 15.1.0
  typescript: 5.7.2
changelog:
  - "1.0.0 (2026-01-07): React 19 specialist - Server Components, use() hook, Server Actions"
---

### React 19 use() Hook

**New in React 19**: The `use()` hook replaces `Suspense` for async data fetching in Client Components.

**Official Documentation**: https://react.dev/reference/react/use

```tsx
// ✅ React 19 pattern - use() hook
'use client';
import { use } from 'react';

export function Product({ productPromise }) {
  const product = use(productPromise);
  return <div>{product.name}</div>;
}
```

**Old Pattern (React 18)**:
```tsx
// ❌ React 18 - No longer needed in React 19
import { Suspense } from 'react';

function Product({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct(productId).then(setProduct);
  }, [productId]);

  if (!product) return <Loading />;
  return <div>{product.name}</div>;
}
```
```
(Clear version labels, uses React 19 features, shows evolution)

**1 Point (Acceptable)**:
```markdown
---
frameworks:
  react: 19.0.0
---

### React Components

```tsx
export default function Component() {
  return <div>Hello</div>;
}
```
```
(Correct version in metadata, but example is generic - works in any React version)

**0 Points (Fail)**:
```markdown
### React Components

```tsx
// ❌ WRONG - Deprecated in React 19
import { render } from 'react-dom';

render(<App />, document.getElementById('root'));
```
```
(Uses deprecated API from React 17)

OR

```markdown
---
frameworks:
  react: 18.0.0  # ❌ WRONG - User requested 19.0.0
---
```
(Wrong version in metadata)

#### Version-Specific Feature Examples:

**React 19 Indicators**:
- `use()` hook
- Server Components
- Server Actions
- `use server` / `use client` directives
- `<form action={serverAction}>`
- Automatic `forwardRef` (no longer needed)

**Next.js 15 Indicators**:
- App Router (not Pages Router)
- Partial Prerendering (PPR)
- `next.config.ts` (TypeScript config)
- Turbopack (not Webpack)
- `unstable_after()` for async tasks

**TypeScript 5.7 Indicators**:
- `satisfies` operator
- `const` type parameters
- Improved type inference

#### Automated Check:
```python
def validate_freshness(specialist_content, requested_version):
    """
    Returns score 0-2 for freshness criterion
    """
    # Extract version from frameworks section
    frameworks = extract_frontmatter_frameworks(specialist_content)

    # Check changelog mentions requested version
    changelog = extract_frontmatter_changelog(specialist_content)

    # Look for deprecated API usage
    deprecated_apis = find_deprecated_apis(specialist_content, requested_version)

    version_correct = frameworks.get('main_tech') == requested_version
    changelog_mentions = requested_version in changelog
    no_deprecated = len(deprecated_apis) == 0

    if version_correct and changelog_mentions and no_deprecated:
        return 2
    elif version_correct or (no_deprecated and changelog_mentions):
        return 1
    else:
        return 0
```

---

## Automated Validation Pipeline

### Step 1: Extract Metadata
```python
def extract_metadata(specialist_content):
    """Parse frontmatter YAML"""
    frontmatter = extract_frontmatter(specialist_content)
    return {
        'name': frontmatter.get('name'),
        'version': frontmatter.get('version'),
        'frameworks': frontmatter.get('frameworks', {}),
        'changelog': frontmatter.get('changelog', [])
    }
```

### Step 2: Run All Validation Checks
```python
def validate_specialist(specialist_content, config):
    """
    Run all 5 quality checks and return score

    Args:
        specialist_content: Generated agent markdown
        config: {
            'official_domain': 'react.dev',
            'requested_version': '19.0.0',
            'technology': 'React'
        }

    Returns:
        {
            'total_score': 8,
            'max_score': 10,
            'passed': True,
            'breakdown': {
                'grounding': {'score': 2, 'max': 2, 'details': '...'},
                'expertise': {'score': 2, 'max': 2, 'details': '...'},
                'examples': {'score': 1, 'max': 2, 'details': '...'},
                'collaboration': {'score': 2, 'max': 2, 'details': '...'},
                'freshness': {'score': 1, 'max': 2, 'details': '...'}
            }
        }
    """
    results = {
        'grounding': validate_grounding(specialist_content, config['official_domain']),
        'expertise': validate_expertise(specialist_content),
        'examples': validate_examples(specialist_content, config['requested_version']),
        'collaboration': validate_collaboration(specialist_content),
        'freshness': validate_freshness(specialist_content, config['requested_version'])
    }

    total_score = sum(r['score'] for r in results.values())

    return {
        'total_score': total_score,
        'max_score': 10,
        'passed': total_score >= 8,
        'breakdown': results
    }
```

### Step 3: Generate Validation Report
```python
def generate_report(validation_results):
    """
    Create human-readable validation report
    """
    report = f"""
QUALITY VALIDATION REPORT
========================

Total Score: {validation_results['total_score']}/10
Status: {'✅ PASS' if validation_results['passed'] else '❌ FAIL'}
Threshold: 8/10

SCORING BREAKDOWN:

1. Grounding: {validation_results['breakdown']['grounding']['score']}/2
   {validation_results['breakdown']['grounding']['details']}

2. Expertise: {validation_results['breakdown']['expertise']['score']}/2
   {validation_results['breakdown']['expertise']['details']}

3. Examples: {validation_results['breakdown']['examples']['score']}/2
   {validation_results['breakdown']['examples']['details']}

4. Collaboration: {validation_results['breakdown']['collaboration']['score']}/2
   {validation_results['breakdown']['collaboration']['details']}

5. Freshness: {validation_results['breakdown']['freshness']['score']}/2
   {validation_results['breakdown']['freshness']['details']}
"""

    if not validation_results['passed']:
        report += generate_remediation_plan(validation_results)

    return report
```

---

## Remediation Strategies

### If Grounding Fails (0-1 points)
**Problem**: Not enough official documentation URLs cited

**Fix**:
1. Re-run Phase 1 (Documentation Research) with broader search
2. Search for: "{technology} {version} API reference"
3. Search for: "{technology} {version} best practices guide"
4. Add URLs to each major section (Core Mission, Technical Deliverables, Anti-Patterns)
5. Ensure URLs point to specific doc pages (not just homepage)

**Target**: Add 2-3 more official doc URLs with specific sections

---

### If Expertise Fails (0-1 points)
**Problem**: Not enough authoritative books/experts referenced

**Fix**:
1. Re-run Phase 2 (Expert/Literature Discovery) with broader search
2. Search: "{technology} O'Reilly book"
3. Search: "{technology} {version} course Udemy"
4. Search: "best {technology} resources 2026"
5. Cross-reference with official documentation "Learn" section
6. If truly no resources exist, document this and reduce threshold to 7/10

**Target**: Find at least 2 authoritative resources with full details

---

### If Examples Fails (0-1 points)
**Problem**: Not enough code examples or examples lack sources

**Fix**:
1. Return to official documentation
2. Find "Examples" or "Tutorial" sections
3. Extract 2-3 more practical code examples
4. Add source URL comment to each: `// Source: {URL}`
5. Verify examples use version-specific features
6. Remove any examples using deprecated APIs

**Target**: Add 2-3 more sourced code examples showing version-specific features

---

### If Collaboration Fails (0-1 points)
**Problem**: Not enough specific collaboration scenarios

**Fix**:
1. Review technology integration points (e.g., React + Backend APIs)
2. For each other specialist type, define specific scenario:
   - **Backend Architect**: API/database integration scenarios
   - **DevOps Automator**: Deployment/build scenarios
   - **Security Specialist**: Auth/security scenarios specific to technology
   - **QA Specialist**: Testing scenarios for version-specific features
   - **TypeScript Specialist**: Type safety scenarios
3. Make scenarios technology-specific (not generic)

**Target**: Add 2-3 more specific collaboration scenarios

---

### If Freshness Fails (0-1 points)
**Problem**: Content is generic or uses outdated patterns

**Fix**:
1. Review version release notes/changelog
2. Identify version-specific features (e.g., "React 19 use() hook")
3. Replace generic examples with version-specific ones
4. Add "New in {VERSION}" labels to new features
5. Remove or label deprecated patterns as "Old Pattern"
6. Update frameworks section with exact version numbers

**Target**: Replace 2-3 generic examples with version-specific ones

---

## Pass/Fail Decision Tree

```
Calculate Total Score
         |
         ▼
    Score >= 8/10?
         |
    ┌────┴────┐
    |         |
   YES       NO
    |         |
    ▼         ▼
  PASS    Retry Count < 2?
            |
       ┌────┴────┐
       |         |
      YES       NO
       |         |
       ▼         ▼
   Identify   Output with
   Failing    Diagnostic
  Criteria    Report
       |
       ▼
  Regenerate
   Failing
   Sections
       |
       ▼
  Re-validate
       |
       ▼
  Increment
 Retry Count
       |
       ▼
  (Loop back to
   "Score >= 8?")
```

---

## Quality Gate Summary Table

| Criterion | 2 Points | 1 Point | 0 Points | Automated Check |
|-----------|----------|---------|----------|-----------------|
| **Grounding** | 3+ official doc URLs cited | 1-2 official doc URLs | No URLs or broken URLs | Count & verify URLs |
| **Expertise** | 2-3 authoritative resources with details | 1 authoritative resource | No resources or missing details | Parse "Authoritative Resources" section |
| **Examples** | 3+ sourced, version-specific code examples | 1-2 sourced examples | No examples or missing sources | Count code blocks with source URLs |
| **Collaboration** | 3+ specific specialist scenarios | 1-2 scenarios | No scenarios or too generic | Count specialist consultations |
| **Freshness** | All content version-specific | Mostly current, some generic | Deprecated APIs or wrong version | Check version numbers & APIs |

**Pass Threshold**: 8/10 (can score 1 point on up to 2 criteria and still pass)

**Retry Logic**: Up to 2 regeneration attempts for failing criteria

**Fallback**: If still fails after retries, output with diagnostic report for manual editing

---

## Manual Quality Review Checklist

Use this checklist for manual review if automated validation is unavailable:

### Grounding Review
- [ ] At least 3 official documentation URLs cited
- [ ] URLs are scattered throughout document (not all in one section)
- [ ] URLs resolve and point to correct version
- [ ] Specific doc pages cited (not just homepage)

### Expertise Review
- [ ] "Authoritative Resources" section exists
- [ ] At least 2 resources listed
- [ ] Each resource has: Title, Author, Year, Why Authoritative
- [ ] Resources are recent (2024-2026) OR version-compatible
- [ ] Authors are recognized experts (verifiable via search)

### Examples Review
- [ ] At least 3 code examples in "Technical Deliverables"
- [ ] Each example has source URL comment
- [ ] Examples use version-specific features
- [ ] No deprecated APIs used
- [ ] Syntax is correct for specified language/version
- [ ] Examples are practical (not trivial)

### Collaboration Review
- [ ] "Collaboration Patterns" section exists
- [ ] At least 3 specialist types mentioned
- [ ] At least 3 specific scenarios described
- [ ] Scenarios are technology-specific (not generic)
- [ ] Scenarios describe actual integration points

### Freshness Review
- [ ] Frontmatter `frameworks` section has correct versions
- [ ] Changelog mentions requested version
- [ ] Examples show version-specific features
- [ ] No deprecated APIs present
- [ ] Version-specific features labeled (e.g., "New in {VERSION}")

**Manual Scoring**: Add up points for each criterion (0-2 per criterion)

**Pass/Fail**: 8+ points = PASS, <8 points = FAIL (needs editing)

---

## Appendix: Common Failure Patterns

### Pattern 1: Generic Content Syndrome
**Symptom**: Specialist could apply to any version of the technology
**Example**: React specialist that doesn't mention Server Components (React 19 feature)
**Fix**: Add version-specific features from release notes

### Pattern 2: Hallucinated Best Practices
**Symptom**: Claims about "best practices" without documentation source
**Example**: "Always use custom hooks for data fetching" (opinion, not official guidance)
**Fix**: Remove unsourced claims or find official documentation support

### Pattern 3: Outdated Examples
**Symptom**: Code examples use deprecated APIs
**Example**: `ReactDOM.render()` in React 19 specialist (deprecated in React 18)
**Fix**: Replace with current API from official docs

### Pattern 4: Missing Sources
**Symptom**: Code examples without source attribution
**Example**: Code blocks with no `// Source:` comment
**Fix**: Add source URL to each example

### Pattern 5: Vague Collaboration
**Symptom**: Generic collaboration guidance
**Example**: "Consult Backend Architect for API issues"
**Fix**: Make technology-specific: "Consult Backend Architect for tRPC endpoint design with React Server Components"

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-07
**Quality Standard**: 8/10 minimum for production-ready specialists
