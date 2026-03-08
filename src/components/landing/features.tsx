"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Shield, Globe, Palette, Brain, Download } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Most tools run entirely in your browser. No uploads, no waiting for servers.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your files never leave your device for client-side tools. Zero data collection.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Brain,
    title: "AI-Powered",
    description: "Grammar checking, text summarization, content generation with cutting-edge AI.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Responsive design that works beautifully on desktop, tablet, and mobile.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Palette,
    title: "Dark & Light Mode",
    description: "Easy on the eyes with automatic theme switching based on your preference.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Download,
    title: "No Installation",
    description: "Open your browser and start using. No downloads, no sign-ups, no hassle.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, scrollTrigger: { trigger: ref.current, start: "top 80%" } },
      );
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="feature-title mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Utilify?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Built for speed, privacy, and ease of use
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="feature-card group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex rounded-xl ${f.bg} p-3`}>
                  <Icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
