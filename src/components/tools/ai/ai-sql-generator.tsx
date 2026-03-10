"use client";

import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

const DATABASES = ["PostgreSQL", "MySQL", "SQLite", "SQL Server", "Oracle"];

export function AiSqlGenerator() {
  const [input, setInput] = useState("");
  const [database, setDatabase] = useState("");
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
        body: JSON.stringify({ type: "ai-sql", input: input.trim(), options: database || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate SQL");
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
        <label className="mb-2 block text-sm font-medium text-foreground">Describe what you need</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Get all users who signed up in the last 30 days and order by email. Table: users with columns id, email, created_at"
          rows={4}
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Database (optional)</label>
        <div className="flex flex-wrap gap-2">
          {DATABASES.map((db) => (
            <button
              key={db}
              onClick={() => setDatabase(database === db ? "" : db)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                database === db ? "bg-primary text-primary-foreground" : "border border-border bg-muted hover:bg-muted/80"
              }`}
            >
              {db}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={!input.trim() || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
        {loading ? "Generating..." : "Generate SQL"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Generated SQL</label>
            <CopyButton text={result} />
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm font-mono text-foreground">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
