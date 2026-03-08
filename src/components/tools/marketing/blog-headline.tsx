"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

export function BlogHeadlineGenerator() {
  const [input, setInput] = useState("");
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setHeadlines([]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog-headline", input: input.trim() }),
      });

      if (!res.ok) throw new Error("Failed to generate headlines");

      const data = await res.json();
      const parsed: string[] = Array.isArray(data.result)
        ? data.result
        : String(data.result)
            .split(/\n/)
            .map((l: string) => l.replace(/^\d+[\.\)\-]\s*/, "").trim())
            .filter(Boolean);

      setHeadlines(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Blog Topic
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the topic for your blog post..."
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
        </div>

        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate Headlines"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {headlines.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Generated Headlines ({headlines.length})
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {headlines.map((headline, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <p className="flex-1 text-sm font-medium text-foreground">
                  {headline}
                </p>
                <CopyButton text={headline} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
