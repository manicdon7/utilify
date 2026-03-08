import { HeroSection } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { CategoryTabs } from "@/components/landing/category-tabs";
import { FeaturesSection } from "@/components/landing/features";
import { CtaSection } from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoryTabs />
      <FeaturesSection />
      <CtaSection />
    </>
  );
}
