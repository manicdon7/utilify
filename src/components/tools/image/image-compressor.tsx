"use client";

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { DownloadButton } from "@/components/shared/download-button";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalPreview, setOriginalPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    setOriginalSize(file.size);
    setOriginalPreview(URL.createObjectURL(file));
    setCompressedBlob(null);
    setPreviewUrl("");
    setCompressedSize(0);
    setError("");
  }, []);

  const handleCompress = async () => {
    if (!originalFile) return;
    setLoading(true);
    setError("");
    try {
      const options = {
        maxSizeMB: (originalFile.size / (1024 * 1024)) * (quality / 100),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality / 100,
      };
      const compressed = await imageCompression(originalFile, options);
      setCompressedBlob(compressed);
      setCompressedSize(compressed.size);
      setPreviewUrl(URL.createObjectURL(compressed));
    } catch {
      setError("Failed to compress image. Please try a different file.");
    } finally {
      setLoading(false);
    }
  };

  const reduction = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : "0";

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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Quality</label>
            <span className="text-sm text-muted-foreground">{quality}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1% (smallest)</span>
            <span>100% (best quality)</span>
          </div>
        </div>

        <button
          onClick={handleCompress}
          disabled={!originalFile || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Compressing…" : "Compress Image"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {(originalPreview || previewUrl) && (
        <div className="grid gap-6 md:grid-cols-2">
          {originalPreview && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Original</h3>
              <img src={originalPreview} alt="Original" className="max-h-64 w-full rounded-lg object-contain" />
              <p className="text-sm text-muted-foreground">Size: {formatBytes(originalSize)}</p>
            </div>
          )}

          {previewUrl && compressedBlob && (
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Compressed</h3>
              <img src={previewUrl} alt="Compressed" className="max-h-64 w-full rounded-lg object-contain" />
              <p className="text-sm text-muted-foreground">
                Size: {formatBytes(compressedSize)}{" "}
                <span className="text-green-500 font-medium">(-{reduction}%)</span>
              </p>
              <DownloadButton
                data={compressedBlob}
                filename={`compressed-${originalFile?.name ?? "image.jpg"}`}
                mimeType={compressedBlob.type}
                label="Download Compressed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
