"use client";

import { useState } from "react";
import { Loader2, LinkIcon, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface LinkResult {
  url: string;
  status: "ok" | "broken" | "cors" | "invalid";
  code: number | null;
}

function extractUrls(input: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"'`,;)}\]]+/gi;
  const fromHref = /href=["']([^"']+)["']/gi;

  const urls = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(input)) !== null) {
    urls.add(match[0]);
  }
  while ((match = fromHref.exec(input)) !== null) {
    if (/^https?:\/\//i.test(match[1])) {
      urls.add(match[1]);
    }
  }

  input.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      urls.add(trimmed);
    }
  });

  return Array.from(urls);
}

export function BrokenLinkChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<LinkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleCheck = async () => {
    const urls = extractUrls(input);
    if (urls.length === 0) return;

    setLoading(true);
    setResults([]);
    setProgress({ current: 0, total: urls.length });

    const checked: LinkResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      let result: LinkResult;

      try {
        new URL(url);
      } catch {
        checked.push({ url, status: "invalid", code: null });
        setProgress({ current: i + 1, total: urls.length });
        setResults([...checked]);
        continue;
      }

      try {
        const res = await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });

        if (res.type === "opaque") {
          result = { url, status: "cors", code: null };
        } else if (res.ok) {
          result = { url, status: "ok", code: res.status };
        } else {
          result = { url, status: "broken", code: res.status };
        }
      } catch {
        result = { url, status: "broken", code: null };
      }

      checked.push(result);
      setProgress({ current: i + 1, total: urls.length });
      setResults([...checked]);
    }

    setLoading(false);
  };

  const statusIcon = (status: LinkResult["status"]) => {
    switch (status) {
      case "ok":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "broken":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cors":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const statusLabel = (status: LinkResult["status"]) => {
    switch (status) {
      case "ok":
        return "OK";
      case "broken":
        return "Broken";
      case "cors":
        return "CORS Blocked";
      case "invalid":
        return "Invalid URL";
    }
  };

  const statusClass = (status: LinkResult["status"]) => {
    switch (status) {
      case "ok":
        return "text-green-500";
      case "broken":
        return "text-red-500";
      case "cors":
        return "text-yellow-500";
      case "invalid":
        return "text-red-400";
    }
  };

  const okCount = results.filter((r) => r.status === "ok").length;
  const brokenCount = results.filter((r) => r.status === "broken").length;
  const corsCount = results.filter((r) => r.status === "cors").length;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Paste HTML or URLs (one per line)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={'https://example.com\nhttps://example.com/about\n\n— or paste HTML with <a href="..."> tags —'}
          className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
          {loading
            ? `Checking ${progress.current}/${progress.total}...`
            : "Check Links"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-green-500 font-medium">
              {okCount} OK
            </span>
            <span className="text-red-500 font-medium">
              {brokenCount} Broken
            </span>
            <span className="text-yellow-500 font-medium">
              {corsCount} CORS Blocked
            </span>
            <span className="text-muted-foreground">
              {results.length} Total
            </span>
          </div>

          {corsCount > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
              <strong>Note:</strong> Some URLs returned opaque responses due to
              CORS restrictions. These links may still be working — browser
              security prevents reading their status from a different origin.
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    URL
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Code
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0"
                  >
                    <td className="max-w-xs truncate px-4 py-2.5 font-mono text-xs text-foreground">
                      {r.url}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(r.status)}`}
                      >
                        {statusIcon(r.status)}
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {r.code ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
