"use client";

import { useState, useRef, useCallback } from "react";
import { DownloadButton } from "@/components/shared/download-button";

const PRESETS = [
  { label: "1920 × 1080", w: 1920, h: 1080 },
  { label: "1280 × 720", w: 1280, h: 720 },
  { label: "800 × 600", w: 800, h: 600 },
] as const;

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setResultUrl("");
    setResultBlob(null);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      imgRef.current = img;
    };
    img.src = url;
  }, []);

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockAspect && naturalWidth > 0) {
      setHeight(Math.round((w / naturalWidth) * naturalHeight));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockAspect && naturalHeight > 0) {
      setWidth(Math.round((h / naturalHeight) * naturalWidth));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspect(false);
  };

  const handleResize = async () => {
    if (!imgRef.current || width <= 0 || height <= 0) return;
    setLoading(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imgRef.current, 0, 0, width, height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed"))), "image/png");
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to resize image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
          />
        </div>

        {file && (
          <>
            <p className="text-sm text-muted-foreground">
              Original: {naturalWidth} × {naturalHeight}
            </p>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => { setWidth(naturalWidth); setHeight(naturalHeight); setLockAspect(true); }}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Custom
              </button>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`mb-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  lockAspect
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
                title="Lock aspect ratio"
              >
                {lockAspect ? "🔒" : "🔓"}
              </button>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={handleResize}
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resizing…" : "Resize Image"}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {resultUrl && resultBlob && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Resized Preview ({width} × {height})
          </h3>
          <img src={resultUrl} alt="Resized" className="max-h-80 w-full rounded-lg object-contain" />
          <DownloadButton
            data={resultBlob}
            filename={`resized-${width}x${height}-${file?.name ?? "image.png"}`}
            mimeType="image/png"
            label="Download Resized"
          />
        </div>
      )}
    </div>
  );
}
