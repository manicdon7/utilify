"use client";

import { useState, useRef, useCallback } from "react";
import { DownloadButton } from "@/components/shared/download-button";

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tiled";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "tiled", label: "Tiled" },
];

export function ImageWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<Position>("center");
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
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = URL.createObjectURL(f);
  }, []);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleApply = async () => {
    if (!imgRef.current || !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = hexToRgba(color, opacity);
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize;
      const pad = 20;

      if (position === "tiled") {
        ctx.textAlign = "left";
        const gapX = textW + 80;
        const gapY = textH + 80;
        for (let y = textH; y < canvas.height; y += gapY) {
          for (let x = 0; x < canvas.width; x += gapX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      } else {
        let x: number, y: number;
        switch (position) {
          case "top-left":
            ctx.textAlign = "left";
            x = pad;
            y = pad + textH / 2;
            break;
          case "top-right":
            ctx.textAlign = "right";
            x = canvas.width - pad;
            y = pad + textH / 2;
            break;
          case "bottom-left":
            ctx.textAlign = "left";
            x = pad;
            y = canvas.height - pad - textH / 2;
            break;
          case "bottom-right":
            ctx.textAlign = "right";
            x = canvas.width - pad;
            y = canvas.height - pad - textH / 2;
            break;
          default:
            ctx.textAlign = "center";
            x = canvas.width / 2;
            y = canvas.height / 2;
        }
        ctx.fillText(text, x, y);
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed"))), "image/png");
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to apply watermark.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

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
          <label className="block text-sm font-medium text-foreground mb-1">Watermark Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter watermark text…"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Font Size (px)</label>
            <input
              type="number"
              min={8}
              max={500}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Opacity</label>
            <span className="text-sm text-muted-foreground">{opacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Position</label>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPosition(p.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  position === p.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={!file || !text.trim() || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Applying…" : "Apply Watermark"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {resultUrl && resultBlob && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Watermarked Preview</h3>
          <img src={resultUrl} alt="Watermarked" className="max-h-80 w-full rounded-lg object-contain" />
          <DownloadButton
            data={resultBlob}
            filename={`watermarked-${file?.name ?? "image.png"}`}
            mimeType="image/png"
            label="Download Watermarked"
          />
        </div>
      )}
    </div>
  );
}
