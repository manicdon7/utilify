"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="cta-content mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-[1px]">
        <div className="rounded-3xl bg-background/95 px-8 py-14 text-center backdrop-blur-sm sm:px-12">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-purple-500" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Things Done?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            All tools are free to use, work in your browser, and respect your privacy.
            Start with any tool — no account required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="#all-tools"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Browse All Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 font-medium transition-colors hover:bg-muted"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
