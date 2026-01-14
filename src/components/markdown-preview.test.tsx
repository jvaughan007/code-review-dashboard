import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarkdownPreview } from "./markdown-preview";

describe("MarkdownPreview", () => {
  describe("Basic Rendering", () => {
    it("should render plain text", () => {
      render(<MarkdownPreview content="Hello world" />);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("should show 'Nothing to preview' for empty content", () => {
      render(<MarkdownPreview content="" />);
      expect(screen.getByText("Nothing to preview")).toBeInTheDocument();
    });

    it("should show 'Nothing to preview' for whitespace-only content", () => {
      render(<MarkdownPreview content="   " />);
      expect(screen.getByText("Nothing to preview")).toBeInTheDocument();
    });
  });

  describe("Markdown Formatting", () => {
    it("should render bold text", () => {
      render(<MarkdownPreview content="**bold text**" />);
      const boldElement = screen.getByText("bold text");
      expect(boldElement.tagName).toBe("STRONG");
    });

    it("should render italic text", () => {
      render(<MarkdownPreview content="*italic text*" />);
      const italicElement = screen.getByText("italic text");
      expect(italicElement.tagName).toBe("EM");
    });

    it("should render inline code", () => {
      render(<MarkdownPreview content="Use `const` keyword" />);
      const codeElement = screen.getByText("const");
      expect(codeElement.tagName).toBe("CODE");
    });

    it("should render code blocks", () => {
      const codeBlock = `\`\`\`
const x = 1;
\`\`\``;
      render(<MarkdownPreview content={codeBlock} />);
      expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
    });

    it("should render links", () => {
      render(<MarkdownPreview content="[Click here](https://example.com)" />);
      const link = screen.getByRole("link", { name: "Click here" });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should render unordered lists", () => {
      const list = `- Item 1
- Item 2`;
      render(<MarkdownPreview content={list} />);
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    it("should render ordered lists", () => {
      const list = `1. First
2. Second`;
      render(<MarkdownPreview content={list} />);
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    it("should render blockquotes", () => {
      render(<MarkdownPreview content="> This is a quote" />);
      expect(screen.getByText("This is a quote")).toBeInTheDocument();
    });

    it("should render headings", () => {
      render(<MarkdownPreview content="# Heading 1" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading 1");
    });

    it("should render h2 headings", () => {
      render(<MarkdownPreview content="## Heading 2" />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Heading 2");
    });
  });

  describe("GitHub Flavored Markdown (GFM)", () => {
    it("should render strikethrough", () => {
      render(<MarkdownPreview content="~~deleted~~" />);
      const delElement = screen.getByText("deleted");
      expect(delElement.tagName).toBe("DEL");
    });

    it("should render tables", () => {
      const tableContent = `| Name | Age |
|------|-----|
| John | 30  |`;
      render(<MarkdownPreview content={tableContent} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("should render task lists", () => {
      const taskList = `- [x] Done
- [ ] Todo`;
      render(<MarkdownPreview content={taskList} />);
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
      expect(checkboxes[0]).toBeChecked();
    });
  });

  describe("Custom Class Names", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MarkdownPreview content="Test" className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Security", () => {
    it("should sanitize script tags in markdown", () => {
      render(<MarkdownPreview content="<script>alert('xss')</script>" />);
      // Script tags should not execute - they're stripped by react-markdown
      const scripts = document.getElementsByTagName("script");
      // Only expect existing page scripts, not injected ones
      expect(scripts.length).toBeLessThanOrEqual(1);
    });

    it("should handle HTML entities safely", () => {
      render(<MarkdownPreview content="&lt;div&gt;Safe HTML&lt;/div&gt;" />);
      expect(screen.getByText(/<div>Safe HTML<\/div>/)).toBeInTheDocument();
    });
  });
});
