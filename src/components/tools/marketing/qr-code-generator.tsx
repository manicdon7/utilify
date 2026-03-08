"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

export function QrCodeGenerator() {
  const [data, setData] = useState("https://example.com");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderQR = useCallback(async () => {
    if (!canvasRef.current || !data.trim()) return;
    try {
      await QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: darkColor, light: lightColor },
      });
    } catch {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = darkColor;
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Invalid input", size / 2, size / 2);
      }
    }
  }, [data, size, errorLevel, darkColor, lightColor]);

  useEffect(() => {
    renderQR();
  }, [renderQR]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
  const selectClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <label className={labelClass}>Data (URL, text, etc.)</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter URL or text..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <span className="text-sm text-muted-foreground">{size}px</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100px</span>
              <span>1000px</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Error Correction Level</label>
            <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")} className={selectClass}>
              <option value="L">L - Low (7%)</option>
              <option value="M">M - Medium (15%)</option>
              <option value="Q">Q - Quartile (25%)</option>
              <option value="H">H - High (30%)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dark Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                />
                <input
                  type="text"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Light Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                />
                <input
                  type="text"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview */}
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground self-start">Preview</h3>
          <div className="flex flex-1 items-center justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          <button
            onClick={downloadPNG}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
