"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { allTools } from "@/lib/constants";

export function SearchFilter() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length > 1
      ? allTools.filter(
          (t) =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 shadow-lg transition-all ${
          focused ? "border-primary/50 shadow-xl shadow-primary/5 ring-2 ring-primary/10" : "border-border"
        }`}
      >
        <Search className={`h-5 w-5 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search 60+ tools... (e.g. PDF, AI, image)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
        />
        {query && (
          <button onClick={() => setQuery("")} className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="hidden rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {filtered.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border bg-card p-2 shadow-2xl">
          <p className="mb-1 px-3 py-1 text-xs font-medium text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
          {filtered.slice(0, 8).map((tool) => (
            <Link
              key={`${tool.categorySlug}-${tool.slug}`}
              href={`/tools/${tool.categorySlug}/${tool.slug}`}
              onClick={() => setQuery("")}
              className="flex items-center justify-between rounded-lg px-4 py-2.5 transition-colors hover:bg-muted"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{tool.name}</span>
                <span className="text-xs text-muted-foreground">{tool.category}</span>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </Link>
          ))}
          {filtered.length > 8 && (
            <p className="px-3 py-2 text-center text-xs text-muted-foreground">
              +{filtered.length - 8} more results
            </p>
          )}
        </div>
      )}

      {query.length > 1 && filtered.length === 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border bg-card p-6 text-center shadow-2xl">
          <p className="text-sm text-muted-foreground">No tools found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
