"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Search, X, ArrowRight, LayoutGrid, List } from "lucide-react";
import { categories, allTools } from "@/lib/constants";

type ViewMode = "grid" | "list";

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          (!query ||
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase())) &&
          (!activeCategory || cat.slug === activeCategory),
      ),
    }))
    .filter((cat) => cat.tools.length > 0);

  const totalShown = filteredCategories.reduce((a, c) => a + c.tools.length, 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".tool-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 15, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.02, ease: "power2.out" },
    );
  }, [query, activeCategory, view]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div ref={headerRef} className="border-b border-border bg-gradient-to-b from-muted/50 to-background px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All Tools</h1>
          <p className="mt-2 text-muted-foreground">
            Browse all {allTools.length} tools across {categories.length} categories
          </p>

          {/* Search + View Toggle */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-10 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <button
                onClick={() => setView("grid")}
                className={`rounded-md p-2 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-md p-2 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !activeCategory
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              All ({allTools.length})
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === cat.slug
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.name.split(" ")[0]} ({cat.tools.length})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div ref={gridRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {totalShown === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium">No tools found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear filters
            </p>
            <button
              onClick={() => { setQuery(""); setActiveCategory(null); }}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.slug}>
                  {/* Category Header */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className={`rounded-xl bg-muted p-2.5 ${cat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{cat.name}</h2>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {cat.tools.length} tools
                    </span>
                  </div>

                  {/* Tools */}
                  {view === "grid" ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {cat.tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${cat.slug}/${tool.slug}`}
                          className="tool-card group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="relative">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-semibold transition-colors group-hover:text-primary">{tool.name}</h3>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border rounded-xl border border-border bg-card">
                      {cat.tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={`/tools/${cat.slug}/${tool.slug}`}
                          className="tool-card group flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <h3 className="font-medium transition-colors group-hover:text-primary">{tool.name}</h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer summary */}
        {totalShown > 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalShown}</span> of {allTools.length} tools
            {activeCategory && " in this category"}
            {query && ` matching "${query}"`}
          </p>
        )}
      </div>
    </div>
  );
}
