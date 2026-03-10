"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

const STYLES = ["Adventure", "Mystery", "Romance", "Sci-Fi", "Fantasy", "Horror", "Comedy", "Drama"];

export function AiStoryGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ai-story", input: prompt.trim(), options: style || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate story");
      setResult(data.result || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Story Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A detective discovers a hidden city beneath the ocean..."
          rows={3}
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Style (optional)</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(style === s ? "" : s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                style === s ? "bg-primary text-primary-foreground" : "border border-border bg-muted hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!prompt.trim() || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
        {loading ? "Writing..." : "Generate Story"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Your Story</label>
            <CopyButton text={result} />
          </div>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
