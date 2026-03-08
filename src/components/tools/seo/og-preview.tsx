"use client";

import { useState } from "react";

export function OgPreview() {
  const [url, setUrl] = useState("https://example.com");
  const [title, setTitle] = useState("My Awesome Website");
  const [description, setDescription] = useState(
    "This is a description of the page that will show up in search results and social media previews."
  );
  const [imageUrl, setImageUrl] = useState("");

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div className="space-y-8">
      {/* Input fields */}
      <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border bg-card p-5">
        <div>
          <label className={labelClass}>URL</label>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Image URL</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/og-image.jpg" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page Title" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Page description..." className={inputClass} />
        </div>
      </div>

      {/* Previews */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Facebook / Open Graph */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Facebook / Open Graph</h3>
          <div className="overflow-hidden rounded-lg border border-[#dadde1] bg-white">
            {imageUrl && (
              <div className="aspect-[1.91/1] w-full bg-gray-100">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="border-t border-[#dadde1] px-3 py-2.5">
              <p className="text-xs uppercase text-[#606770]">{domain}</p>
              <p className="mt-0.5 text-[15px] font-semibold leading-tight text-[#1d2129]">
                {title || "Page Title"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#606770]">
                {description || "Page description will appear here."}
              </p>
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Twitter Card</h3>
          <div className="overflow-hidden rounded-2xl border border-[#cfd9de] bg-white">
            {imageUrl && (
              <div className="aspect-[2/1] w-full bg-gray-100">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="border-t border-[#cfd9de] px-3 py-2.5">
              <p className="text-[13px] text-[#536471]">{domain}</p>
              <p className="mt-0.5 text-[15px] font-bold leading-tight text-[#0f1419]">
                {title || "Page Title"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#536471]">
                {description || "Page description will appear here."}
              </p>
            </div>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">LinkedIn</h3>
          <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
            {imageUrl && (
              <div className="aspect-[1.91/1] w-full bg-gray-100">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="border-t border-[#e0e0e0] px-3 py-2.5">
              <p className="text-sm font-semibold leading-tight text-[#000000e6]">
                {title || "Page Title"}
              </p>
              <p className="mt-1 text-xs text-[#00000099]">{domain}</p>
            </div>
          </div>
        </div>

        {/* Google Search Result */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Google Search Result</h3>
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                {domain.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-[#202124]">{domain}</p>
                <p className="text-xs text-[#4d5156]">{url}</p>
              </div>
            </div>
            <p className="mt-1.5 text-xl text-[#1a0dab] hover:underline cursor-pointer">
              {title || "Page Title"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">
              {description || "Page description will appear here."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
