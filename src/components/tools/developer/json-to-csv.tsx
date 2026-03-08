"use client";

import { useState } from "react";
import { CopyButton } from "@/components/shared/copy-button";
import { DownloadButton } from "@/components/shared/download-button";

function jsonArrayToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = [...new Set(data.flatMap((row) => Object.keys(row)))];

  const escapeCsvValue = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCsvValue).join(",");
  const rows = data.map((row) =>
    headers.map((h) => escapeCsvValue(row[h])).join(","),
  );

  return [headerLine, ...rows].join("\n");
}

export function JsonToCsv() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const parsed = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        setError("Input must be a JSON array of objects.");
        setOutput("");
        return;
      }

      if (parsed.length === 0) {
        setError("Array is empty.");
        setOutput("");
        return;
      }

      if (typeof parsed[0] !== "object" || parsed[0] === null) {
        setError("Each element in the array must be an object.");
        setOutput("");
        return;
      }

      setOutput(jsonArrayToCsv(parsed));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">JSON Array</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"name": "Alice", "age": 30}, ...]'
            className="h-72 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">CSV Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="CSV output will appear here..."
            className="h-72 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={convert}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Convert
        </button>
        {output && (
          <DownloadButton data={output} filename="data.csv" mimeType="text/csv" />
        )}
      </div>
    </div>
  );
}
