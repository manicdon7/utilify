"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdBanner } from "@/components/adsense";
import type { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, category, categorySlug, children }: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/#${categorySlug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {category}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <AdBanner slot="top-tool" />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>

      <AdBanner slot="bottom-tool" />
    </div>
  );
}
