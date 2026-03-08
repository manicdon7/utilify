"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DownloadButton } from "@/components/shared/download-button";

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [tolerance, setTolerance] = useState(30);
  const [selectedColor, setSelectedColor] = useState<[number, number, number] | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setResultUrl("");
    setResultBlob(null);
    setSelectedColor(null);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
  }, []);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d")!;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setSelectedColor([pixel[0], pixel[1], pixel[2]]);
  };

  const handleRemove = async () => {
    if (!imgRef.current || !selectedColor) return;
    setLoading(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      const img = imgRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [tr, tg, tb] = selectedColor;

      for (let i = 0; i < data.length; i += 4) {
        const dist = colorDistance(data[i], data[i + 1], data[i + 2], tr, tg, tb);
        if (dist <= tolerance) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed"))), "image/png");
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to remove background.");
    } finally {
      setLoading(false);
    }
  };

  const hexColor = selectedColor
    ? `#${selectedColor.map((c) => c.toString(16).padStart(2, "0")).join("")}`
    : null;

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
              Click on the image to select the color you want to remove.
            </p>

            <div className="overflow-auto rounded-lg border border-border">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full cursor-crosshair"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {selectedColor && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Selected color:</span>
                <div
                  className="h-8 w-8 rounded border border-border"
                  style={{ backgroundColor: hexColor ?? undefined }}
                />
                <span className="text-sm text-muted-foreground font-mono">{hexColor}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Tolerance</label>
                <span className="text-sm text-muted-foreground">{tolerance}</span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Exact match</span>
                <span>Broad match</span>
              </div>
            </div>

            <button
              onClick={handleRemove}
              disabled={!selectedColor || loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Removing…" : "Remove Color"}
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
          <h3 className="text-sm font-semibold text-foreground">Result</h3>
          <div className="rounded-lg p-4" style={{ backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" }}>
            <img src={resultUrl} alt="Result" className="max-h-80 w-full object-contain" />
          </div>
          <DownloadButton
            data={resultBlob}
            filename={`bg-removed-${file?.name ?? "image.png"}`}
            mimeType="image/png"
            label="Download Result"
          />
        </div>
      )}
    </div>
  );
}
