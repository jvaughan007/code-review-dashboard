import { describe, it, expect, beforeEach } from 'vitest';
import { PatternEngine } from './engine';

describe('Pattern Engine - RED PHASE', () => {
  let engine: PatternEngine;

  beforeEach(() => {
    engine = new PatternEngine();
  });

  describe('Regex Pattern Matching', () => {
    it('should detect console.log in added lines', async () => {
      // Arrange
      const code = "console.log('debug');";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 3, content: "console.log('debug');" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].ruleId).toBe('no-console-log');
      expect(suggestions[0].severity).toBe('warning');
      expect(suggestions[0].lineNumber).toBe(3);
    });

    it('should NOT detect console.log in test files (exclude pattern)', async () => {
      // Arrange
      const code = "console.log('test debug');";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 3, content: "console.log('test debug');" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.test.js');

      // Assert - should be filtered out by exclude pattern
      expect(suggestions).toHaveLength(0);
    });

    it('should detect hardcoded API keys', async () => {
      // Arrange
      const code = "const apiKey = 'sk-1234567890abcdef';";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: "const apiKey = 'sk-1234567890abcdef';" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/config.js');

      // Assert
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      const secretSuggestion = suggestions.find(s => s.ruleId === 'hardcoded-secrets');
      expect(secretSuggestion).toBeDefined();
      expect(secretSuggestion?.severity).toBe('error');
    });

    it('should detect var instead of const/let', async () => {
      // Arrange
      const code = 'var x = 10;';
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: 'var x = 10;' }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/old.js');

      // Assert
      const varSuggestion = suggestions.find(s => s.ruleId === 'no-var');
      expect(varSuggestion).toBeDefined();
      expect(varSuggestion?.severity).toBe('info');
    });

    it('should only analyze added lines (not removed lines)', async () => {
      // Arrange
      const code = "console.log('new');";
      const diffLines = [
        { type: 'deletion' as const, lineNumber: 1, content: "console.log('old');" }, // Should be ignored
        { type: 'addition' as const, lineNumber: 2, content: "console.log('new');" },  // Should trigger
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert - only 1 suggestion (from added line)
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].lineNumber).toBe(2);
    });
  });

  describe('Language Filtering', () => {
    it('should only run JavaScript rules on JavaScript files', async () => {
      // Arrange - Python file
      const code = "print('hello')";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: "console.log('should not match');" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'python', 'src/main.py');

      // Assert - no JavaScript rules should run
      const jsSuggestions = suggestions.filter(s => s.ruleId === 'no-console-log');
      expect(jsSuggestions).toHaveLength(0);
    });

    it('should support TypeScript files', async () => {
      // Arrange
      const code = "const x: number = 10; console.log(x);";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: 'const x: number = 10; console.log(x);' }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'typescript', 'src/app.ts');

      // Assert
      const consoleSuggestion = suggestions.find(s => s.ruleId === 'no-console-log');
      expect(consoleSuggestion).toBeDefined();
    });
  });

  describe('Rule Loading', () => {
    it('should load rules from configuration', async () => {
      // Act
      await engine.loadRules();

      // Assert
      const rules = engine.getRules();
      expect(rules).toBeDefined();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should have at least 10 core pattern rules', async () => {
      // Act
      await engine.loadRules();

      // Assert
      const rules = engine.getRules();
      expect(rules.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty diff lines', async () => {
      // Arrange
      const code = 'function test() {}';
      const diffLines: { type: 'addition' | 'deletion' | 'context'; lineNumber: number; content: string }[] = [];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert
      expect(suggestions).toHaveLength(0);
    });

    it('should handle large files (500+ lines)', async () => {
      // Arrange
      const lines = Array.from({ length: 500 }, (_, i) => `const x${i} = ${i};`);
      const code = lines.join('\n') + "\nconsole.log('test');";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 501, content: "console.log('test');" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/large.js');

      // Assert - should still work
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple rules matching same line', async () => {
      // Arrange - var + console.log on same line
      const code = "var x = 10; console.log(x);";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: "var x = 10; console.log(x);" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert - should detect both patterns
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
      const ruleIds = suggestions.map(s => s.ruleId);
      expect(ruleIds).toContain('no-console-log');
      expect(ruleIds).toContain('no-var');
    });

    it('should handle regex special characters in code', async () => {
      // Arrange - code with regex special chars
      const code = "const regex = /test.*/;";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: "const regex = /test.*/;" }
      ];

      // Act - should not crash
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert
      expect(suggestions).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete analysis in under 2 seconds for 500 lines', async () => {
      // Arrange
      const lines = Array.from({ length: 500 }, (_, i) => `const x${i} = ${i};`);
      const code = lines.join('\n');
      const diffLines = lines.map((content, i) => ({
        type: 'addition' as const,
        lineNumber: i + 1,
        content,
      }));

      // Act
      const start = Date.now();
      await engine.analyze(code, diffLines, 'javascript', 'src/large.js');
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Suggestion Structure', () => {
    it('should return suggestions with required fields', async () => {
      // Arrange
      const code = "console.log('test');";
      const diffLines = [
        { type: 'addition' as const, lineNumber: 1, content: "console.log('test');" }
      ];

      // Act
      const suggestions = await engine.analyze(code, diffLines, 'javascript', 'src/app.js');

      // Assert
      expect(suggestions.length).toBeGreaterThan(0);
      const suggestion = suggestions[0];
      expect(suggestion).toHaveProperty('ruleId');
      expect(suggestion).toHaveProperty('ruleName');
      expect(suggestion).toHaveProperty('message');
      expect(suggestion).toHaveProperty('severity');
      expect(suggestion).toHaveProperty('lineNumber');
      expect(suggestion).toHaveProperty('category');
    });
  });
});

// Expected Result: ALL TESTS FAIL (PatternEngine class doesn't exist yet)
