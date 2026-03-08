"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/shared/copy-button";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
  "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
  "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident",
  "similique", "mollitia", "animi", "perspiciatis", "unde", "omnis", "iste",
  "natus", "error", "voluptatem", "accusantium", "doloremque", "laudantium",
  "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore",
  "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo",
];

const LOREM_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(): string {
  const length = 8 + Math.floor(Math.random() * 10);
  const words = Array.from({ length }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(): string {
  const count = 4 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, generateSentence).join(" ");
}

type OutputType = "paragraphs" | "sentences" | "words";

export function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<OutputType>("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const generated = useMemo(() => {
    let result: string;

    if (type === "paragraphs") {
      const paragraphs = Array.from({ length: count }, generateParagraph);
      if (startWithLorem && paragraphs.length > 0) {
        paragraphs[0] = LOREM_START + " " + paragraphs[0].split(". ").slice(1).join(". ");
      }
      result = paragraphs.join("\n\n");
    } else if (type === "sentences") {
      const sentences = Array.from({ length: count }, generateSentence);
      if (startWithLorem && sentences.length > 0) {
        sentences[0] = LOREM_START;
      }
      result = sentences.join(" ");
    } else {
      const words = Array.from({ length: count }, randomWord);
      if (startWithLorem && words.length >= 5) {
        const loremStart = ["lorem", "ipsum", "dolor", "sit", "amet"];
        loremStart.forEach((w, i) => {
          if (i < words.length) words[i] = w;
        });
      }
      result = words.join(" ");
    }

    return result;
  }, [count, type, startWithLorem]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Count
          </label>
          <input
            type="number"
            min={1}
            max={type === "words" ? 500 : 20}
            value={count}
            onChange={(e) =>
              setCount(
                Math.max(
                  1,
                  Math.min(type === "words" ? 500 : 20, Number(e.target.value) || 1)
                )
              )
            }
            className="w-24 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Type
          </label>
          <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
            {(["paragraphs", "sentences", "words"] as OutputType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 pb-1">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">
            Start with &quot;Lorem ipsum...&quot;
          </span>
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Generated Text
          </label>
          {generated && <CopyButton text={generated} />}
        </div>
        <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
          {generated || (
            <span className="text-muted-foreground">
              Generated text will appear here...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
