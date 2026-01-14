/**
 * Diff Parser - Parses git diff patches into structured line data
 * for virtualization and line-by-line rendering
 */

export interface DiffLine {
  lineNumber: number | null; // null for context lines without numbers
  oldLineNumber: number | null;
  newLineNumber: number | null;
  type: "context" | "addition" | "deletion" | "header";
  content: string;
  rawLine: string;
}

export interface ParsedDiff {
  lines: DiffLine[];
  totalLines: number;
  additions: number;
  deletions: number;
}

/**
 * Parse a unified diff patch into structured line data
 */
export function parseDiffPatch(patch: string): ParsedDiff {
  const lines: DiffLine[] = [];
  const patchLines = patch.split("\n");

  let oldLineNum = 0;
  let newLineNum = 0;
  let additions = 0;
  let deletions = 0;

  for (const line of patchLines) {
    // Skip empty lines at the end
    if (line === "" && patchLines.indexOf(line) === patchLines.length - 1) {
      continue;
    }

    // Hunk header: @@ -1,5 +1,7 @@
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNum = parseInt(match[1], 10);
        newLineNum = parseInt(match[2], 10);
      }

      lines.push({
        lineNumber: null,
        oldLineNumber: null,
        newLineNumber: null,
        type: "header",
        content: line,
        rawLine: line,
      });
      continue;
    }

    // Addition line
    if (line.startsWith("+")) {
      additions++;
      lines.push({
        lineNumber: newLineNum,
        oldLineNumber: null,
        newLineNumber: newLineNum,
        type: "addition",
        content: line.slice(1),
        rawLine: line,
      });
      newLineNum++;
      continue;
    }

    // Deletion line
    if (line.startsWith("-")) {
      deletions++;
      lines.push({
        lineNumber: oldLineNum,
        oldLineNumber: oldLineNum,
        newLineNumber: null,
        type: "deletion",
        content: line.slice(1),
        rawLine: line,
      });
      oldLineNum++;
      continue;
    }

    // Context line (starts with space or no prefix)
    const content = line.startsWith(" ") ? line.slice(1) : line;
    lines.push({
      lineNumber: newLineNum, // Use new line number for context
      oldLineNumber: oldLineNum,
      newLineNumber: newLineNum,
      type: "context",
      content,
      rawLine: line,
    });
    oldLineNum++;
    newLineNum++;
  }

  return {
    lines,
    totalLines: lines.length,
    additions,
    deletions,
  };
}

/**
 * Count the number of lines in a diff patch
 */
export function countDiffLines(patch: string): number {
  if (!patch) return 0;
  return patch.split("\n").length;
}

/**
 * Check if a diff should be virtualized based on line count
 */
export function shouldVirtualize(patch: string, threshold: number = 500): boolean {
  return countDiffLines(patch) >= threshold;
}
