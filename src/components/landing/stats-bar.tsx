"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wrench, FolderOpen, Cpu, Lock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Wrench, label: "Tools Available", suffix: "+" },
  { icon: FolderOpen, label: "Categories", suffix: "" },
  { icon: Cpu, label: "AI-Powered", suffix: "" },
  { icon: Lock, label: "Privacy First", suffix: "" },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);

  const values = [65, 9, 18, 100];
  const suffixes = ["+", "", " Tools", "%"];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative z-10 -mt-6 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-xl backdrop-blur-md sm:grid-cols-4 sm:gap-4 sm:p-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card flex flex-col items-center gap-2 py-2 text-center">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold sm:text-3xl">{values[i]}{suffixes[i]}</span>
                <span className="text-xs text-muted-foreground sm:text-sm">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
