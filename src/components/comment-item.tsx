"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Reply, AlertCircle, Loader2, Pencil, X, Check } from "lucide-react";
import { CommentInput } from "./comment-input";
import { MarkdownPreview } from "./markdown-preview";
import type { Comment } from "@/lib/stores/comments-store";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (body: string, parentCommentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, newBody: string) => Promise<void>;
  getReplies: (commentId: string) => Comment[];
  depth?: number;
  maxDepth?: number;
}

/**
 * CommentItem - Displays a single comment with actions
 *
 * Features:
 * - Avatar and username display
 * - Relative timestamp (e.g., "2 minutes ago")
 * - Reply button (disabled at max depth)
 * - Edit button (only for comment author)
 * - Delete button (only for comment author)
 * - Inline reply and edit forms
 * - Error state display
 * - Pending/optimistic UI indicator
 * - Nested replies with indentation
 * - Markdown rendering
 */
export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  getReplies,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isAuthor = currentUserId === comment.user_id;
  const canReply = depth < maxDepth - 1; // Stop at depth 2 (0, 1, 2)
  const isPending = comment.isPending;
  const hasError = comment.isError;

  const handleReply = async (body: string) => {
    await onReply(body, comment.id);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleStartEdit = () => {
    setEditBody(comment.body);
    setIsEditing(true);
    setShowReplyForm(false); // Close reply form if open
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditBody(comment.body);
  };

  const handleSaveEdit = async () => {
    if (!onEdit || !editBody.trim() || editBody === comment.body) {
      setIsEditing(false);
      return;
    }

    setIsSavingEdit(true);
    try {
      await onEdit(comment.id, editBody.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="group relative">
      {/* Comment card */}
      <div
        className={`rounded-lg border bg-card p-4 ${
          isPending ? "opacity-60" : ""
        } ${hasError ? "border-destructive bg-destructive/5" : ""}`}
      >
        {/* Header: Avatar, Username, Timestamp */}
        <div className="flex items-start gap-3 mb-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.avatar_url ? (
              <img
                src={comment.avatar_url}
                alt={comment.username}
                className="h-8 w-8 rounded-full ring-2 ring-background"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {comment.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Username and timestamp */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-sm">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground italic">
                  (edited)
                </span>
              )}
              {isPending && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Posting...
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (only for author) */}
          {isAuthor && !isPending && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="Edit comment"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete comment"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error indicator */}
        {hasError && (
          <div className="mb-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to post comment. Please try again.
          </div>
        )}

        {/* Comment body - rendered as markdown OR edit form */}
        <div className="pl-11">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                disabled={isSavingEdit}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Supports markdown formatting
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSavingEdit}
                    className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit || !editBody.trim()}
                    className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MarkdownPreview content={comment.body} className="break-words" />
          )}
        </div>

        {/* Actions: Reply button */}
        {!isPending && !hasError && !isEditing && (
          <div className="mt-2 pl-11">
            {canReply ? (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Max reply depth reached
              </span>
            )}
          </div>
        )}
      </div>

      {/* Inline reply form */}
      {showReplyForm && (
        <div className="mt-3 ml-11">
          <CommentInput
            onSubmit={handleReply}
            placeholder={`Reply to ${comment.username}...`}
            parentCommentId={comment.id}
            autoFocus={true}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested replies */}
      {getReplies(comment.id).length > 0 && (
        <div className="mt-3 ml-11 space-y-3">
          {getReplies(comment.id).map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              getReplies={getReplies}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
