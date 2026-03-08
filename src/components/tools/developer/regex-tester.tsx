"use client";

import { useState, useMemo } from "react";

interface MatchInfo {
  value: string;
  index: number;
  groups: string[];
}

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: "" };

    try {
      const regex = new RegExp(pattern, flags);
      const results: MatchInfo[] = [];

      if (flags.includes("g")) {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (!match[0].length) regex.lastIndex++;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          results.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      return { matches: results, error: "" };
    } catch (e) {
      return {
        matches: [] as MatchInfo[],
        error: e instanceof Error ? e.message : "Invalid regex",
      };
    }
  }, [pattern, flags, testString]);

  const highlightedText = useMemo(() => {
    if (!pattern || !testString || error || matches.length === 0) return null;

    const parts: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;

    const sorted = [...matches].sort((a, b) => a.index - b.index);

    for (const match of sorted) {
      if (match.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, match.index), highlight: false });
      }
      parts.push({ text: match.value, highlight: true });
      lastIndex = match.index + match.value.length;
    }

    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), highlight: false });
    }

    return parts;
  }, [pattern, testString, error, matches]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Regex Pattern</label>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. \\d+|[a-z]+"
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Flags</label>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m..."
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Test String</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          className="h-40 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {highlightedText && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Highlighted Matches
            <span className="ml-2 text-muted-foreground">
              ({matches.length} match{matches.length !== 1 ? "es" : ""})
            </span>
          </label>
          <div className="whitespace-pre-wrap break-all rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground">
            {highlightedText.map((part, i) =>
              part.highlight ? (
                <mark key={i} className="rounded bg-yellow-400/40 px-0.5 text-foreground">
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Match Details</label>
          <div className="max-h-60 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Match</th>
                  <th className="px-3 py-2 font-medium">Index</th>
                  <th className="px-3 py-2 font-medium">Groups</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">{m.value}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.index}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {m.groups.length > 0 ? m.groups.join(", ") : "—"}
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
