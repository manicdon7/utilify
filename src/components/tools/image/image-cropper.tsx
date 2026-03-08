"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { DownloadButton } from "@/components/shared/download-button";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setResultUrl("");
    setResultBlob(null);
    setCrop(null);
  }, []);

  useEffect(() => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const maxW = containerRef.current?.clientWidth ?? 800;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const dw = Math.floor(img.naturalWidth * scale);
      const dh = Math.floor(img.naturalHeight * scale);
      setDisplayW(dw);
      setDisplayH(dh);

      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;
      canvas.width = dw;
      canvas.height = dh;
      overlay.width = dw;
      overlay.height = dh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, dw, dh);
    };
    img.src = URL.createObjectURL(file);
  }, [file]);

  const drawOverlay = useCallback((rect: CropRect | null) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!rect) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, overlay.width, overlay.height);
    ctx.clearRect(rect.x, rect.y, rect.w, rect.h);

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.setLineDash([]);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, displayW)),
      y: Math.max(0, Math.min(e.clientY - rect.top, displayH)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    setStartPos(pos);
    setDragging(true);
    setCrop(null);
    drawOverlay(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const pos = getCanvasCoords(e);
    const rect: CropRect = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    };
    setCrop(rect);
    drawOverlay(rect);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleCrop = async () => {
    if (!imgRef.current || !crop || crop.w < 1 || crop.h < 1) return;
    setError("");
    try {
      const scaleX = imgRef.current.naturalWidth / displayW;
      const scaleY = imgRef.current.naturalHeight / displayH;
      const sx = Math.round(crop.x * scaleX);
      const sy = Math.round(crop.y * scaleY);
      const sw = Math.round(crop.w * scaleX);
      const sh = Math.round(crop.h * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed"))), "image/png");
      });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError("Failed to crop image.");
    }
  };

  const cropNatural = crop && imgRef.current
    ? {
        w: Math.round(crop.w * (imgRef.current.naturalWidth / displayW)),
        h: Math.round(crop.h * (imgRef.current.naturalHeight / displayH)),
      }
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
              Click and drag on the image to select the crop area.
            </p>

            <div ref={containerRef} className="relative inline-block overflow-hidden rounded-lg border border-border">
              <canvas ref={canvasRef} className="block" />
              <canvas
                ref={overlayRef}
                className="absolute top-0 left-0 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            {crop && crop.w > 0 && crop.h > 0 && cropNatural && (
              <p className="text-sm text-muted-foreground">
                Crop dimensions: {cropNatural.w} × {cropNatural.h} px
              </p>
            )}

            <button
              onClick={handleCrop}
              disabled={!crop || crop.w < 1 || crop.h < 1}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crop Image
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
          <h3 className="text-sm font-semibold text-foreground">Cropped Result</h3>
          <img src={resultUrl} alt="Cropped" className="max-h-80 w-full rounded-lg object-contain" />
          <DownloadButton
            data={resultBlob}
            filename={`cropped-${file?.name ?? "image.png"}`}
            mimeType="image/png"
            label="Download Cropped"
          />
        </div>
      )}
    </div>
  );
}
