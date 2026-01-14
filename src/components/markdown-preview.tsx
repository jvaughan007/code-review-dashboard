"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

/**
 * MarkdownPreview - Renders GitHub-flavored markdown content
 *
 * Features:
 * - GitHub-flavored markdown (tables, strikethrough, task lists)
 * - Code blocks with syntax styling
 * - Links, lists, bold, italic, strikethrough
 * - Safe rendering (sanitized by react-markdown)
 */
export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Nothing to preview
      </p>
    );
  }

  return (
    <div className={`markdown-preview prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks and inline code
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block p-3 rounded-md bg-muted font-mono text-sm overflow-x-auto ${className || ""}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Pre blocks (wrapper for code blocks)
          pre({ children }) {
            return <pre className="bg-muted rounded-md overflow-hidden my-2">{children}</pre>;
          },
          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          // Lists
          ul({ children }) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm">{children}</li>;
          },
          // Headings
          h1({ children }) {
            return <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>;
          },
          // Paragraphs
          p({ children }) {
            return <p className="text-sm my-2">{children}</p>;
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-2 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          // Horizontal rule
          hr() {
            return <hr className="my-4 border-border" />;
          },
          // Tables (GFM)
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-border text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-3 py-2 border-b border-border text-left font-medium">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3 py-2 border-b border-border">{children}</td>;
          },
          // Task lists (GFM)
          input({ checked, ...props }) {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled
                className="mr-2"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
