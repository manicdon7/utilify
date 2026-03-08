"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { DownloadButton } from "@/components/shared/download-button";

interface RuleSet {
  id: string;
  userAgent: string;
  allow: string;
  disallow: string;
}

let nextId = 1;

function createRule(): RuleSet {
  return { id: String(nextId++), userAgent: "*", allow: "/", disallow: "" };
}

export function RobotsTxtGenerator() {
  const [rules, setRules] = useState<RuleSet[]>([createRule()]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");

  const addRule = () => setRules((r) => [...r, createRule()]);
  const removeRule = (id: string) => setRules((r) => r.filter((x) => x.id !== id));
  const updateRule = (id: string, field: keyof RuleSet, value: string) =>
    setRules((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const output = useMemo(() => {
    const sections: string[] = [];

    for (const rule of rules) {
      const lines: string[] = [];
      lines.push(`User-agent: ${rule.userAgent || "*"}`);

      const allowPaths = rule.allow
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);
      const disallowPaths = rule.disallow
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      for (const p of disallowPaths) lines.push(`Disallow: ${p}`);
      for (const p of allowPaths) lines.push(`Allow: ${p}`);

      if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);

      sections.push(lines.join("\n"));
    }

    let result = sections.join("\n\n");
    if (sitemapUrl) result += `\n\nSitemap: ${sitemapUrl}`;

    return result;
  }, [rules, sitemapUrl, crawlDelay]);

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <div className="space-y-6">
      {/* Rule Sets */}
      <div className="space-y-4">
        {rules.map((rule, i) => (
          <div key={rule.id} className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Rule Set {i + 1}</h3>
              {rules.length > 1 && (
                <button
                  onClick={() => removeRule(rule.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className={labelClass}>User-Agent</label>
              <input
                type="text"
                value={rule.userAgent}
                onChange={(e) => updateRule(rule.id, "userAgent", e.target.value)}
                placeholder="*"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Allow Paths (one per line)</label>
                <textarea
                  value={rule.allow}
                  onChange={(e) => updateRule(rule.id, "allow", e.target.value)}
                  placeholder={"/\n/public/"}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Disallow Paths (one per line)</label>
                <textarea
                  value={rule.disallow}
                  onChange={(e) => updateRule(rule.id, "disallow", e.target.value)}
                  placeholder={"/admin/\n/private/"}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addRule}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add Rule Set
        </button>
      </div>

      {/* Global Settings */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Global Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Sitemap URL</label>
            <input
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Crawl Delay (seconds)</label>
            <input
              type="number"
              min={0}
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              placeholder="10"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Generated robots.txt</h3>
          <div className="flex items-center gap-2">
            <CopyButton text={output} />
            <DownloadButton data={output} filename="robots.txt" mimeType="text/plain" label="Download" />
          </div>
        </div>
        <textarea
          readOnly
          value={output}
          rows={12}
          className="w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
