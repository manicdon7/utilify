import {
  FileText, Image, Type, Code, Globe, TrendingUp, Shield,
} from "lucide-react";

export interface Tool {
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: typeof FileText;
  description: string;
  color: string;
  tools: Tool[];
}

export const categories: Category[] = [
  {
    name: "Document & PDF Tools",
    slug: "pdf",
    icon: FileText,
    description: "Convert, merge, split, and protect your PDF documents",
    color: "text-red-500",
    tools: [
      { name: "PDF to Word Converter", slug: "pdf-to-word", description: "Convert PDF files to editable Word documents", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "Word to PDF Converter", slug: "word-to-pdf", description: "Convert Word documents to PDF format", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "PDF Merger", slug: "pdf-merger", description: "Merge multiple PDF files into one document", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "PDF Splitter", slug: "pdf-splitter", description: "Split a PDF into separate pages or sections", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "PDF Compressor", slug: "pdf-compressor", description: "Reduce PDF file size without losing quality", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "Image to PDF", slug: "image-to-pdf", description: "Convert images to PDF documents", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "PDF Password Protector", slug: "pdf-password", description: "Add password protection to your PDF files", category: "Document & PDF Tools", categorySlug: "pdf" },
      { name: "PDF Unlock Tool", slug: "pdf-unlock", description: "Remove password protection from PDF files", category: "Document & PDF Tools", categorySlug: "pdf" },
    ],
  },
  {
    name: "Image Tools",
    slug: "image",
    icon: Image,
    description: "Compress, resize, convert, and edit your images",
    color: "text-blue-500",
    tools: [
      { name: "Image Compressor", slug: "image-compressor", description: "Compress images to reduce file size", category: "Image Tools", categorySlug: "image" },
      { name: "Image Resizer", slug: "image-resizer", description: "Resize images to any dimension", category: "Image Tools", categorySlug: "image" },
      { name: "Background Remover", slug: "background-remover", description: "Remove backgrounds from images using AI", category: "Image Tools", categorySlug: "image" },
      { name: "Image Format Converter", slug: "image-converter", description: "Convert between PNG, JPG, and WEBP formats", category: "Image Tools", categorySlug: "image" },
      { name: "Screenshot to Text (OCR)", slug: "ocr", description: "Extract text from images and screenshots", category: "Image Tools", categorySlug: "image" },
      { name: "Image Cropper", slug: "image-cropper", description: "Crop images to custom dimensions", category: "Image Tools", categorySlug: "image" },
      { name: "Image Watermark", slug: "image-watermark", description: "Add text or image watermarks to your images", category: "Image Tools", categorySlug: "image" },
      { name: "Color Palette Extractor", slug: "color-palette", description: "Extract color palettes from any image", category: "Image Tools", categorySlug: "image" },
    ],
  },
  {
    name: "Text & Writing Tools",
    slug: "text",
    icon: Type,
    description: "Count words, check grammar, and transform text",
    color: "text-green-500",
    tools: [
      { name: "Word Counter", slug: "word-counter", description: "Count words, characters, sentences, and paragraphs", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Character Counter", slug: "character-counter", description: "Count characters with and without spaces", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Grammar Checker", slug: "grammar-checker", description: "Check and fix grammar errors using AI", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Text Summarizer", slug: "text-summarizer", description: "Summarize long text into key points using AI", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Paraphrasing Tool", slug: "paraphraser", description: "Rewrite text in different styles using AI", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Case Converter", slug: "case-converter", description: "Convert text between UPPERCASE, lowercase, and more", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Lorem Ipsum Generator", slug: "lorem-ipsum", description: "Generate placeholder text for designs", category: "Text & Writing Tools", categorySlug: "text" },
      { name: "Text to Speech", slug: "text-to-speech", description: "Convert text to spoken audio", category: "Text & Writing Tools", categorySlug: "text" },
    ],
  },
  {
    name: "Developer Tools",
    slug: "developer",
    icon: Code,
    description: "Format, encode, generate, and test developer utilities",
    color: "text-purple-500",
    tools: [
      { name: "JSON Formatter", slug: "json-formatter", description: "Format and beautify JSON data", category: "Developer Tools", categorySlug: "developer" },
      { name: "JSON to CSV Converter", slug: "json-to-csv", description: "Convert JSON data to CSV format", category: "Developer Tools", categorySlug: "developer" },
      { name: "Base64 Encoder/Decoder", slug: "base64", description: "Encode and decode Base64 strings", category: "Developer Tools", categorySlug: "developer" },
      { name: "HTML Minifier", slug: "html-minifier", description: "Minify HTML code to reduce file size", category: "Developer Tools", categorySlug: "developer" },
      { name: "CSS Minifier", slug: "css-minifier", description: "Minify CSS code to reduce file size", category: "Developer Tools", categorySlug: "developer" },
      { name: "JavaScript Minifier", slug: "js-minifier", description: "Minify JavaScript code to reduce file size", category: "Developer Tools", categorySlug: "developer" },
      { name: "Regex Tester", slug: "regex-tester", description: "Test and debug regular expressions", category: "Developer Tools", categorySlug: "developer" },
      { name: "Timestamp Converter", slug: "timestamp-converter", description: "Convert between Unix timestamps and dates", category: "Developer Tools", categorySlug: "developer" },
      { name: "UUID Generator", slug: "uuid-generator", description: "Generate unique UUIDs/GUIDs", category: "Developer Tools", categorySlug: "developer" },
      { name: "Markdown Editor", slug: "markdown-editor", description: "Write and preview Markdown in real-time", category: "Developer Tools", categorySlug: "developer" },
    ],
  },
  {
    name: "Web & SEO Tools",
    slug: "seo",
    icon: Globe,
    description: "Optimize your website for search engines",
    color: "text-orange-500",
    tools: [
      { name: "Meta Tag Generator", slug: "meta-tag-generator", description: "Generate HTML meta tags for SEO", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Sitemap Generator", slug: "sitemap-generator", description: "Generate XML sitemaps for your website", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Robots.txt Generator", slug: "robots-txt-generator", description: "Generate robots.txt files for your website", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Website Speed Checker", slug: "speed-checker", description: "Check your website loading speed", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Broken Link Checker", slug: "broken-link-checker", description: "Find broken links on any webpage", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Keyword Density Checker", slug: "keyword-density", description: "Analyze keyword density in your content", category: "Web & SEO Tools", categorySlug: "seo" },
      { name: "Open Graph Preview", slug: "og-preview", description: "Preview how your page looks when shared", category: "Web & SEO Tools", categorySlug: "seo" },
    ],
  },
  {
    name: "Marketing & Social Media",
    slug: "marketing",
    icon: TrendingUp,
    description: "Generate content for marketing and social media",
    color: "text-pink-500",
    tools: [
      { name: "Hashtag Generator", slug: "hashtag-generator", description: "Generate trending hashtags for social media", category: "Marketing & Social Media", categorySlug: "marketing" },
      { name: "YouTube Title Generator", slug: "youtube-title", description: "Generate catchy YouTube video titles using AI", category: "Marketing & Social Media", categorySlug: "marketing" },
      { name: "Blog Headline Generator", slug: "blog-headline", description: "Generate compelling blog headlines using AI", category: "Marketing & Social Media", categorySlug: "marketing" },
      { name: "Email Subject Line Generator", slug: "email-subject", description: "Generate effective email subject lines using AI", category: "Marketing & Social Media", categorySlug: "marketing" },
      { name: "QR Code Generator", slug: "qr-code-generator", description: "Generate QR codes for URLs, text, and more", category: "Marketing & Social Media", categorySlug: "marketing" },
      { name: "URL Shortener", slug: "url-shortener", description: "Shorten long URLs for easy sharing", category: "Marketing & Social Media", categorySlug: "marketing" },
    ],
  },
  {
    name: "Utility & Productivity",
    slug: "utility",
    icon: Shield,
    description: "Passwords, generators, and productivity tools",
    color: "text-teal-500",
    tools: [
      { name: "Password Generator", slug: "password-generator", description: "Generate strong, secure passwords", category: "Utility & Productivity", categorySlug: "utility" },
      { name: "Random Name Generator", slug: "name-generator", description: "Generate random names and usernames", category: "Utility & Productivity", categorySlug: "utility" },
      { name: "Invoice Generator", slug: "invoice-generator", description: "Create professional invoices online", category: "Utility & Productivity", categorySlug: "utility" },
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export function findTool(categorySlug: string, toolSlug: string): Tool | undefined {
  return allTools.find((t) => t.categorySlug === categorySlug && t.slug === toolSlug);
}

export function findCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
