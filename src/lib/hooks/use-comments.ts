"use client";

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCommentsStore, type Comment } from '@/lib/stores/comments-store';

/**
 * useComments - Manages real-time comments with optimistic UI
 *
 * Features:
 * - Optimistic updates (instant feedback)
 * - Database polling every 3 seconds
 * - Automatic rollback on error
 * - Supports threaded replies
 *
 * @param prId - PR identifier (format: "owner/repo/number")
 * @param filePath - File path
 * @param lineNumber - Line number
 * @param enabled - Whether to enable comment polling (default: true)
 */

interface UseCommentsOptions {
  prId: string;
  filePath: string;
  lineNumber: number;
  enabled?: boolean;
  pollingInterval?: number; // ms (default: 3000)
}

export function useComments({
  prId,
  filePath,
  lineNumber,
  enabled = true,
  pollingInterval = 3000,
}: UseCommentsOptions) {
  const supabase = createClient();
  const {
    setComments,
    addComment,
    updateComment,
    deleteComment,
    markCommentError,
    replaceOptimisticComment,
    getCommentsForLine,
    getCommentCount,
    getReplies,
  } = useCommentsStore();

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for comment updates
  useEffect(() => {
    if (!enabled || !prId || !filePath) return;

    async function pollComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('pr_id', prId)
          .eq('file_path', filePath)
          .eq('line_number', lineNumber)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error polling comments:', error);
          return;
        }

        setComments(prId, filePath, lineNumber, data as Comment[]);
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
  }, [prId, filePath, lineNumber, enabled, pollingInterval, supabase, setComments]);

  // Add comment with optimistic UI
  const addCommentOptimistic = useCallback(
    async (content: string, parentId: string | null = null) => {
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
          file_path: filePath,
          line_number: lineNumber,
          user_id: user.user.id,
          username: user.user.user_metadata.user_name || user.user.email?.split('@')[0] || 'Anonymous',
          avatar_url: user.user.user_metadata.avatar_url || null,
          content,
          parent_id: parentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_deleted: false,
          isPending: true,
          tempId,
        };

        // Add optimistic comment to store
        addComment(optimisticComment);

        // Save to database
        const { data, error } = await supabase
          .from('comments')
          .insert({
            pr_id: prId,
            file_path: filePath,
            line_number: lineNumber,
            user_id: user.user.id,
            username: optimisticComment.username,
            avatar_url: optimisticComment.avatar_url,
            content,
            parent_id: parentId,
          })
          .select()
          .single();

        if (error) {
          // Mark as error
          markCommentError(tempId, true);
          throw error;
        }

        // Replace optimistic with real comment
        replaceOptimisticComment(tempId, data as Comment);

        return data as Comment;
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },
    [
      prId,
      filePath,
      lineNumber,
      supabase,
      addComment,
      markCommentError,
      replaceOptimisticComment,
    ]
  );

  // Update comment
  const updateCommentContent = useCallback(
    async (commentId: string, content: string) => {
      try {
        // Optimistically update local store
        updateComment(commentId, {
          content,
          updated_at: new Date().toISOString(),
        });

        // Update database
        const { error } = await supabase
          .from('comments')
          .update({
            content,
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

  // Delete comment (soft delete)
  const deleteCommentSoft = useCallback(
    async (commentId: string) => {
      try {
        // Optimistically mark as deleted
        deleteComment(commentId);

        // Update database
        const { error } = await supabase
          .from('comments')
          .update({ is_deleted: true })
          .eq('id', commentId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    [supabase, deleteComment]
  );

  return {
    comments: getCommentsForLine(prId, filePath, lineNumber),
    commentCount: getCommentCount(prId, filePath, lineNumber),
    getReplies,
    addComment: addCommentOptimistic,
    updateComment: updateCommentContent,
    deleteComment: deleteCommentSoft,
  };
}
