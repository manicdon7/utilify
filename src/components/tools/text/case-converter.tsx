"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/shared/copy-button";

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

function toSentenceCase(str: string): string {
  return str
    .split(/([.!?]\s*)/)
    .map((segment, i) => {
      if (i % 2 === 0 && segment.length > 0) {
        return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
      }
      return segment;
    })
    .join("");
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-_.]+/g, "_")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s\-_.]+/g, "-")
    .toLowerCase();
}

function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

function toDotCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .replace(/[\s\-_.]+/g, ".")
    .toLowerCase();
}

const converters = [
  { label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
  { label: "lowercase", fn: (s: string) => s.toLowerCase() },
  { label: "Title Case", fn: toTitleCase },
  { label: "Sentence case", fn: toSentenceCase },
  { label: "camelCase", fn: toCamelCase },
  { label: "snake_case", fn: toSnakeCase },
  { label: "kebab-case", fn: toKebabCase },
  { label: "PascalCase", fn: toPascalCase },
  { label: "CONSTANT_CASE", fn: toConstantCase },
  { label: "dot.case", fn: toDotCase },
] as const;

export function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const applyConversion = useCallback(
    (fn: (s: string) => string) => {
      setOutput(fn(input));
    },
    [input]
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text to convert..."
          className="h-36 w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {converters.map(({ label, fn }) => (
          <button
            key={label}
            onClick={() => applyConversion(fn)}
            disabled={!input}
            className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Output</label>
          {output && <CopyButton text={output} />}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Converted text will appear here..."
          className="h-36 w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
