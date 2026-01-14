"use client";

import { useState } from "react";
import { MessageSquare, Loader2, Eye, Edit3 } from "lucide-react";
import { MarkdownPreview } from "./markdown-preview";

interface CommentInputProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  parentCommentId?: string | null;
  autoFocus?: boolean;
  onCancel?: () => void;
}

type TabMode = "write" | "preview";

/**
 * CommentInput - Text area for adding comments with markdown preview
 *
 * Features:
 * - Write/Preview tabs for markdown preview
 * - Character counter (max 10,000 chars)
 * - Loading state during submission
 * - Auto-focus support for reply forms
 * - Cancel button for nested replies
 * - Enter to submit (Shift+Enter for new line)
 * - GitHub-flavored markdown support
 */
export function CommentInput({
  onSubmit,
  placeholder = "Add a comment...",
  parentCommentId = null,
  autoFocus = false,
  onCancel,
}: CommentInputProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>("write");
  const maxLength = 10000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody(""); // Clear input on success
      setActiveTab("write"); // Reset to write tab
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // Keep the text so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isOverLimit = body.length > maxLength;
  const remainingChars = maxLength - body.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === "write"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Content area */}
      <div className="relative">
        {activeTab === "write" ? (
          <>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus={autoFocus}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-background p-3 text-sm resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary ${
                isOverLimit
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              maxLength={maxLength + 100} // Allow typing over limit to show error
            />

            {/* Character counter */}
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                isOverLimit
                  ? "text-destructive font-medium"
                  : remainingChars < 100
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-muted-foreground"
              }`}
            >
              {remainingChars < 0 ? `${-remainingChars} over limit` : `${remainingChars} chars remaining`}
            </div>
          </>
        ) : (
          <div className="min-h-[100px] rounded-md border border-input bg-background p-3">
            <MarkdownPreview content={body} />
          </div>
        )}
      </div>

      {/* Markdown hint */}
      {activeTab === "write" && (
        <div className="text-xs text-muted-foreground">
          Supports **bold**, *italic*, `code`, ```code blocks```, [links](url), and lists
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <MessageSquare className="inline h-3 w-3 mr-1" />
          Press Enter to submit, Shift+Enter for new line
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!body.trim() || isSubmitting || isOverLimit}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                {parentCommentId ? "Reply" : "Comment"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
