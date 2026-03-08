"use client";

import { useState, useEffect } from "react";
import { Link2, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

interface ShortenedUrl {
  code: string;
  original: string;
  short: string;
  createdAt: string;
}

const STORAGE_KEY = "utilify_shortened_urls";

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function loadHistory(): ShortenedUrl[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: ShortenedUrl[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function UrlShortener() {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState<ShortenedUrl[]>([]);
  const [lastShortened, setLastShortened] = useState<ShortenedUrl | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleShorten = () => {
    if (!url.trim()) return;

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = "https://" + target;

    const code = generateCode();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://utilify.app";
    const entry: ShortenedUrl = {
      code,
      original: target,
      short: `${origin}/s/${code}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...history];
    setHistory(updated);
    saveHistory(updated);
    setLastShortened(entry);
    setUrl("");
  };

  const handleRemove = (code: string) => {
    const updated = history.filter((h) => h.code !== code);
    setHistory(updated);
    saveHistory(updated);
    if (lastShortened?.code === code) setLastShortened(null);
  };

  const handleClearAll = () => {
    setHistory([]);
    saveHistory([]);
    setLastShortened(null);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
        <strong>Demo Mode:</strong> This is a client-side demo. Shortened URLs
        are stored in your browser&apos;s localStorage. There is no redirect
        server — the short links won&apos;t actually redirect.
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleShorten()}
          placeholder="https://example.com/very/long/url/that/needs/shortening"
          className={inputClass}
        />
        <button
          onClick={handleShorten}
          disabled={!url.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Link2 className="h-4 w-4" />
          Shorten
        </button>
      </div>

      {lastShortened && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Shortened URL
          </h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-lg bg-muted px-4 py-2.5 font-mono text-sm text-foreground">
              {lastShortened.short}
            </code>
            <CopyButton text={lastShortened.short} />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            Original: {lastShortened.original}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              History ({history.length})
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Short URL
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Original URL
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Created
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr
                    key={entry.code}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                      <span className="text-primary">/s/{entry.code}</span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-xs text-muted-foreground">
                      {entry.original}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CopyButton text={entry.short} />
                        <button
                          onClick={() => handleRemove(entry.code)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
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
