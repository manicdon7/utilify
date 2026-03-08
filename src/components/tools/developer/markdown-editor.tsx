"use client";

import { useState, useMemo, useRef } from "react";
import { marked } from "marked";
import { CopyButton } from "@/components/shared/copy-button";

const TOOLBAR_ACTIONS = [
  { label: "B", title: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", prefix: "_", suffix: "_", placeholder: "italic text" },
  { label: "H", title: "Heading", prefix: "## ", suffix: "", placeholder: "heading" },
  { label: "🔗", title: "Link", prefix: "[", suffix: "](url)", placeholder: "link text" },
  { label: "🖼", title: "Image", prefix: "![", suffix: "](url)", placeholder: "alt text" },
  { label: "</>", title: "Code", prefix: "`", suffix: "`", placeholder: "code" },
  { label: "•", title: "List", prefix: "- ", suffix: "", placeholder: "list item" },
] as const;

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderedHtml = useMemo(() => {
    if (!markdown.trim()) return "";
    const raw = marked.parse(markdown);
    return typeof raw === "string" ? sanitizeHtml(raw) : "";
  }, [markdown]);

  const insertMarkdown = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    const insertion = selected || placeholder;
    const newText =
      markdown.slice(0, start) + prefix + insertion + suffix + markdown.slice(end);

    setMarkdown(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length;
      textarea.setSelectionRange(cursorPos, cursorPos + insertion.length);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/50 p-1.5">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.title}
            title={action.title}
            onClick={() => insertMarkdown(action.prefix, action.suffix, action.placeholder)}
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Markdown</label>
            {markdown && <CopyButton text={markdown} />}
          </div>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write your markdown here..."
            className="h-96 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Preview</label>
            {renderedHtml && <CopyButton text={renderedHtml} />}
          </div>
          <div
            className="prose prose-sm dark:prose-invert h-96 max-w-none overflow-y-auto rounded-lg border border-border bg-muted p-3 text-foreground"
            dangerouslySetInnerHTML={{ __html: renderedHtml || '<p class="text-muted-foreground">Preview will appear here...</p>' }}
          />
        </div>
      </div>
    </div>
  );
}
