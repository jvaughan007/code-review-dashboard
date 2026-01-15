import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Progress Store - Tracks review progress per file per PR
 *
 * Architecture: Optimistic UI + Database Polling
 * - Progress updates appear instantly (optimistic)
 * - Database sync happens in background
 *
 * Sprint 7: Review Progress Tracking
 * - Tracks file review status: not_started, in_progress, completed
 * - Calculates PR-level progress percentages
 * - Supports per-user progress tracking
 */

export type ReviewStatus = 'not_started' | 'in_progress' | 'completed';

export interface FileProgress {
  id: string;
  pr_id: string;
  user_id: string;
  file_path: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface PRProgress {
  completed: number;
  in_progress: number;
  not_started: number;
  total_files: number;
  percentage: number;
}

interface ProgressState {
  // Progress by PR (pr_id -> FileProgress[])
  progressByPR: Record<string, FileProgress[]>;
  isLoading: boolean;

  // Actions
  setProgress: (prId: string, progress: FileProgress[]) => void;
  updateFileProgress: (prId: string, filePath: string, status: ReviewStatus) => void;
  clearProgress: (prId: string) => void;
  setLoading: (loading: boolean) => void;

  // Selectors
  getProgressForPR: (prId: string) => FileProgress[];
  getFileStatus: (prId: string, filePath: string) => ReviewStatus;
  getPRProgress: (prId: string, totalFiles: number) => PRProgress;
}

export const useProgressStore = create<ProgressState>()(
  devtools(
    (set, get) => ({
      progressByPR: {},
      isLoading: false,

      setProgress: (prId, progress) =>
        set((state) => ({
          progressByPR: {
            ...state.progressByPR,
            [prId]: progress,
          },
        })),

      updateFileProgress: (prId, filePath, status) =>
        set((state) => {
          const existing = state.progressByPR[prId] || [];
          const fileIndex = existing.findIndex((p) => p.file_path === filePath);

          let updated: FileProgress[];

          if (fileIndex >= 0) {
            // Update existing
            updated = existing.map((p, i) =>
              i === fileIndex
                ? { ...p, status, updated_at: new Date().toISOString() }
                : p
            );
          } else {
            // Add new
            const newProgress: FileProgress = {
              id: `temp-${Date.now()}`,
              pr_id: prId,
              user_id: '', // Will be set by hook/API
              file_path: filePath,
              status,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            updated = [...existing, newProgress];
          }

          return {
            progressByPR: {
              ...state.progressByPR,
              [prId]: updated,
            },
          };
        }),

      clearProgress: (prId) =>
        set((state) => ({
          progressByPR: {
            ...state.progressByPR,
            [prId]: [],
          },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      getProgressForPR: (prId) => {
        return get().progressByPR[prId] || [];
      },

      getFileStatus: (prId, filePath) => {
        const progress = get().progressByPR[prId] || [];
        const fileProgress = progress.find((p) => p.file_path === filePath);
        return fileProgress?.status || 'not_started';
      },

      getPRProgress: (prId, totalFiles) => {
        const progress = get().progressByPR[prId] || [];

        const completed = progress.filter((p) => p.status === 'completed').length;
        const in_progress = progress.filter((p) => p.status === 'in_progress').length;
        const not_started = totalFiles - completed - in_progress;
        const percentage = totalFiles > 0 ? Math.round((completed / totalFiles) * 100) : 0;

        return {
          completed,
          in_progress,
          not_started,
          total_files: totalFiles,
          percentage,
        };
      },
    }),
    { name: 'ProgressStore' }
  )
);
