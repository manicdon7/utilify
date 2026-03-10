"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Sparkles, ArrowDown, Zap, Shield, Globe } from "lucide-react";
import { SearchFilter } from "@/components/search-filter";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(searchRef.current, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 }, "-=0.3");

      gsap.to(".float-icon", {
        y: -12,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4,
      });

      gsap.fromTo(".float-icon",
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, delay: 0.8, ease: "back.out(1.7)" }
      );

      gsap.to(".bg-orb", {
        x: "random(-30, 30)",
        y: "random(-30, 30)",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/5" />
        <div className="bg-orb absolute top-40 -right-20 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/5" />
        <div className="bg-orb absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-cyan-400/8 blur-3xl dark:bg-cyan-500/5" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 dark:opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
        {/* Floating icons */}
        <div ref={floatingRef} className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="float-icon absolute top-20 left-[10%] rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-sm">
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <div className="float-icon absolute top-32 right-[12%] rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-sm">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div className="float-icon absolute bottom-32 left-[15%] rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-sm">
            <Globe className="h-6 w-6 text-blue-500" />
          </div>
          <div className="float-icon absolute bottom-40 right-[8%] rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
        </div>

        <div className="text-center">
          <div ref={badgeRef} className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-5 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm dark:border-blue-800/60 dark:bg-blue-950/80 dark:text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            60+ Free Online Tools — No Sign-up Needed
          </div>

          <h1 ref={titleRef} className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block">Your Ultimate</span>
            <span className="mt-2 block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Toolbox Online
            </span>
          </h1>

          <p ref={subtitleRef} className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Transform PDFs, compress images, format code, generate content with AI, and so much more.
            Everything runs in your browser — fast, private, and completely free.
          </p>

          {/* Search */}
          <div ref={searchRef} className="mx-auto mt-10 max-w-xl">
            <SearchFilter />
          </div>

          {/* Scroll hint */}
          <div className="mt-12 flex justify-center">
            <a href="#all-tools" className="group flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
              <span className="text-xs font-medium">Explore Tools</span>
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
