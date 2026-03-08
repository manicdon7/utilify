"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { allTools } from "@/lib/constants";

export function SearchFilter() {
  const [query, setQuery] = useState("");

  const filtered = query.length > 1
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-lg">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tools... (e.g. PDF, JSON, password)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtered.length > 0 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border bg-card p-2 shadow-xl">
          {filtered.slice(0, 8).map((tool) => (
            <Link
              key={`${tool.categorySlug}-${tool.slug}`}
              href={`/tools/${tool.categorySlug}/${tool.slug}`}
              onClick={() => setQuery("")}
              className="flex flex-col rounded-lg px-4 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="text-sm font-medium">{tool.name}</span>
              <span className="text-xs text-muted-foreground">{tool.category}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
