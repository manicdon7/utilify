"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export function CategoryTabs() {
  const [activeTab, setActiveTab] = useState(categories[0].slug);
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".section-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } },
      );
      gsap.fromTo(
        ".tab-btn",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".tool-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" },
    );
  }, [activeTab]);

  const activeCat = categories.find((c) => c.slug === activeTab) || categories[0];

  return (
    <section ref={sectionRef} id="all-tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="section-title mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore All Tools
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Browse by category or search for exactly what you need
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.slug === activeTab;
          return (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`tab-btn flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cat.name}</span>
              <span className="sm:hidden">{cat.name.split(" ")[0]}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {cat.tools.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Description */}
      <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <activeCat.icon className={`h-4 w-4 ${activeCat.color}`} />
        {activeCat.description}
      </div>

      {/* Tools Grid */}
      <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeCat.tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${activeCat.slug}/${tool.slug}`}
            className="tool-card group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold transition-colors group-hover:text-primary">{tool.name}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* All Tools CTA */}
      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{activeCat.tools.length}</span> tools in {activeCat.name}
          {" · "}
          <span className="font-medium text-foreground">{categories.reduce((acc, c) => acc + c.tools.length, 0)}</span> total tools available
        </p>
      </div>
    </section>
  );
}
