"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { CopyButton } from "@/components/shared/copy-button";

type UuidFormat = "lowercase" | "uppercase" | "lowercase-no-hyphens" | "uppercase-no-hyphens";

function formatUuid(uuid: string, format: UuidFormat): string {
  switch (format) {
    case "uppercase":
      return uuid.toUpperCase();
    case "lowercase-no-hyphens":
      return uuid.replace(/-/g, "");
    case "uppercase-no-hyphens":
      return uuid.replace(/-/g, "").toUpperCase();
    default:
      return uuid;
  }
}

export function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<UuidFormat>("lowercase");
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    const clamped = Math.min(100, Math.max(1, count));
    const generated = Array.from({ length: clamped }, () =>
      formatUuid(uuidv4(), format)
    );
    setUuids(generated);
  }, [count, format]);

  const allText = uuids.join("\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as UuidFormat)}
            className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="lowercase">lowercase (with hyphens)</option>
            <option value="uppercase">UPPERCASE (with hyphens)</option>
            <option value="lowercase-no-hyphens">lowercase (no hyphens)</option>
            <option value="uppercase-no-hyphens">UPPERCASE (no hyphens)</option>
          </select>
        </div>

        <button
          onClick={generate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Generate
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {uuids.length} UUID{uuids.length > 1 ? "s" : ""} generated
            </span>
            <CopyButton text={allText} className="" />
          </div>

          <div className="max-h-96 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-muted/50 p-3">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted px-3 py-2"
              >
                <code className="truncate font-mono text-sm text-foreground">{uuid}</code>
                <CopyButton text={uuid} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
