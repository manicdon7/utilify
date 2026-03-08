"use client";

import { useState, useRef, useCallback } from "react";
import { DownloadButton } from "@/components/shared/download-button";

type OutputFormat = "png" | "jpeg" | "webp";

const FORMAT_MIME: Record<OutputFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [originalFormat, setOriginalFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(92);
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    const ext = f.name.split(".").pop()?.toLowerCase() ?? f.type.split("/")[1] ?? "unknown";
    setOriginalFormat(ext.toUpperCase());
    setError("");
    setResultUrl("");
    setResultBlob(null);
    setConvertedSize(0);

    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = URL.createObjectURL(f);
  }, []);

  const handleConvert = async () => {
    if (!imgRef.current) return;
    setLoading(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imgRef.current, 0, 0);

      const mime = FORMAT_MIME[outputFormat];
      const q = outputFormat === "png" ? undefined : quality / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion failed"))), mime, q);
      });

      setResultBlob(blob);
      setConvertedSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to convert image. Please try a different file.");
    } finally {
      setLoading(false);
    }
  };

  const showQualitySlider = outputFormat === "jpeg" || outputFormat === "webp";

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
          <p className="text-sm text-muted-foreground">
            Original format: <span className="font-medium text-foreground">{originalFormat}</span>{" "}
            · Size: {formatBytes(originalSize)}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Output Format</label>
          <div className="flex rounded-lg border border-border w-fit">
            {(["png", "jpeg", "webp"] as OutputFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => { setOutputFormat(fmt); setResultUrl(""); setResultBlob(null); }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  outputFormat === fmt
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                } ${fmt === "png" ? "rounded-l-lg" : ""} ${fmt === "webp" ? "rounded-r-lg" : ""}`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {showQualitySlider && (
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
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Converting…" : "Convert Image"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {resultUrl && resultBlob && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Converted Result</h3>
          <img src={resultUrl} alt="Converted" className="max-h-80 w-full rounded-lg object-contain" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Format: <span className="font-medium text-foreground">{outputFormat.toUpperCase()}</span></span>
            <span>Size: <span className="font-medium text-foreground">{formatBytes(convertedSize)}</span></span>
            {originalSize > 0 && (
              <span className={convertedSize < originalSize ? "text-green-500" : "text-orange-500"}>
                ({convertedSize < originalSize ? "-" : "+"}{Math.abs(((convertedSize / originalSize) - 1) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <DownloadButton
            data={resultBlob}
            filename={`converted.${outputFormat}`}
            mimeType={FORMAT_MIME[outputFormat]}
            label={`Download ${outputFormat.toUpperCase()}`}
          />
        </div>
      )}
    </div>
  );
}
