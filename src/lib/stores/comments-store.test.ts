import { describe, it, expect, beforeEach } from 'vitest';
import { useCommentsStore, type Comment } from './comments-store';

/**
 * Comments Store Tests
 *
 * Tests the Zustand store that manages comments state
 * including threading, optimistic updates, and error handling.
 */

// Helper to create mock comment
const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment-1',
  pr_id: 'owner/repo/1',
  user_id: 'user-1',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  parent_comment_id: null,
  body: 'This is a test comment',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Line-specific fields (null = PR-level comment)
  file_path: null,
  line_number: null,
  line_type: null,
  line_content: null,
  ...overrides,
});

describe('Comments Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCommentsStore.setState({
      commentsByPR: new Map(),
    });
  });

  describe('setComments', () => {
    it('should set comments for a PR', () => {
      const store = useCommentsStore.getState();
      const comments = [createMockComment(), createMockComment({ id: 'comment-2' })];

      store.setComments('owner/repo/1', comments);

      expect(store.getComments('owner/repo/1')).toHaveLength(2);
    });

    it('should replace existing comments', () => {
      const store = useCommentsStore.getState();

      // Set initial comments
      store.setComments('owner/repo/1', [createMockComment()]);

      // Replace with new comments
      store.setComments('owner/repo/1', [createMockComment({ id: 'new-comment' })]);

      const result = store.getComments('owner/repo/1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('new-comment');
    });
  });

  describe('addComment', () => {
    it('should add a comment to existing PR', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [createMockComment()]);
      store.addComment('owner/repo/1', createMockComment({ id: 'comment-2' }));

      expect(store.getComments('owner/repo/1')).toHaveLength(2);
    });

    it('should add comment to new PR', () => {
      const store = useCommentsStore.getState();

      store.addComment('owner/repo/99', createMockComment({ pr_id: 'owner/repo/99' }));

      expect(store.getComments('owner/repo/99')).toHaveLength(1);
    });
  });

  describe('deleteComment', () => {
    it('should remove comment by ID', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'comment-1' }),
        createMockComment({ id: 'comment-2' }),
      ]);

      store.deleteComment('comment-1');

      const result = store.getComments('owner/repo/1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('comment-2');
    });
  });

  describe('updateComment', () => {
    it('should update comment body', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [createMockComment({ id: 'comment-1', body: 'Original' })]);
      store.updateComment('comment-1', 'Updated body');

      const result = store.getComments('owner/repo/1');
      expect(result[0].body).toBe('Updated body');
    });

    it('should update updated_at timestamp', () => {
      const store = useCommentsStore.getState();
      const originalDate = '2026-01-01T00:00:00Z';

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'comment-1', updated_at: originalDate }),
      ]);
      store.updateComment('comment-1', 'New body');

      const result = store.getComments('owner/repo/1');
      expect(result[0].updated_at).not.toBe(originalDate);
    });
  });

  describe('getTopLevelComments', () => {
    it('should return only comments without parent', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'top-1', parent_comment_id: null }),
        createMockComment({ id: 'reply-1', parent_comment_id: 'top-1' }),
        createMockComment({ id: 'top-2', parent_comment_id: null }),
      ]);

      const result = store.getTopLevelComments('owner/repo/1');
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.parent_comment_id === null)).toBe(true);
    });
  });

  describe('getReplies', () => {
    it('should return replies for a specific parent', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'top-1', parent_comment_id: null }),
        createMockComment({ id: 'reply-1', parent_comment_id: 'top-1' }),
        createMockComment({ id: 'reply-2', parent_comment_id: 'top-1' }),
        createMockComment({ id: 'reply-3', parent_comment_id: 'top-2' }),
      ]);

      const result = store.getReplies('owner/repo/1', 'top-1');
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.parent_comment_id === 'top-1')).toBe(true);
    });

    it('should return empty array if no replies', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'top-1', parent_comment_id: null }),
      ]);

      const result = store.getReplies('owner/repo/1', 'top-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('getCommentCount', () => {
    it('should return total count of comments', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: '1' }),
        createMockComment({ id: '2' }),
        createMockComment({ id: '3' }),
      ]);

      expect(store.getCommentCount('owner/repo/1')).toBe(3);
    });

    it('should return 0 for unknown PR', () => {
      const store = useCommentsStore.getState();

      expect(store.getCommentCount('unknown/repo/999')).toBe(0);
    });
  });

  describe('Optimistic UI', () => {
    it('should mark comment as error', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: '1', tempId: 'temp-123', isPending: true }),
      ]);

      store.markError('temp-123', true);

      const result = store.getComments('owner/repo/1');
      expect(result[0].isError).toBe(true);
      expect(result[0].isPending).toBe(false);
    });

    it('should replace optimistic comment with real comment', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'temp-id', tempId: 'temp-123', isPending: true }),
      ]);

      const realComment = createMockComment({ id: 'real-id-from-server' });
      store.replaceOptimistic('temp-123', realComment);

      const result = store.getComments('owner/repo/1');
      expect(result[0].id).toBe('real-id-from-server');
      expect(result[0].isPending).toBeUndefined();
    });
  });

  describe('clearComments', () => {
    it('should clear all comments for a PR', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [createMockComment(), createMockComment({ id: '2' })]);
      expect(store.getCommentCount('owner/repo/1')).toBe(2);

      store.clearComments('owner/repo/1');

      expect(store.getComments('owner/repo/1')).toHaveLength(0);
    });
  });

  // Line-specific comment tests (Sprint 3)
  describe('getLineComments', () => {
    it('should return comments for a specific line', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({
          id: 'line-comment-1',
          file_path: 'src/app.tsx',
          line_number: 42,
          line_type: 'addition',
        }),
        createMockComment({
          id: 'line-comment-2',
          file_path: 'src/app.tsx',
          line_number: 42,
          line_type: 'addition',
        }),
        createMockComment({
          id: 'line-comment-3',
          file_path: 'src/app.tsx',
          line_number: 50,
          line_type: 'deletion',
        }),
        createMockComment({ id: 'pr-comment', file_path: null, line_number: null }),
      ]);

      const result = store.getLineComments('owner/repo/1', 'src/app.tsx', 42);
      expect(result).toHaveLength(2);
      expect(result.every((c) => c.line_number === 42)).toBe(true);
    });

    it('should return empty array for line with no comments', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'pr-comment', file_path: null, line_number: null }),
      ]);

      const result = store.getLineComments('owner/repo/1', 'src/app.tsx', 100);
      expect(result).toHaveLength(0);
    });

    it('should exclude replies from line comments', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({
          id: 'line-comment-1',
          file_path: 'src/app.tsx',
          line_number: 42,
          parent_comment_id: null,
        }),
        createMockComment({
          id: 'reply-1',
          file_path: 'src/app.tsx',
          line_number: 42,
          parent_comment_id: 'line-comment-1',
        }),
      ]);

      const result = store.getLineComments('owner/repo/1', 'src/app.tsx', 42);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('line-comment-1');
    });
  });

  describe('getLineCommentCount', () => {
    it('should return count of all comments on a line including replies', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({
          id: 'line-comment-1',
          file_path: 'src/app.tsx',
          line_number: 42,
        }),
        createMockComment({
          id: 'reply-1',
          file_path: 'src/app.tsx',
          line_number: 42,
          parent_comment_id: 'line-comment-1',
        }),
      ]);

      expect(store.getLineCommentCount('owner/repo/1', 'src/app.tsx', 42)).toBe(2);
    });

    it('should return 0 for line with no comments', () => {
      const store = useCommentsStore.getState();

      expect(store.getLineCommentCount('owner/repo/1', 'src/app.tsx', 999)).toBe(0);
    });
  });

  describe('getFileCommentSummary', () => {
    it('should return map of line numbers to comment counts', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: '1', file_path: 'src/app.tsx', line_number: 10 }),
        createMockComment({ id: '2', file_path: 'src/app.tsx', line_number: 10 }),
        createMockComment({ id: '3', file_path: 'src/app.tsx', line_number: 20 }),
        createMockComment({ id: '4', file_path: 'src/other.tsx', line_number: 10 }),
        createMockComment({ id: '5', file_path: null, line_number: null }),
      ]);

      const summary = store.getFileCommentSummary('owner/repo/1', 'src/app.tsx');

      expect(summary.size).toBe(2);
      expect(summary.get(10)).toBe(2);
      expect(summary.get(20)).toBe(1);
    });

    it('should return empty map for file with no comments', () => {
      const store = useCommentsStore.getState();

      const summary = store.getFileCommentSummary('owner/repo/1', 'nonexistent.tsx');

      expect(summary.size).toBe(0);
    });
  });

  describe('getPRLevelComments', () => {
    it('should return only PR-level comments (no file_path)', () => {
      const store = useCommentsStore.getState();

      store.setComments('owner/repo/1', [
        createMockComment({ id: 'pr-1', file_path: null, line_number: null }),
        createMockComment({ id: 'pr-2', file_path: null, line_number: null }),
        createMockComment({
          id: 'line-1',
          file_path: 'src/app.tsx',
          line_number: 42,
        }),
        createMockComment({
          id: 'reply-1',
          parent_comment_id: 'pr-1',
          file_path: null,
          line_number: null,
        }),
      ]);

      const result = store.getPRLevelComments('owner/repo/1');

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.file_path === null && c.parent_comment_id === null)).toBe(true);
    });
  });
});
