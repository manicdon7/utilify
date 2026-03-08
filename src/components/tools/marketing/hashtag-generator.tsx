"use client";

import { useState } from "react";
import { Hash, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

export function HashtagGenerator() {
  const [input, setInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setHashtags([]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "hashtag", input: input.trim() }),
      });

      if (!res.ok) throw new Error("Failed to generate hashtags");

      const data = await res.json();
      const tags: string[] = Array.isArray(data.result)
        ? data.result
        : String(data.result)
            .split(/[\n,]+/)
            .map((t: string) => t.trim())
            .filter(Boolean);

      setHashtags(tags.map((t) => (t.startsWith("#") ? t : `#${t}`)));
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
            Topic / Content Description
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your content or topic to generate relevant hashtags..."
            rows={4}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
            <Hash className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate Hashtags"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Hashtags ({hashtags.length})
            </h3>
            <CopyButton text={hashtags.join(" ")} />
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <button
                key={i}
                onClick={() => navigator.clipboard.writeText(tag)}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
