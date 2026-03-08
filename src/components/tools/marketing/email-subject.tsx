"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "friendly", label: "Friendly" },
] as const;

export function EmailSubjectGenerator() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setSubjects([]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email-subject",
          input: input.trim(),
          options: { tone },
        }),
      });

      if (!res.ok) throw new Error("Failed to generate subject lines");

      const data = await res.json();
      const parsed: string[] = Array.isArray(data.result)
        ? data.result
        : String(data.result)
            .split(/\n/)
            .map((l: string) => l.replace(/^\d+[\.\)\-]\s*/, "").trim())
            .filter(Boolean);

      setSubjects(parsed);
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
            Email Purpose / Content
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the purpose or content of your email..."
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  tone === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate Subject Lines"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {subjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Generated Subject Lines ({subjects.length})
          </h3>

          <div className="space-y-2">
            {subjects.map((subject, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3"
              >
                <span className="text-sm text-foreground">{subject}</span>
                <CopyButton text={subject} className="shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
