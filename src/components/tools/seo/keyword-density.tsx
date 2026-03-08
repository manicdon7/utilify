"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "must", "can", "could", "am", "i", "me",
  "my", "we", "our", "you", "your", "he", "she", "it", "they", "them",
  "his", "her", "its", "their", "this", "that", "these", "those", "and",
  "but", "or", "nor", "not", "so", "yet", "both", "either", "neither",
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "up",
  "about", "into", "through", "during", "before", "after", "above",
  "below", "between", "out", "off", "over", "under", "again", "further",
  "then", "once", "here", "there", "when", "where", "why", "how", "all",
  "each", "every", "any", "few", "more", "most", "other", "some", "such",
  "no", "than", "too", "very", "just", "also", "if", "as", "what",
  "which", "who", "whom", "whose", "while", "although", "because",
  "since", "until", "unless", "however", "therefore", "thus", "hence",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function getNgrams(words: string[], n: number): Map<string, number> {
  const filtered = words.filter((w) => !STOP_WORDS.has(w) && w.length > 1);
  const map = new Map<string, number>();

  for (let i = 0; i <= filtered.length - n; i++) {
    const gram = filtered.slice(i, i + n).join(" ");
    map.set(gram, (map.get(gram) || 0) + 1);
  }

  return map;
}

interface GramEntry {
  phrase: string;
  count: number;
  density: number;
}

export function KeywordDensity() {
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  const analysis = useMemo(() => {
    const words = tokenize(content);
    const totalWords = words.length;
    const uniqueWords = new Set(words).size;

    const unigrams = getNgrams(words, 1);
    const bigrams = getNgrams(words, 2);
    const trigrams = getNgrams(words, 3);

    const toEntries = (map: Map<string, number>): GramEntry[] =>
      Array.from(map.entries())
        .map(([phrase, count]) => ({
          phrase,
          count,
          density: totalWords > 0 ? (count / totalWords) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

    return {
      totalWords,
      uniqueWords,
      unigrams: toEntries(unigrams),
      bigrams: toEntries(bigrams),
      trigrams: toEntries(trigrams),
    };
  }, [content]);

  const currentData =
    activeTab === 1
      ? analysis.unigrams
      : activeTab === 2
        ? analysis.bigrams
        : analysis.trigrams;

  const filtered = filter
    ? currentData.filter((e) =>
        e.phrase.toLowerCase().includes(filter.toLowerCase())
      )
    : currentData;

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Paste your content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Paste your article, blog post, or page content here to analyze keyword density..."
          className={inputClass}
        />
      </div>

      {analysis.totalWords > 0 && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {analysis.totalWords}
              </p>
              <p className="text-xs text-muted-foreground">Total Words</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {analysis.uniqueWords}
              </p>
              <p className="text-xs text-muted-foreground">Unique Words</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {analysis.unigrams.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Keywords (excl. stop words)
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setActiveTab(n)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === n
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}-Word
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter keywords..."
              className={`${inputClass} pl-9`}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground">
                    Keyword
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-foreground">
                    Count
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-foreground">
                    Density
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground w-32">
                    Bar
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((entry, i) => (
                  <tr
                    key={entry.phrase}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2 font-medium text-foreground">
                      {entry.phrase}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground">
                      {entry.count}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {entry.density.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, entry.density * 10)}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No keywords found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 50 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing top 50 of {filtered.length} results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
