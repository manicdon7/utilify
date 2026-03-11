"use client";

import { useState } from "react";
import { Link2, Loader2, Download, AlertCircle, ImageIcon } from "lucide-react";

interface Platform {
  name: string;
  color: string;
  placeholder: string;
  icon: string;
  examples: string[];
}

const PLATFORMS: Record<string, Platform> = {
  instagram: {
    name: "Instagram",
    color: "text-pink-500",
    placeholder: "https://www.instagram.com/p/...",
    icon: "📸",
    examples: ["Post", "Reel", "Story (must be public)", "IGTV"],
  },
  twitter: {
    name: "X (Twitter)",
    color: "text-sky-500",
    placeholder: "https://twitter.com/... or https://x.com/...",
    icon: "𝕏",
    examples: ["Tweet videos", "GIFs", "Spaces recordings"],
  },
  facebook: {
    name: "Facebook",
    color: "text-blue-600",
    placeholder: "https://www.facebook.com/watch?v=...",
    icon: "👤",
    examples: ["Public videos", "Reels", "Shorts"],
  },
  tiktok: {
    name: "TikTok",
    color: "text-foreground",
    placeholder: "https://www.tiktok.com/@user/video/...",
    icon: "♪",
    examples: ["Videos (no watermark)", "Slideshows", "Audio"],
  },
};

interface PickerItem {
  url: string;
  thumb?: string;
  type?: string;
}

interface DownloadResult {
  status: "success" | "picker";
  url?: string;
  filename?: string;
  items?: PickerItem[];
  audio?: string;
}

export function SocialDownloader({ platform }: { platform: keyof typeof PLATFORMS }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState("");

  const config = PLATFORMS[platform];

  const fetchDownload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), platform }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch media");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (downloadUrl: string, filename = "download.mp4") => {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <p className="font-semibold">{config.name} Downloader</p>
          <p className="text-xs text-muted-foreground">
            Supports: {config.examples.join(" · ")}
          </p>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{config.name} URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDownload()}
              placeholder={config.placeholder}
              className="w-full rounded-lg border border-border bg-muted py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={fetchDownload}
            disabled={!url.trim() || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? "Fetching..." : "Download"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Single file result */}
      {result?.status === "success" && result.url && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
          <p className="mb-3 text-sm font-semibold text-green-700 dark:text-green-400">✅ Ready to download</p>
          <button
            onClick={() => triggerDownload(result.url!, result.filename)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download {result.filename || "File"}
          </button>
        </div>
      )}

      {/* Carousel / multiple items */}
      {result?.status === "picker" && result.items && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Multiple items found — select what to download:</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((item, i) => (
              <button
                key={i}
                onClick={() => triggerDownload(item.url, `item-${i + 1}.${item.type === "photo" ? "jpg" : "mp4"}`)}
                className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md"
              >
                {item.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumb} alt={`Item ${i + 1}`} className="h-28 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-lg bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Download className="h-3 w-3" />
                  {item.type === "photo" ? "Photo" : "Video"} {i + 1}
                </span>
              </button>
            ))}
          </div>
          {result.audio && (
            <button
              onClick={() => triggerDownload(result.audio!, "audio.mp3")}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm hover:bg-muted/80"
            >
              <Download className="h-4 w-4" />
              Download Audio Track
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        ⚠️ Only download content you have rights to. For personal use only. Always respect the platform&apos;s Terms of Service.
      </p>
    </div>
  );
}
