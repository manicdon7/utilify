"use client";

import { ToolLayout } from "@/components/shared/tool-layout";
import type { Tool } from "@/lib/constants";
import dynamic from "next/dynamic";

const toolComponents: Record<string, React.ComponentType> = {
  // Text tools
  "word-counter": dynamic(() => import("./text/word-counter").then((m) => ({ default: m.WordCounter }))),
  "character-counter": dynamic(() => import("./text/character-counter").then((m) => ({ default: m.CharacterCounter }))),
  "case-converter": dynamic(() => import("./text/case-converter").then((m) => ({ default: m.CaseConverter }))),
  "lorem-ipsum": dynamic(() => import("./text/lorem-ipsum").then((m) => ({ default: m.LoremIpsum }))),
  "grammar-checker": dynamic(() => import("./text/grammar-checker").then((m) => ({ default: m.GrammarChecker }))),
  "text-summarizer": dynamic(() => import("./text/text-summarizer").then((m) => ({ default: m.TextSummarizer }))),
  "paraphraser": dynamic(() => import("./text/paraphraser").then((m) => ({ default: m.Paraphraser }))),
  "text-to-speech": dynamic(() => import("./text/text-to-speech").then((m) => ({ default: m.TextToSpeech }))),

  // AI tools
  "ai-story-generator": dynamic(() => import("./ai/ai-story-generator").then((m) => ({ default: m.AiStoryGenerator }))),
  "ai-poem-generator": dynamic(() => import("./ai/ai-poem-generator").then((m) => ({ default: m.AiPoemGenerator }))),
  "explain-like-im-5": dynamic(() => import("./ai/explain-like-im-5").then((m) => ({ default: m.ExplainLikeIm5 }))),
  "ai-code-explainer": dynamic(() => import("./ai/ai-code-explainer").then((m) => ({ default: m.AiCodeExplainer }))),
  "ai-sql-generator": dynamic(() => import("./ai/ai-sql-generator").then((m) => ({ default: m.AiSqlGenerator }))),
  "ai-bio-generator": dynamic(() => import("./ai/ai-bio-generator").then((m) => ({ default: m.AiBioGenerator }))),
  "ai-product-description": dynamic(() => import("./ai/ai-product-description").then((m) => ({ default: m.AiProductDescription }))),
  "ai-interview-questions": dynamic(() => import("./ai/ai-interview-questions").then((m) => ({ default: m.AiInterviewQuestions }))),
  "ai-recipe-generator": dynamic(() => import("./ai/ai-recipe-generator").then((m) => ({ default: m.AiRecipeGenerator }))),
  "ai-cover-letter": dynamic(() => import("./ai/ai-cover-letter").then((m) => ({ default: m.AiCoverLetter }))),

  // Developer tools
  "json-formatter": dynamic(() => import("./developer/json-formatter").then((m) => ({ default: m.JsonFormatter }))),
  "json-to-csv": dynamic(() => import("./developer/json-to-csv").then((m) => ({ default: m.JsonToCsv }))),
  "base64": dynamic(() => import("./developer/base64-tool").then((m) => ({ default: m.Base64Tool }))),
  "html-minifier": dynamic(() => import("./developer/html-minifier-tool").then((m) => ({ default: m.HtmlMinifierTool }))),
  "css-minifier": dynamic(() => import("./developer/css-minifier-tool").then((m) => ({ default: m.CssMinifierTool }))),
  "js-minifier": dynamic(() => import("./developer/js-minifier-tool").then((m) => ({ default: m.JsMinifierTool }))),
  "regex-tester": dynamic(() => import("./developer/regex-tester").then((m) => ({ default: m.RegexTester }))),
  "timestamp-converter": dynamic(() => import("./developer/timestamp-converter").then((m) => ({ default: m.TimestampConverter }))),
  "uuid-generator": dynamic(() => import("./developer/uuid-generator").then((m) => ({ default: m.UuidGenerator }))),
  "markdown-editor": dynamic(() => import("./developer/markdown-editor").then((m) => ({ default: m.MarkdownEditor }))),

  // SEO tools
  "meta-tag-generator": dynamic(() => import("./seo/meta-tag-generator").then((m) => ({ default: m.MetaTagGenerator }))),
  "sitemap-generator": dynamic(() => import("./seo/sitemap-generator").then((m) => ({ default: m.SitemapGenerator }))),
  "robots-txt-generator": dynamic(() => import("./seo/robots-txt-generator").then((m) => ({ default: m.RobotsTxtGenerator }))),
  "og-preview": dynamic(() => import("./seo/og-preview").then((m) => ({ default: m.OgPreview }))),
  "speed-checker": dynamic(() => import("./seo/speed-checker").then((m) => ({ default: m.SpeedChecker }))),
  "broken-link-checker": dynamic(() => import("./seo/broken-link-checker").then((m) => ({ default: m.BrokenLinkChecker }))),
  "keyword-density": dynamic(() => import("./seo/keyword-density").then((m) => ({ default: m.KeywordDensity }))),

  // Marketing tools
  "qr-code-generator": dynamic(() => import("./marketing/qr-code-generator").then((m) => ({ default: m.QrCodeGenerator }))),
  "hashtag-generator": dynamic(() => import("./marketing/hashtag-generator").then((m) => ({ default: m.HashtagGenerator }))),
  "youtube-title": dynamic(() => import("./marketing/youtube-title").then((m) => ({ default: m.YouTubeTitleGenerator }))),
  "blog-headline": dynamic(() => import("./marketing/blog-headline").then((m) => ({ default: m.BlogHeadlineGenerator }))),
  "email-subject": dynamic(() => import("./marketing/email-subject").then((m) => ({ default: m.EmailSubjectGenerator }))),
  "url-shortener": dynamic(() => import("./marketing/url-shortener").then((m) => ({ default: m.UrlShortener }))),

  // Utility tools
  "password-generator": dynamic(() => import("./utility/password-generator").then((m) => ({ default: m.PasswordGenerator }))),
  "name-generator": dynamic(() => import("./utility/name-generator").then((m) => ({ default: m.NameGenerator }))),
  "invoice-generator": dynamic(() => import("./utility/invoice-generator").then((m) => ({ default: m.InvoiceGenerator }))),

  // PDF tools
  "pdf-to-word": dynamic(() => import("./pdf/pdf-to-word").then((m) => ({ default: m.PdfToWord }))),
  "word-to-pdf": dynamic(() => import("./pdf/word-to-pdf").then((m) => ({ default: m.WordToPdf }))),
  "pdf-merger": dynamic(() => import("./pdf/pdf-merger").then((m) => ({ default: m.PdfMerger }))),
  "pdf-splitter": dynamic(() => import("./pdf/pdf-splitter").then((m) => ({ default: m.PdfSplitter }))),
  "pdf-compressor": dynamic(() => import("./pdf/pdf-compressor").then((m) => ({ default: m.PdfCompressor }))),
  "image-to-pdf": dynamic(() => import("./pdf/image-to-pdf").then((m) => ({ default: m.ImageToPdf }))),
  "pdf-password": dynamic(() => import("./pdf/pdf-password").then((m) => ({ default: m.PdfPassword }))),
  "pdf-unlock": dynamic(() => import("./pdf/pdf-unlock").then((m) => ({ default: m.PdfUnlock }))),

  // Image tools
  "image-compressor": dynamic(() => import("./image/image-compressor").then((m) => ({ default: m.ImageCompressor }))),
  "image-resizer": dynamic(() => import("./image/image-resizer").then((m) => ({ default: m.ImageResizer }))),
  "background-remover": dynamic(() => import("./image/background-remover").then((m) => ({ default: m.BackgroundRemover }))),
  "image-converter": dynamic(() => import("./image/image-converter").then((m) => ({ default: m.ImageConverter }))),
  "ocr": dynamic(() => import("./image/ocr-tool").then((m) => ({ default: m.OcrTool }))),
  "image-cropper": dynamic(() => import("./image/image-cropper").then((m) => ({ default: m.ImageCropper }))),
  "image-watermark": dynamic(() => import("./image/image-watermark").then((m) => ({ default: m.ImageWatermark }))),
  "color-palette": dynamic(() => import("./image/color-palette").then((m) => ({ default: m.ColorPalette }))),
};

export function ToolPage({ tool }: { tool: Tool }) {
  const Component = toolComponents[tool.slug];

  if (!Component) {
    return (
      <ToolLayout title={tool.name} description={tool.description} category={tool.category} categorySlug={tool.categorySlug}>
        <p className="text-muted-foreground">This tool is coming soon.</p>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout title={tool.name} description={tool.description} category={tool.category} categorySlug={tool.categorySlug}>
      <Component />
    </ToolLayout>
  );
}
