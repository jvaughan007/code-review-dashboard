/**
 * Pattern Engine - Static code analysis without external APIs
 *
 * Architecture: 100% client-side, zero-cost
 * - Regex-based pattern matching
 * - Language-specific rules
 * - Configurable severity levels
 *
 * Sprint 7: Static Code Pattern Suggestions
 * - Detects common code issues in diffs
 * - Supports JavaScript, TypeScript, Python, Go
 * - Only analyzes added lines (not deletions)
 */

export type Severity = 'error' | 'warning' | 'info';
export type Category = 'security' | 'performance' | 'style' | 'best-practice';

export interface DiffLine {
  type: 'addition' | 'deletion' | 'context';
  lineNumber: number;
  content: string;
}

export interface PatternRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: Severity;
  category: Category;
  languages: string[];
  excludePatterns?: RegExp[];
  suggestion?: string;
}

export interface Suggestion {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: Severity;
  category: Category;
  lineNumber: number;
  lineContent: string;
  suggestion?: string;
}

// Core pattern rules
const CORE_RULES: PatternRule[] = [
  // Security
  {
    id: 'hardcoded-secrets',
    name: 'Hardcoded Secrets',
    description: 'Detects potential hardcoded API keys, tokens, and secrets',
    pattern: /['"]sk-[a-zA-Z0-9]{8,}['"]|api[_-]?key\s*[:=]\s*['"][^'"]{8,}['"]|secret\s*[:=]\s*['"][^'"]{8,}['"]|password\s*[:=]\s*['"][^'"]{8,}['"]|token\s*[:=]\s*['"][^'"]{8,}['"]/i,
    severity: 'error',
    category: 'security',
    languages: ['javascript', 'typescript', 'python', 'go'],
    suggestion: 'Use environment variables or a secrets manager instead.',
  },
  {
    id: 'sql-injection',
    name: 'Potential SQL Injection',
    description: 'Detects string concatenation in SQL queries',
    pattern: /query\s*\(\s*['"`].*\$\{|execute\s*\(\s*['"`].*\+|sql\s*[:=]\s*['"`].*\+/i,
    severity: 'error',
    category: 'security',
    languages: ['javascript', 'typescript'],
    suggestion: 'Use parameterized queries instead of string concatenation.',
  },

  // Best Practices - JavaScript/TypeScript
  {
    id: 'no-console-log',
    name: 'Console Log',
    description: 'console.log should not be committed to production code',
    pattern: /console\.(log|debug|info)\s*\(/,
    severity: 'warning',
    category: 'best-practice',
    languages: ['javascript', 'typescript'],
    excludePatterns: [/\.test\.(js|ts|tsx)$/, /\.spec\.(js|ts|tsx)$/, /__tests__/],
    suggestion: 'Remove console.log or use a proper logging library.',
  },
  {
    id: 'no-var',
    name: 'Use const/let',
    description: 'var declarations should be replaced with const or let',
    pattern: /\bvar\s+\w+/,
    severity: 'info',
    category: 'style',
    languages: ['javascript', 'typescript'],
    suggestion: 'Use const for constants, let for variables that change.',
  },
  {
    id: 'no-any',
    name: 'Avoid any Type',
    description: 'any type defeats TypeScript type checking',
    pattern: /:\s*any\b/,
    severity: 'warning',
    category: 'best-practice',
    languages: ['typescript'],
    suggestion: 'Use a specific type or unknown instead of any.',
  },
  {
    id: 'no-debugger',
    name: 'Debugger Statement',
    description: 'debugger statements should not be committed',
    pattern: /\bdebugger\b/,
    severity: 'error',
    category: 'best-practice',
    languages: ['javascript', 'typescript'],
    suggestion: 'Remove debugger statement before committing.',
  },

  // Performance
  {
    id: 'no-await-in-loop',
    name: 'Await in Loop',
    description: 'await in loops can cause performance issues',
    pattern: /for\s*\([^)]*\)\s*\{[^}]*await\s+|while\s*\([^)]*\)\s*\{[^}]*await\s+/,
    severity: 'warning',
    category: 'performance',
    languages: ['javascript', 'typescript'],
    suggestion: 'Use Promise.all() for parallel execution.',
  },
  {
    id: 'no-new-in-loop',
    name: 'Object Creation in Loop',
    description: 'Creating objects in loops can be slow',
    pattern: /for\s*\([^)]*\)\s*\{[^}]*new\s+(RegExp|Date|Array)\(/,
    severity: 'info',
    category: 'performance',
    languages: ['javascript', 'typescript'],
    suggestion: 'Move object creation outside the loop.',
  },

  // React-specific
  {
    id: 'no-inline-styles',
    name: 'Inline Styles',
    description: 'Inline styles can cause performance issues in React',
    pattern: /style\s*=\s*\{\s*\{/,
    severity: 'info',
    category: 'performance',
    languages: ['javascript', 'typescript'],
    excludePatterns: [/\.test\.(js|ts|tsx)$/],
    suggestion: 'Use CSS classes or styled-components instead.',
  },
  {
    id: 'missing-key-prop',
    name: 'Missing Key Prop',
    description: 'List items should have unique key props',
    pattern: /\.map\s*\([^)]*\)\s*=>\s*<(?!.*\bkey\s*=)/,
    severity: 'warning',
    category: 'best-practice',
    languages: ['javascript', 'typescript'],
    suggestion: 'Add a unique key prop to list items.',
  },

  // Python-specific
  {
    id: 'python-print',
    name: 'Print Statement',
    description: 'print() should not be in production code',
    pattern: /\bprint\s*\(/,
    severity: 'warning',
    category: 'best-practice',
    languages: ['python'],
    excludePatterns: [/test_.*\.py$/, /_test\.py$/],
    suggestion: 'Use logging module instead of print().',
  },
  {
    id: 'python-eval',
    name: 'Eval Usage',
    description: 'eval() is a security risk',
    pattern: /\beval\s*\(/,
    severity: 'error',
    category: 'security',
    languages: ['python'],
    suggestion: 'Avoid eval(). Use ast.literal_eval() for safe parsing.',
  },

  // Go-specific
  {
    id: 'go-fmt-println',
    name: 'fmt.Println',
    description: 'fmt.Println should not be in production code',
    pattern: /fmt\.(Print|Println|Printf)\s*\(/,
    severity: 'warning',
    category: 'best-practice',
    languages: ['go'],
    excludePatterns: [/_test\.go$/],
    suggestion: 'Use a proper logging library instead.',
  },
];

export class PatternEngine {
  private rules: PatternRule[] = [];

  constructor() {
    // Auto-load core rules
    this.rules = [...CORE_RULES];
  }

  async loadRules(): Promise<void> {
    // Rules are loaded in constructor, this is for async compatibility
    // This method exists for future extensibility (loading custom rules)
  }

  getRules(): PatternRule[] {
    return this.rules;
  }

  async analyze(
    _code: string, // Full file code (reserved for future AST analysis)
    diffLines: DiffLine[],
    language: string,
    filePath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Normalize language
    const normalizedLanguage = this.normalizeLanguage(language);

    // Filter rules for this language
    const applicableRules = this.rules.filter((rule) =>
      rule.languages.includes(normalizedLanguage)
    );

    // Only analyze added lines
    const addedLines = diffLines.filter((line) => line.type === 'addition');

    for (const line of addedLines) {
      for (const rule of applicableRules) {
        // Check exclude patterns (file-level)
        if (rule.excludePatterns) {
          const isExcluded = rule.excludePatterns.some((pattern) =>
            pattern.test(filePath)
          );
          if (isExcluded) continue;
        }

        // Check if pattern matches
        if (rule.pattern.test(line.content)) {
          suggestions.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: rule.description,
            severity: rule.severity,
            category: rule.category,
            lineNumber: line.lineNumber,
            lineContent: line.content,
            suggestion: rule.suggestion,
          });
        }
      }
    }

    return suggestions;
  }

  private normalizeLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      golang: 'go',
    };

    const lower = language.toLowerCase();
    return languageMap[lower] || lower;
  }
}
