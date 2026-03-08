"use client";

import { useState, useMemo } from "react";

export function CharacterCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const totalChars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;

    const freq: Record<string, number> = {};
    for (const ch of text) {
      const display = ch === " " ? "Space" : ch === "\n" ? "Newline" : ch === "\t" ? "Tab" : ch;
      freq[display] = (freq[display] || 0) + 1;
    }
    const frequency = Object.entries(freq).sort((a, b) => b[1] - a[1]);

    return { totalChars, charsNoSpaces, words, lines, frequency };
  }, [text]);

  const summaryCards = [
    { label: "Total Characters", value: stats.totalChars },
    { label: "Without Spaces", value: stats.charsNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
  ];

  return (
    <div className="space-y-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="h-48 w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-muted/50 p-4 text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {stats.frequency.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Character Frequency
          </h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Character
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Count
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.frequency.map(([char, count]) => (
                  <tr
                    key={char}
                    className="border-t border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-2 font-mono text-foreground">
                      {char}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground">
                      {count}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {((count / stats.totalChars) * 100).toFixed(1)}%
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
