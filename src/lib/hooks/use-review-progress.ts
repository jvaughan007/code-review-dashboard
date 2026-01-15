"use client";

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProgressStore, type FileProgress, type ReviewStatus } from '@/lib/stores/progress-store';

/**
 * useReviewProgress - Manages review progress with optimistic UI
 *
 * Features:
 * - Optimistic updates (instant feedback)
 * - Database polling every 5 seconds
 * - Per-user, per-PR progress tracking
 * - File-level status management
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param enabled - Whether to enable progress polling (default: true)
 */

interface UseReviewProgressOptions {
  prId: string;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 5000)
}

export function useReviewProgress({
  prId,
  enabled = true,
  pollingInterval = 5000,
}: UseReviewProgressOptions) {
  const supabase = createClient();
  const {
    setProgress,
    updateFileProgress,
    getProgressForPR,
    getFileStatus,
    getPRProgress,
    setLoading,
  } = useProgressStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for progress updates
  useEffect(() => {
    if (!enabled || !prId) return;

    async function pollProgress() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('review_progress')
          .select('*')
          .eq('pr_id', prId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        setProgress(prId, data as FileProgress[]);
      } catch (error) {
        console.error('Error in progress polling:', error);
      }
    }

    // Initial poll
    setLoading(true);
    pollProgress().finally(() => setLoading(false));

    // Set up polling interval
    pollingRef.current = setInterval(pollProgress, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [prId, enabled, pollingInterval, supabase, setProgress, setLoading]);

  // Update file status with optimistic UI
  const updateStatus = useCallback(
    async (filePath: string, status: ReviewStatus) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Optimistically update store
        updateFileProgress(prId, filePath, status);

        // Upsert to database
        const { error } = await supabase
          .from('review_progress')
          .upsert(
            {
              pr_id: prId,
              user_id: user.id,
              file_path: filePath,
              status,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'pr_id,user_id,file_path',
            }
          );

        if (error) {
          console.error('Error updating progress:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error updating file progress:', error);
        throw error;
      }
    },
    [prId, supabase, updateFileProgress]
  );

  // Mark file as completed
  const markFileCompleted = useCallback(
    (filePath: string) => updateStatus(filePath, 'completed'),
    [updateStatus]
  );

  // Mark file as in progress
  const markFileInProgress = useCallback(
    (filePath: string) => updateStatus(filePath, 'in_progress'),
    [updateStatus]
  );

  // Mark file as not started (reset)
  const resetFileProgress = useCallback(
    (filePath: string) => updateStatus(filePath, 'not_started'),
    [updateStatus]
  );

  // Toggle file between not_started/in_progress and completed
  const toggleFileCompleted = useCallback(
    (filePath: string) => {
      const currentStatus = getFileStatus(prId, filePath);
      const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
      return updateStatus(filePath, newStatus);
    },
    [prId, getFileStatus, updateStatus]
  );

  return {
    progress: getProgressForPR(prId),
    getFileStatus: (filePath: string) => getFileStatus(prId, filePath),
    getPRProgress: (totalFiles: number) => getPRProgress(prId, totalFiles),
    updateStatus,
    markFileCompleted,
    markFileInProgress,
    resetFileProgress,
    toggleFileCompleted,
  };
}
