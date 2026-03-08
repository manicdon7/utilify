"use client";

import { useState } from "react";
import { CopyButton } from "@/components/shared/copy-button";

export function GrammarChecker() {
  const [input, setInput] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [corrections, setCorrections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setCorrectedText("");
    setCorrections([]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "grammar", input }),
      });

      if (!res.ok) throw new Error("Failed to check grammar");

      const data = await res.json();
      const raw: string = data.result ?? "";
      const parts = raw.split("---CORRECTIONS---");
      setCorrectedText(parts[0]?.trim() ?? "");

      if (parts[1]) {
        const items = parts[1]
          .trim()
          .split("\n")
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
        setCorrections(items);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text to check for grammar issues..."
          className="h-40 w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        onClick={handleCheck}
        disabled={!input.trim() || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? "Checking..." : "Check Grammar"}
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {correctedText && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Corrected Text
            </label>
            <CopyButton text={correctedText} />
          </div>
          <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
            {correctedText}
          </div>
        </div>
      )}

      {corrections.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Corrections
          </label>
          <ul className="space-y-1.5 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
            {corrections.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
