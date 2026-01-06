import { create } from 'zustand';

/**
 * Comments Store - Manages real-time synchronized comments
 *
 * Architecture: Optimistic UI + Database Polling
 * - Comments appear instantly (optimistic)
 * - Database sync happens in background
 * - Rollback on error
 * - Supports threaded replies
 */

export interface Comment {
  id: string;
  pr_id: string;
  file_path: string;
  line_number: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  content: string;
  parent_id: string | null; // For threaded replies
  created_at: string;
  updated_at: string;
  is_deleted: boolean;

  // Optimistic UI flags (not in DB)
  isPending?: boolean; // Comment is being saved
  isError?: boolean; // Comment failed to save
  tempId?: string; // Temporary ID before server confirms
}

interface CommentsState {
  // Comments by PR, file, and line
  commentsByPRFileLine: Record<string, Comment[]>;

  // Loading states
  isLoading: boolean;

  // Actions
  setComments: (prId: string, filePath: string, lineNumber: number, comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  markCommentPending: (tempId: string, isPending: boolean) => void;
  markCommentError: (tempId: string, isError: boolean) => void;
  replaceOptimisticComment: (tempId: string, realComment: Comment) => void;
  setLoading: (loading: boolean) => void;

  // Helpers
  getCommentsForLine: (prId: string, filePath: string, lineNumber: number) => Comment[];
  getCommentCount: (prId: string, filePath: string, lineNumber: number) => number;
  getReplies: (parentId: string) => Comment[];
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  commentsByPRFileLine: {},
  isLoading: false,

  setComments: (prId, filePath, lineNumber, comments) => {
    const key = `${prId}:${filePath}:${lineNumber}`;
    set((state) => ({
      commentsByPRFileLine: {
        ...state.commentsByPRFileLine,
        [key]: comments,
      },
    }));
  },

  addComment: (comment) => {
    const key = `${comment.pr_id}:${comment.file_path}:${comment.line_number}`;
    set((state) => ({
      commentsByPRFileLine: {
        ...state.commentsByPRFileLine,
        [key]: [...(state.commentsByPRFileLine[key] || []), comment],
      },
    }));
  },

  updateComment: (commentId, updates) => {
    set((state) => {
      const newComments = { ...state.commentsByPRFileLine };

      Object.keys(newComments).forEach((key) => {
        newComments[key] = newComments[key].map((c) =>
          c.id === commentId ? { ...c, ...updates } : c
        );
      });

      return { commentsByPRFileLine: newComments };
    });
  },

  deleteComment: (commentId) => {
    set((state) => {
      const newComments = { ...state.commentsByPRFileLine };

      Object.keys(newComments).forEach((key) => {
        newComments[key] = newComments[key].map((c) =>
          c.id === commentId ? { ...c, is_deleted: true } : c
        );
      });

      return { commentsByPRFileLine: newComments };
    });
  },

  markCommentPending: (tempId, isPending) => {
    set((state) => {
      const newComments = { ...state.commentsByPRFileLine };

      Object.keys(newComments).forEach((key) => {
        newComments[key] = newComments[key].map((c) =>
          c.tempId === tempId ? { ...c, isPending } : c
        );
      });

      return { commentsByPRFileLine: newComments };
    });
  },

  markCommentError: (tempId, isError) => {
    set((state) => {
      const newComments = { ...state.commentsByPRFileLine };

      Object.keys(newComments).forEach((key) => {
        newComments[key] = newComments[key].map((c) =>
          c.tempId === tempId ? { ...c, isError, isPending: false } : c
        );
      });

      return { commentsByPRFileLine: newComments };
    });
  },

  replaceOptimisticComment: (tempId, realComment) => {
    set((state) => {
      const newComments = { ...state.commentsByPRFileLine };

      Object.keys(newComments).forEach((key) => {
        newComments[key] = newComments[key].map((c) =>
          c.tempId === tempId ? realComment : c
        );
      });

      return { commentsByPRFileLine: newComments };
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  // Helper methods
  getCommentsForLine: (prId, filePath, lineNumber) => {
    const key = `${prId}:${filePath}:${lineNumber}`;
    const comments = get().commentsByPRFileLine[key] || [];
    return comments.filter((c) => !c.is_deleted && !c.parent_id);
  },

  getCommentCount: (prId, filePath, lineNumber) => {
    return get().getCommentsForLine(prId, filePath, lineNumber).length;
  },

  getReplies: (parentId) => {
    const allComments = Object.values(get().commentsByPRFileLine).flat();
    return allComments.filter((c) => c.parent_id === parentId && !c.is_deleted);
  },
}));
