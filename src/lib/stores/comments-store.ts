import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Comments Store - Manages real-time synchronized comments
 *
 * Architecture: Optimistic UI + Database Polling
 * - Comments appear instantly (optimistic)
 * - Database sync happens in background
 * - Rollback on error
 * - Supports threaded replies (max depth 3)
 *
 * Simplified for MVP: PR-level comments (not line-level)
 */

export interface Comment {
  id: string;
  pr_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  parent_comment_id: string | null; // For threaded replies
  body: string;
  created_at: string;
  updated_at: string;

  // Optimistic UI flags (not in DB)
  isPending?: boolean; // Comment is being saved
  isError?: boolean; // Comment failed to save
  tempId?: string; // Temporary ID before server confirms
}

interface CommentsState {
  // Comments by PR
  commentsByPR: Map<string, Comment[]>;

  // Actions
  setComments: (prId: string, comments: Comment[]) => void;
  addComment: (prId: string, comment: Comment) => void;
  updateComment: (commentId: string, body: string) => void;
  deleteComment: (commentId: string) => void;
  markPending: (tempId: string, isPending: boolean) => void;
  markError: (tempId: string, isError: boolean) => void;
  replaceOptimistic: (tempId: string, realComment: Comment) => void;
  clearComments: (prId: string) => void;

  // Selectors
  getComments: (prId: string) => Comment[];
  getTopLevelComments: (prId: string) => Comment[];
  getReplies: (prId: string, parentId: string) => Comment[];
  getCommentCount: (prId: string) => number;
}

export const useCommentsStore = create<CommentsState>()(
  devtools(
    (set, get) => ({
      commentsByPR: new Map(),

      setComments: (prId, comments) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);
          newMap.set(prId, comments);
          return { commentsByPR: newMap };
        }),

      addComment: (prId, comment) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);
          const existing = newMap.get(prId) || [];
          newMap.set(prId, [...existing, comment]);
          return { commentsByPR: newMap };
        }),

      updateComment: (commentId, body) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);

          for (const [prId, comments] of newMap.entries()) {
            const updated = comments.map((c) =>
              c.id === commentId
                ? { ...c, body, updated_at: new Date().toISOString() }
                : c
            );
            newMap.set(prId, updated);
          }

          return { commentsByPR: newMap };
        }),

      deleteComment: (commentId) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);

          for (const [prId, comments] of newMap.entries()) {
            const filtered = comments.filter((c) => c.id !== commentId);
            newMap.set(prId, filtered);
          }

          return { commentsByPR: newMap };
        }),

      markPending: (tempId, isPending) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);

          for (const [prId, comments] of newMap.entries()) {
            const updated = comments.map((c) =>
              c.tempId === tempId ? { ...c, isPending } : c
            );
            newMap.set(prId, updated);
          }

          return { commentsByPR: newMap };
        }),

      markError: (tempId, isError) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);

          for (const [prId, comments] of newMap.entries()) {
            const updated = comments.map((c) =>
              c.tempId === tempId ? { ...c, isError, isPending: false } : c
            );
            newMap.set(prId, updated);
          }

          return { commentsByPR: newMap };
        }),

      replaceOptimistic: (tempId, realComment) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);

          for (const [prId, comments] of newMap.entries()) {
            const updated = comments.map((c) =>
              c.tempId === tempId ? realComment : c
            );
            newMap.set(prId, updated);
          }

          return { commentsByPR: newMap };
        }),

      clearComments: (prId) =>
        set((state) => {
          const newMap = new Map(state.commentsByPR);
          newMap.delete(prId);
          return { commentsByPR: newMap };
        }),

      getComments: (prId) => {
        return get().commentsByPR.get(prId) || [];
      },

      getTopLevelComments: (prId) => {
        const comments = get().commentsByPR.get(prId) || [];
        return comments.filter((c) => !c.parent_comment_id);
      },

      getReplies: (prId, parentId) => {
        const comments = get().commentsByPR.get(prId) || [];
        return comments.filter((c) => c.parent_comment_id === parentId);
      },

      getCommentCount: (prId) => {
        return (get().commentsByPR.get(prId) || []).length;
      },
    }),
    { name: 'CommentsStore' }
  )
);
