"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

export function AiInterviewQuestions() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ai-interview", input: input.trim(), options: options.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
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
        <label className="mb-2 block text-sm font-medium text-foreground">Role or topic</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Senior React Developer, Project Manager, Data Science"
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Extra focus (optional)</label>
        <input
          type="text"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder="e.g. behavioral questions, technical questions, system design"
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        onClick={generate}
        disabled={!input.trim() || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Interview Questions</label>
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
