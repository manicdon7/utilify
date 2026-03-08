"use client";

import { useState, useCallback } from "react";
import { CopyButton } from "@/components/shared/copy-button";

interface ColorSwatch {
  hex: string;
  count: number;
  r: number;
  g: number;
  b: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function extractColors(imageData: ImageData, numColors: number = 8): ColorSwatch[] {
  const { data, width, height } = imageData;
  const sampleStep = Math.max(1, Math.floor((width * height) / 10000));

  const samples: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const a = data[i + 3];
    if (a < 128) continue;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (samples.length === 0) return [];

  // k-means clustering
  let centroids: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(samples.length / numColors));
  for (let i = 0; i < numColors && i * step < samples.length; i++) {
    centroids.push([...samples[i * step]]);
  }

  const assignments = new Array(samples.length).fill(0);
  const maxIter = 15;

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < samples.length; i++) {
      const [r, g, b] = samples[i];
      let minDist = Infinity;
      let best = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d = colorDist(r, g, b, centroids[c][0], centroids[c][1], centroids[c][2]);
        if (d < minDist) {
          minDist = d;
          best = c;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }

    if (!changed) break;

    const sums: [number, number, number][] = centroids.map(() => [0, 0, 0]);
    const counts = new Array(centroids.length).fill(0);

    for (let i = 0; i < samples.length; i++) {
      const c = assignments[i];
      sums[c][0] += samples[i][0];
      sums[c][1] += samples[i][1];
      sums[c][2] += samples[i][2];
      counts[c]++;
    }

    for (let c = 0; c < centroids.length; c++) {
      if (counts[c] > 0) {
        centroids[c] = [sums[c][0] / counts[c], sums[c][1] / counts[c], sums[c][2] / counts[c]];
      }
    }
  }

  const counts = new Array(centroids.length).fill(0);
  for (let i = 0; i < assignments.length; i++) {
    counts[assignments[i]]++;
  }

  const swatches: ColorSwatch[] = centroids
    .map((c, i) => ({
      r: Math.round(c[0]),
      g: Math.round(c[1]),
      b: Math.round(c[2]),
      hex: rgbToHex(c[0], c[1], c[2]),
      count: counts[i],
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  return swatches;
}

export function ColorPalette() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setColors([]);
    setError("");
  }, []);

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extracted = extractColors(imageData, 8);
      setColors(extracted);
    } catch {
      setError("Failed to extract colors from the image.");
    } finally {
      setLoading(false);
    }
  };

  const totalPixels = colors.reduce((s, c) => s + c.count, 0);

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

        <button
          onClick={handleExtract}
          disabled={!file || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing…" : "Extract Colors"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {previewUrl && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Image Preview</h3>
          <img src={previewUrl} alt="Preview" className="max-h-64 w-full rounded-lg object-contain" />
        </div>
      )}

      {colors.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Dominant Colors</h3>

          <div className="flex h-10 w-full overflow-hidden rounded-lg">
            {colors.map((c) => (
              <div
                key={c.hex}
                style={{
                  backgroundColor: c.hex,
                  width: `${(c.count / totalPixels) * 100}%`,
                }}
                title={c.hex}
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {colors.map((c) => (
              <div
                key={c.hex}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3"
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium text-foreground">{c.hex}</p>
                  <p className="text-xs text-muted-foreground">
                    {((c.count / totalPixels) * 100).toFixed(1)}%
                  </p>
                </div>
                <CopyButton text={c.hex} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
