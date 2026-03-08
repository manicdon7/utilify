"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "@/components/shared/copy-button";

export function MetaTagGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [robotsIndex, setRobotsIndex] = useState("index");
  const [robotsFollow, setRobotsFollow] = useState("follow");
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1.0");
  const [charset, setCharset] = useState("UTF-8");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogType, setOgType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");

  const output = useMemo(() => {
    const lines: string[] = [];

    if (charset) lines.push(`<meta charset="${charset}" />`);
    if (viewport) lines.push(`<meta name="viewport" content="${viewport}" />`);
    if (title) lines.push(`<title>${title}</title>`);
    if (description) lines.push(`<meta name="description" content="${description}" />`);
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}" />`);
    if (author) lines.push(`<meta name="author" content="${author}" />`);
    lines.push(`<meta name="robots" content="${robotsIndex}, ${robotsFollow}" />`);

    if (ogTitle || ogDescription || ogImage || ogType) {
      lines.push("");
      if (ogType) lines.push(`<meta property="og:type" content="${ogType}" />`);
      if (ogTitle) lines.push(`<meta property="og:title" content="${ogTitle}" />`);
      if (ogDescription) lines.push(`<meta property="og:description" content="${ogDescription}" />`);
      if (ogImage) lines.push(`<meta property="og:image" content="${ogImage}" />`);
    }

    if (twitterCard) {
      lines.push("");
      lines.push(`<meta name="twitter:card" content="${twitterCard}" />`);
      if (ogTitle) lines.push(`<meta name="twitter:title" content="${ogTitle}" />`);
      if (ogDescription) lines.push(`<meta name="twitter:description" content="${ogDescription}" />`);
      if (ogImage) lines.push(`<meta name="twitter:image" content="${ogImage}" />`);
    }

    return lines.join("\n");
  }, [title, description, keywords, author, robotsIndex, robotsFollow, viewport, charset, ogTitle, ogDescription, ogImage, ogType, twitterCard]);

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
  const selectClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Meta */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Basic Meta Tags</h3>

          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Website" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your page..." rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Keywords</label>
            <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="John Doe" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Robots Index</label>
              <select value={robotsIndex} onChange={(e) => setRobotsIndex(e.target.value)} className={selectClass}>
                <option value="index">index</option>
                <option value="noindex">noindex</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Robots Follow</label>
              <select value={robotsFollow} onChange={(e) => setRobotsFollow(e.target.value)} className={selectClass}>
                <option value="follow">follow</option>
                <option value="nofollow">nofollow</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Viewport</label>
              <input type="text" value={viewport} onChange={(e) => setViewport(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Charset</label>
              <select value={charset} onChange={(e) => setCharset(e.target.value)} className={selectClass}>
                <option value="UTF-8">UTF-8</option>
                <option value="ISO-8859-1">ISO-8859-1</option>
                <option value="ASCII">ASCII</option>
              </select>
            </div>
          </div>
        </div>

        {/* Open Graph & Twitter */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Open Graph & Twitter</h3>

          <div>
            <label className={labelClass}>OG Title</label>
            <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Open Graph Title" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>OG Description</label>
            <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="Open Graph description..." rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>OG Image URL</label>
            <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/image.jpg" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>OG Type</label>
              <select value={ogType} onChange={(e) => setOgType(e.target.value)} className={selectClass}>
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
                <option value="video.movie">video.movie</option>
                <option value="music.song">music.song</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Twitter Card</label>
              <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className={selectClass}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="app">app</option>
                <option value="player">player</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Generated Meta Tags</h3>
          <CopyButton text={output} />
        </div>
        <textarea
          readOnly
          value={output}
          rows={14}
          className="w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
