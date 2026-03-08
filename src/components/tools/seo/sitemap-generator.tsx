"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { DownloadButton } from "@/components/shared/download-button";

interface SitemapEntry {
  id: string;
  url: string;
  changefreq: string;
  priority: string;
}

const FREQUENCIES = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

let nextId = 1;

function createEntry(url = ""): SitemapEntry {
  return {
    id: String(nextId++),
    url,
    changefreq: "weekly",
    priority: "0.5",
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function SitemapGenerator() {
  const [entries, setEntries] = useState<SitemapEntry[]>([createEntry()]);
  const [newUrl, setNewUrl] = useState("");
  const [newFreq, setNewFreq] = useState("weekly");
  const [newPriority, setNewPriority] = useState("0.5");

  const addEntry = () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setEntries((prev) => [
      ...prev,
      { ...createEntry(url), changefreq: newFreq, priority: newPriority },
    ]);
    setNewUrl("");
  };

  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const updateEntry = (id: string, field: keyof SitemapEntry, value: string) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const validEntries = entries.filter((e) => e.url.trim());

  const output = useMemo(() => {
    if (validEntries.length === 0) return "";

    const today = new Date().toISOString().split("T")[0];
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const entry of validEntries) {
      lines.push("  <url>");
      lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);
      lines.push(`    <lastmod>${today}</lastmod>`);
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push("  </url>");
    }

    lines.push("</urlset>");
    return lines.join("\n");
  }, [validEntries]);

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const selectClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Add URL form */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Add URL</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>URL</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEntry()}
              placeholder="https://example.com/page"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Change Frequency</label>
            <select
              value={newFreq}
              onChange={(e) => setNewFreq(e.target.value)}
              className={selectClass}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={addEntry}
          disabled={!newUrl.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add URL
        </button>
      </div>

      {/* URL Table */}
      {entries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">
                  URL
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">
                  Frequency
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">
                  Priority
                </th>
                <th className="px-4 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={entry.url}
                      onChange={(e) =>
                        updateEntry(entry.id, "url", e.target.value)
                      }
                      placeholder="https://example.com"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={entry.changefreq}
                      onChange={(e) =>
                        updateEntry(entry.id, "changefreq", e.target.value)
                      }
                      className={selectClass}
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={entry.priority}
                      onChange={(e) =>
                        updateEntry(entry.id, "priority", e.target.value)
                      }
                      className="w-20 rounded-lg border border-border bg-muted px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Sitemap ({validEntries.length} URL{validEntries.length !== 1 ? "s" : ""})
            </h3>
            <div className="flex items-center gap-2">
              <CopyButton text={output} />
              <DownloadButton
                data={output}
                filename="sitemap.xml"
                mimeType="application/xml"
                label="Download"
              />
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            rows={Math.min(20, output.split("\n").length + 1)}
            className="w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
