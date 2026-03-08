"use client";

import { useState, useMemo } from "react";

export function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();

    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences =
      trimmed === "" ? 0 : (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0);
    const paragraphs =
      trimmed === ""
        ? 0
        : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const avgWordLength =
      words > 0
        ? (
            trimmed.split(/\s+/).reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, "").length, 0) / words
          ).toFixed(1)
        : "0";
    const readingTime = Math.max(1, Math.ceil(words / 225));
    const speakingTime = Math.max(1, Math.ceil(words / 150));

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      avgWordLength,
      readingTime,
      speakingTime,
    };
  }, [text]);

  const statCards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Avg Word Length", value: stats.avgWordLength },
    { label: "Reading Time", value: `${stats.readingTime} min` },
    { label: "Speaking Time", value: `${stats.speakingTime} min` },
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
        {statCards.map((stat) => (
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
    </div>
  );
}
