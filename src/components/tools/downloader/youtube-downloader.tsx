"use client";

import { useState } from "react";
import { Youtube, Search, Loader2, Download, Music, Video } from "lucide-react";
import Image from "next/image";

interface Format {
  itag: number;
  quality: string;
  container: string;
  size: string;
  url: string;
  type: "video" | "audio";
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  views: string;
  formats: Format[];
}

export function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState("");

  const fetchInfo = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setInfo(null);

    try {
      const res = await fetch("/api/download/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch video");
      setInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: Format, videoPageUrl: string) => {
    const filename = `${info?.title || "video"}.${format.container}`.replace(/[<>:"/\\|?*]/g, "_");
    const proxyUrl = `/api/download/youtube/stream?url=${encodeURIComponent(videoPageUrl)}&itag=${format.itag}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const videoFormats = info?.formats.filter((f) => f.type === "video") || [];
  const audioFormats = info?.formats.filter((f) => f.type === "audio") || [];

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">YouTube Video URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInfo()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-border bg-muted py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={fetchInfo}
            disabled={!url.trim() || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Video Info */}
      {info && (
        <div className="space-y-5">
          {/* Thumbnail + Meta */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start">
            {info.thumbnail && (
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
                <Image
                  src={info.thumbnail}
                  alt={info.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-semibold leading-snug">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.author}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">⏱ {info.duration}</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">👁 {info.views} views</span>
              </div>
            </div>
          </div>

          {/* Video Quality Options */}
          {videoFormats.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Video className="h-4 w-4 text-red-500" />
                Video Downloads
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {videoFormats.map((f) => (
                  <button
                    key={f.itag}
                    onClick={() => handleDownload(f, url)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-all hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <div className="text-left">
                      <span className="font-semibold">{f.quality}</span>
                      <span className="ml-2 text-muted-foreground uppercase">{f.container}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">{f.size}</span>
                      <Download className="h-4 w-4 text-red-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio Options */}
          {audioFormats.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Music className="h-4 w-4 text-purple-500" />
                Audio Only
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {audioFormats.map((f) => (
                  <button
                    key={f.itag}
                    onClick={() => handleDownload(f, url)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-all hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                  >
                    <div className="text-left">
                      <span className="font-semibold">Audio</span>
                      <span className="ml-2 text-muted-foreground uppercase">{f.container}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs">{f.size}</span>
                      <Download className="h-4 w-4 text-purple-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        ⚠️ For personal use only. Respect copyright and YouTube&apos;s Terms of Service.
      </p>
    </div>
  );
}
