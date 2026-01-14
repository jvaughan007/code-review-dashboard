import { describe, it, expect } from "vitest";
import { parseDiffPatch, countDiffLines, shouldVirtualize } from "./diff-parser";

describe("diff-parser", () => {
  describe("parseDiffPatch", () => {
    it("should parse a simple diff patch", () => {
      const patch = `@@ -1,3 +1,4 @@
 line 1
+added line
 line 2
 line 3`;

      const result = parseDiffPatch(patch);

      expect(result.totalLines).toBe(5);
      expect(result.additions).toBe(1);
      expect(result.deletions).toBe(0);
    });

    it("should parse additions correctly", () => {
      const patch = `@@ -1,2 +1,4 @@
 context
+new line 1
+new line 2
 more context`;

      const result = parseDiffPatch(patch);
      const additionLines = result.lines.filter((l) => l.type === "addition");

      expect(additionLines.length).toBe(2);
      expect(additionLines[0].content).toBe("new line 1");
      expect(additionLines[1].content).toBe("new line 2");
    });

    it("should parse deletions correctly", () => {
      const patch = `@@ -1,4 +1,2 @@
 context
-deleted line 1
-deleted line 2
 more context`;

      const result = parseDiffPatch(patch);
      const deletionLines = result.lines.filter((l) => l.type === "deletion");

      expect(deletionLines.length).toBe(2);
      expect(result.deletions).toBe(2);
    });

    it("should parse hunk headers", () => {
      const patch = `@@ -10,5 +15,7 @@
 context line`;

      const result = parseDiffPatch(patch);
      const headerLine = result.lines.find((l) => l.type === "header");

      expect(headerLine).toBeDefined();
      expect(headerLine?.content).toBe("@@ -10,5 +15,7 @@");
    });

    it("should track line numbers correctly", () => {
      const patch = `@@ -1,3 +1,4 @@
 line 1
+added
 line 2
 line 3`;

      const result = parseDiffPatch(patch);

      // Context line 1 should be line 1 in both old and new
      const contextLine1 = result.lines[1];
      expect(contextLine1.oldLineNumber).toBe(1);
      expect(contextLine1.newLineNumber).toBe(1);

      // Added line should only have new line number
      const addedLine = result.lines[2];
      expect(addedLine.oldLineNumber).toBe(null);
      expect(addedLine.newLineNumber).toBe(2);
    });

    it("should handle empty patch", () => {
      const result = parseDiffPatch("");
      expect(result.totalLines).toBe(0);
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(0);
    });
  });

  describe("countDiffLines", () => {
    it("should count lines in a patch", () => {
      const patch = `line1
line2
line3`;
      expect(countDiffLines(patch)).toBe(3);
    });

    it("should return 0 for empty patch", () => {
      expect(countDiffLines("")).toBe(0);
    });
  });

  describe("shouldVirtualize", () => {
    it("should return true for large diffs", () => {
      const largePatch = Array(600).fill("line").join("\n");
      expect(shouldVirtualize(largePatch, 500)).toBe(true);
    });

    it("should return false for small diffs", () => {
      const smallPatch = Array(100).fill("line").join("\n");
      expect(shouldVirtualize(smallPatch, 500)).toBe(false);
    });

    it("should use custom threshold", () => {
      const patch = Array(50).fill("line").join("\n");
      expect(shouldVirtualize(patch, 40)).toBe(true);
      expect(shouldVirtualize(patch, 60)).toBe(false);
    });
  });
});
