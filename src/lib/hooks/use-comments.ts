"use client";

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCommentsStore, type Comment } from '@/lib/stores/comments-store';
import { logActivity } from '@/lib/utils/activity-logger';

/**
 * useComments - Manages real-time comments with optimistic UI
 *
 * Features:
 * - Optimistic updates (instant feedback)
 * - Database polling every 3 seconds
 * - Automatic rollback on error
 * - Supports threaded replies
 * - PR-level comments (simplified for MVP)
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param enabled - Whether to enable comment polling (default: true)
 */

interface UseCommentsOptions {
  prId: string;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 3000)
}

export function useComments({
  prId,
  enabled = true,
  pollingInterval = 3000,
}: UseCommentsOptions) {
  const supabase = createClient();
  const {
    setComments,
    addComment,
    updateComment,
    deleteComment,
    markError,
    replaceOptimistic,
    getComments,
    getCommentCount,
    getReplies,
  } = useCommentsStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for comment updates
  useEffect(() => {
    if (!enabled || !prId) return;

    async function pollComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('pr_id', prId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error polling comments:', error);
          return;
        }

        setComments(prId, data as Comment[]);
      } catch (error) {
        console.error('Error in comment polling:', error);
      }
    }

    // Initial poll
    pollComments();

    // Set up polling interval
    pollingRef.current = setInterval(pollComments, pollingInterval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [prId, enabled, pollingInterval, supabase, setComments]);

  // Add comment with optimistic UI
  const addCommentOptimistic = useCallback(
    async (body: string, parentCommentId: string | null = null) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error('User not authenticated');
        }

        // Generate temporary ID
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Optimistic comment
        const optimisticComment: Comment = {
          id: tempId,
          pr_id: prId,
          user_id: user.user.id,
          username: user.user.user_metadata.user_name || user.user.email?.split('@')[0] || 'Anonymous',
          avatar_url: user.user.user_metadata.avatar_url || null,
          body,
          parent_comment_id: parentCommentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isPending: true,
          tempId,
        };

        // Add optimistic comment to store
        addComment(prId, optimisticComment);

        // Save to database
        const { data, error } = await supabase
          .from('comments')
          .insert({
            pr_id: prId,
            user_id: user.user.id,
            username: optimisticComment.username,
            avatar_url: optimisticComment.avatar_url,
            body,
            parent_comment_id: parentCommentId,
          })
          .select()
          .single();

        if (error) {
          // Mark as error
          markError(tempId, true);
          throw error;
        }

        // Replace optimistic with real comment
        replaceOptimistic(tempId, data as Comment);

        // Log activity: comment posted
        await logActivity({
          prId,
          userId: user.user.id,
          sessionId: null, // Comments don't have session context
          activityType: 'comment_posted',
          metadata: {
            comment_id: data.id,
            username: optimisticComment.username,
            avatar_url: optimisticComment.avatar_url,
            body_preview: body.slice(0, 100), // First 100 chars
            is_reply: !!parentCommentId,
          },
        });

        return data as Comment;
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },
    [prId, supabase, addComment, markError, replaceOptimistic]
  );

  // Update comment
  const updateCommentContent = useCallback(
    async (commentId: string, body: string) => {
      try {
        // Optimistically update local store
        updateComment(commentId, body);

        // Update database
        const { error } = await supabase
          .from('comments')
          .update({
            body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', commentId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
      }
    },
    [supabase, updateComment]
  );

  // Delete comment (hard delete)
  const deleteCommentHard = useCallback(
    async (commentId: string) => {
      try {
        // Get user before deleting (for activity log)
        const { data: { user } } = await supabase.auth.getUser();

        // Optimistically remove from store
        deleteComment(commentId);

        // Delete from database
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          throw error;
        }

        // Log activity: comment deleted
        if (user) {
          await logActivity({
            prId,
            userId: user.id,
            sessionId: null,
            activityType: 'comment_deleted',
            metadata: {
              comment_id: commentId,
              username: user.user_metadata.user_name || user.email?.split('@')[0] || 'Anonymous',
              avatar_url: user.user_metadata.avatar_url || null,
            },
          });
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    [prId, supabase, deleteComment]
  );

  return {
    comments: getComments(prId),
    commentCount: getCommentCount(prId),
    getReplies: (parentId: string) => getReplies(prId, parentId),
    addComment: addCommentOptimistic,
    updateComment: updateCommentContent,
    deleteComment: deleteCommentHard,
  };
}
