"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

const TONES = ["Professional", "Friendly", "Luxury", "Urgent", "Casual"];

export function AiProductDescription() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("");
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
        body: JSON.stringify({ type: "ai-product", input: input.trim(), options: tone || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate description");
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
        <label className="mb-2 block text-sm font-medium text-foreground">Product details</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Wireless headphones, noise-canceling, 30hr battery, premium sound. Target: young professionals."
          rows={4}
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Tone (optional)</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(tone === t ? "" : t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tone === t ? "bg-primary text-primary-foreground" : "border border-border bg-muted hover:bg-muted/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!input.trim() || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {loading ? "Writing..." : "Generate Description"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Product Description</label>
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
