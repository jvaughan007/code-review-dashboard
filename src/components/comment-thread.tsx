"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useComments } from "@/lib/hooks/use-comments";
import { CommentInput } from "./comment-input";
import { CommentItem } from "./comment-item";
import { createClient } from "@/lib/supabase/client";

interface CommentThreadProps {
  prId: string;
}

/**
 * CommentThread - Main comment section for PR discussions
 *
 * Features:
 * - Top-level comment input
 * - Comment list with threading (max depth 3)
 * - Real-time sync via polling (3s interval)
 * - Optimistic UI for instant feedback
 * - Loading states
 * - Empty state
 * - Auto-scroll to new comments
 */
export function CommentThread({ prId }: CommentThreadProps) {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const {
    comments,
    commentCount,
    getReplies,
    addComment,
    deleteComment,
  } = useComments({
    prId,
    enabled: true,
    pollingInterval: 3000, // Poll every 3 seconds
  });

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

  // Handle top-level comment submission
  const handleAddComment = async (body: string) => {
    await addComment(body, null);
  };

  // Handle reply submission
  const handleReply = async (body: string, parentCommentId: string) => {
    await addComment(body, parentCommentId);
  };

  // Organize comments by threading structure
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          Comments {commentCount > 0 && `(${commentCount})`}
        </h2>
      </div>

      {/* Top-level comment input */}
      {currentUserId ? (
        <div className="rounded-lg border bg-card p-4">
          <CommentInput
            onSubmit={handleAddComment}
            placeholder="Add a comment to this pull request..."
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to add comments to this pull request
          </p>
        </div>
      )}

      {/* Comment list */}
      {topLevelComments.length > 0 ? (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={deleteComment}
              getReplies={getReplies}
              depth={0}
              maxDepth={3}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No comments yet
          </p>
          <p className="text-xs text-muted-foreground">
            Be the first to add a comment to this pull request
          </p>
        </div>
      )}

      {/* Real-time sync indicator */}
      <div className="text-xs text-center text-muted-foreground">
        Comments sync automatically every 3 seconds
      </div>
    </div>
  );
}
