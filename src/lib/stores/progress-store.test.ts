import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore, ReviewStatus } from './progress-store';

describe('Progress Store - RED PHASE', () => {
  beforeEach(() => {
    // Reset store between tests
    useProgressStore.setState({
      progressByPR: {},
      isLoading: false,
    });
  });

  describe('setProgress', () => {
    it('should store progress for a PR', () => {
      // Arrange
      const prId = 'test-pr-1';
      const progress = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'src/app.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' }
      ];

      // Act
      useProgressStore.getState().setProgress(prId, progress);

      // Assert
      const stored = useProgressStore.getState().getProgressForPR(prId);
      expect(stored).toHaveLength(1);
      expect(stored[0].file_path).toBe('src/app.ts');
    });
  });

  describe('updateFileProgress', () => {
    it('should update existing file progress', () => {
      // Arrange
      const prId = 'test-pr-1';
      const existing = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'src/app.ts', status: 'in_progress' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' }
      ];
      useProgressStore.getState().setProgress(prId, existing);

      // Act
      useProgressStore.getState().updateFileProgress(prId, 'src/app.ts', 'completed');

      // Assert
      const updated = useProgressStore.getState().getProgressForPR(prId);
      expect(updated[0].status).toBe('completed');
    });

    it('should add new file progress if not exists', () => {
      // Arrange
      const prId = 'test-pr-1';

      // Act
      useProgressStore.getState().updateFileProgress(prId, 'src/new.ts', 'in_progress');

      // Assert
      const progress = useProgressStore.getState().getProgressForPR(prId);
      expect(progress).toHaveLength(1);
      expect(progress[0].file_path).toBe('src/new.ts');
      expect(progress[0].status).toBe('in_progress');
    });
  });

  describe('getFileStatus', () => {
    it('should return file status if exists', () => {
      // Arrange
      const prId = 'test-pr-1';
      const progress = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'src/app.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' }
      ];
      useProgressStore.getState().setProgress(prId, progress);

      // Act
      const status = useProgressStore.getState().getFileStatus(prId, 'src/app.ts');

      // Assert
      expect(status).toBe('completed');
    });

    it('should return "not_started" if file not found', () => {
      // Arrange
      const prId = 'test-pr-1';

      // Act
      const status = useProgressStore.getState().getFileStatus(prId, 'src/missing.ts');

      // Assert
      expect(status).toBe('not_started');
    });
  });

  describe('getPRProgress', () => {
    it('should calculate PR progress correctly', () => {
      // Arrange
      const prId = 'test-pr-1';
      const progress = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'file1.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' },
        { id: '2', pr_id: prId, user_id: 'user1', file_path: 'file2.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' },
        { id: '3', pr_id: prId, user_id: 'user1', file_path: 'file3.ts', status: 'in_progress' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' },
      ];
      useProgressStore.getState().setProgress(prId, progress);

      // Act
      const prProgress = useProgressStore.getState().getPRProgress(prId, 5); // 5 total files

      // Assert
      expect(prProgress.completed).toBe(2);
      expect(prProgress.in_progress).toBe(1);
      expect(prProgress.not_started).toBe(2);
      expect(prProgress.total_files).toBe(5);
      expect(prProgress.percentage).toBe(40); // 2/5 = 40%
    });

    it('should handle empty progress (all not started)', () => {
      // Arrange
      const prId = 'test-pr-1';

      // Act
      const prProgress = useProgressStore.getState().getPRProgress(prId, 10);

      // Assert
      expect(prProgress.completed).toBe(0);
      expect(prProgress.in_progress).toBe(0);
      expect(prProgress.not_started).toBe(10);
      expect(prProgress.percentage).toBe(0);
    });

    it('should handle 100% completion', () => {
      // Arrange
      const prId = 'test-pr-1';
      const progress = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'file1.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' },
        { id: '2', pr_id: prId, user_id: 'user1', file_path: 'file2.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' },
      ];
      useProgressStore.getState().setProgress(prId, progress);

      // Act
      const prProgress = useProgressStore.getState().getPRProgress(prId, 2);

      // Assert
      expect(prProgress.percentage).toBe(100);
    });
  });

  describe('clearProgress', () => {
    it('should remove all progress for a PR', () => {
      // Arrange
      const prId = 'test-pr-1';
      const progress = [
        { id: '1', pr_id: prId, user_id: 'user1', file_path: 'file1.ts', status: 'completed' as ReviewStatus, updated_at: '2026-01-15T10:00:00Z', created_at: '2026-01-15T09:00:00Z' }
      ];
      useProgressStore.getState().setProgress(prId, progress);

      // Act
      useProgressStore.getState().clearProgress(prId);

      // Assert
      const stored = useProgressStore.getState().getProgressForPR(prId);
      expect(stored).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid status changes (optimistic UI)', () => {
      // Arrange
      const prId = 'test-pr-1';

      // Act - rapid fire updates
      useProgressStore.getState().updateFileProgress(prId, 'file.ts', 'in_progress');
      useProgressStore.getState().updateFileProgress(prId, 'file.ts', 'completed');
      useProgressStore.getState().updateFileProgress(prId, 'file.ts', 'in_progress');

      // Assert - last update wins
      const status = useProgressStore.getState().getFileStatus(prId, 'file.ts');
      expect(status).toBe('in_progress');
    });

    it('should handle special characters in file paths', () => {
      // Arrange
      const prId = 'test-pr-1';
      const weirdPath = 'src/components/Button (v2).tsx';

      // Act
      useProgressStore.getState().updateFileProgress(prId, weirdPath, 'completed');

      // Assert
      const status = useProgressStore.getState().getFileStatus(prId, weirdPath);
      expect(status).toBe('completed');
    });

    it('should handle empty file path', () => {
      // Arrange
      const prId = 'test-pr-1';

      // Act
      useProgressStore.getState().updateFileProgress(prId, '', 'completed');

      // Assert
      const status = useProgressStore.getState().getFileStatus(prId, '');
      expect(status).toBe('completed');
    });
  });
});

// Expected Result: ALL TESTS FAIL (progress-store.ts doesn't exist yet)
