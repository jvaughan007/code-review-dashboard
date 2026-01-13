"use client";

import { useEffect, useState, useCallback } from "react";
import { X, MessageSquare, Loader2, Plus, Minus, Code } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCommentsStore, type Comment, type LineType } from "@/lib/stores/comments-store";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";
import { logActivity } from "@/lib/utils/activity-logger";
import type { LineClickInfo } from "./diff-viewer";

interface LineCommentThreadProps {
  prId: string;
  lineInfo: LineClickInfo;
  onClose: () => void;
}

/**
 * LineCommentThread - Displays comments for a specific line in the diff
 *
 * Features:
 * - Shows line context (file, line number, content)
 * - Displays existing comments on this line
 * - Allows adding new line-specific comments
 * - Supports threaded replies
 * - Real-time sync via comments store
 */
export function LineCommentThread({
  prId,
  lineInfo,
  onClose,
}: LineCommentThreadProps) {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const {
    getLineComments,
    getReplies,
    addComment,
    deleteComment,
    replaceOptimistic,
    markError,
  } = useCommentsStore();

  // Get comments for this specific line
  const lineComments = getLineComments(prId, lineInfo.filePath, lineInfo.lineNumber);

  // Get current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoadingUser(false);
      }
    }

    fetchUser();
  }, [supabase]);

  // Add line comment with optimistic UI
  const handleAddComment = useCallback(
    async (body: string, parentCommentId: string | null = null) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          throw new Error("User not authenticated");
        }

        // Generate temporary ID
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Optimistic comment with line info
        const optimisticComment: Comment = {
          id: tempId,
          pr_id: prId,
          user_id: user.user.id,
          username: user.user.user_metadata.user_name || user.user.email?.split("@")[0] || "Anonymous",
          avatar_url: user.user.user_metadata.avatar_url || null,
          body,
          parent_comment_id: parentCommentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Line-specific fields
          file_path: lineInfo.filePath,
          line_number: lineInfo.lineNumber,
          line_type: lineInfo.lineType as LineType,
          line_content: lineInfo.lineContent,
          // Optimistic UI flags
          isPending: true,
          tempId,
        };

        // Add optimistic comment to store
        addComment(prId, optimisticComment);

        // Save to database
        const { data, error } = await supabase
          .from("comments")
          .insert({
            pr_id: prId,
            user_id: user.user.id,
            username: optimisticComment.username,
            avatar_url: optimisticComment.avatar_url,
            body,
            parent_comment_id: parentCommentId,
            file_path: lineInfo.filePath,
            line_number: lineInfo.lineNumber,
            line_type: lineInfo.lineType,
            line_content: lineInfo.lineContent,
          })
          .select()
          .single();

        if (error) {
          markError(tempId, true);
          throw error;
        }

        // Replace optimistic with real comment
        replaceOptimistic(tempId, data as Comment);

        // Log activity: line comment posted
        await logActivity({
          prId,
          userId: user.user.id,
          sessionId: null,
          activityType: "comment_posted",
          metadata: {
            comment_id: data.id,
            username: optimisticComment.username,
            avatar_url: optimisticComment.avatar_url,
            body_preview: body.slice(0, 100),
            is_reply: !!parentCommentId,
            is_line_comment: true,
            file_path: lineInfo.filePath,
            line_number: lineInfo.lineNumber,
          },
        });
      } catch (error) {
        console.error("Error adding line comment:", error);
        throw error;
      }
    },
    [prId, lineInfo, supabase, addComment, markError, replaceOptimistic]
  );

  // Handle top-level comment submission
  const handleSubmit = async (body: string) => {
    await handleAddComment(body, null);
  };

  // Handle reply submission
  const handleReply = async (body: string, parentCommentId: string) => {
    await handleAddComment(body, parentCommentId);
  };

  // Handle delete
  const handleDelete = async (commentId: string) => {
    deleteComment(commentId);

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      // Note: optimistic delete already happened, would need to restore on error
    }
  };

  // Get line type icon and color
  const getLineTypeInfo = () => {
    switch (lineInfo.lineType) {
      case "addition":
        return {
          icon: Plus,
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-400",
          label: "Added line",
        };
      case "deletion":
        return {
          icon: Minus,
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-400",
          label: "Removed line",
        };
      default:
        return {
          icon: Code,
          bgColor: "bg-muted",
          textColor: "text-muted-foreground",
          label: "Context line",
        };
    }
  };

  const lineTypeInfo = getLineTypeInfo();
  const LineTypeIcon = lineTypeInfo.icon;

  if (isLoadingUser) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg border shadow-xl p-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Comments on line {lineInfo.lineNumber}
            </h2>
            {lineComments.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({lineComments.length})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Line context */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-start gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${lineTypeInfo.bgColor} ${lineTypeInfo.textColor}`}>
              <LineTypeIcon className="h-3 w-3" />
              <span>{lineTypeInfo.label}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-mono truncate">
                {lineInfo.filePath}
              </p>
            </div>
          </div>
          {lineInfo.lineContent && (
            <pre className="mt-2 text-sm font-mono bg-muted/50 p-2 rounded overflow-x-auto">
              <code>{lineInfo.lineContent}</code>
            </pre>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Comment input */}
          {currentUserId ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <CommentInput
                onSubmit={handleSubmit}
                placeholder={`Comment on line ${lineInfo.lineNumber}...`}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to add comments
              </p>
            </div>
          )}

          {/* Comments list */}
          {lineComments.length > 0 ? (
            <div className="space-y-4">
              {lineComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  getReplies={(parentId) => getReplies(prId, parentId)}
                  depth={0}
                  maxDepth={3}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No comments on this line yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to comment
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t text-xs text-center text-muted-foreground">
          Comments sync automatically
        </div>
      </div>
    </div>
  );
}
