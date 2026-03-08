import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findTool, allTools, categories } from "@/lib/constants";
import { ToolPage } from "@/components/tools/tool-page";

interface Props {
  params: Promise<{ category: string; tool: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, tool: toolSlug } = await params;
  const tool = findTool(category, toolSlug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.description,
    openGraph: { title: `${tool.name} | Utilify`, description: tool.description },
  };
}

export async function generateStaticParams() {
  return allTools.map((t) => ({ category: t.categorySlug, tool: t.slug }));
}

export default async function ToolRoute({ params }: Props) {
  const { category, tool: toolSlug } = await params;
  const tool = findTool(category, toolSlug);
  if (!tool) notFound();
  return <ToolPage tool={tool} />;
}
