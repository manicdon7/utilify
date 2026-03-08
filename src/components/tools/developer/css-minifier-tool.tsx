"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/shared/copy-button";

export function CssMinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const originalSize = new Blob([input]).size;
  const minifiedSize = new Blob([output]).size;
  const savings = originalSize > 0 ? (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1) : "0";

  const handleMinify = useCallback(async () => {
    if (!input.trim()) { setError("Please enter some CSS to minify."); setOutput(""); return; }
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/minify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "css", code: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Minification failed");
      setOutput(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to minify CSS");
      setOutput("");
    } finally {
      setProcessing(false);
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Input CSS</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your CSS here..." className="h-72 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Minified Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly placeholder="Minified output will appear here..." className="h-72 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
      {output && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center"><div className="text-2xl font-bold text-foreground">{originalSize}</div><div className="mt-1 text-xs text-muted-foreground">Original (bytes)</div></div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center"><div className="text-2xl font-bold text-foreground">{minifiedSize}</div><div className="mt-1 text-xs text-muted-foreground">Minified (bytes)</div></div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center"><div className="text-2xl font-bold text-green-500">{savings}%</div><div className="mt-1 text-xs text-muted-foreground">Savings</div></div>
        </div>
      )}
      <button onClick={handleMinify} disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
        {processing ? "Minifying..." : "Minify"}
      </button>
    </div>
  );
}
