"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2, Image as ImageIcon, Trash2 } from "lucide-react";

type PageSize = "a4" | "letter" | "fit";

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89, label: "A4" },
  letter: { width: 612, height: 792, label: "Letter" },
  fit: { width: 0, height: 0, label: "Fit to Image" },
} as const;

interface ImageFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  type: string;
  previewUrl: string;
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [margin, setMargin] = useState(20);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    setError("");
    setPdfBytes(null);

    const newImages: ImageFile[] = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        data: buffer,
        type: file.type,
        previewUrl,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setPdfBytes(null);
  };

  const createPdf = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError("");
    setPdfBytes(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        let embeddedImage;
        const bytes = new Uint8Array(img.data);

        if (img.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(bytes);
        } else if (
          img.type === "image/jpeg" ||
          img.type === "image/jpg"
        ) {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } else {
          // Try to use canvas to convert unsupported formats to PNG
          const blob = new Blob([bytes], { type: img.type });
          const bitmap = await createImageBitmap(blob);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bitmap, 0, 0);
          const pngDataUrl = canvas.toDataURL("image/png");
          const pngBase64 = pngDataUrl.split(",")[1];
          const pngBytes = Uint8Array.from(atob(pngBase64), (c) =>
            c.charCodeAt(0)
          );
          embeddedImage = await pdfDoc.embedPng(pngBytes);
          bitmap.close();
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pw: number, ph: number;
        if (pageSize === "fit") {
          pw = imgWidth + margin * 2;
          ph = imgHeight + margin * 2;
        } else {
          pw = PAGE_SIZES[pageSize].width;
          ph = PAGE_SIZES[pageSize].height;
        }

        const page = pdfDoc.addPage([pw, ph]);
        const drawableWidth = pw - margin * 2;
        const drawableHeight = ph - margin * 2;

        const scale = Math.min(
          drawableWidth / imgWidth,
          drawableHeight / imgHeight,
          1
        );
        const scaledW = imgWidth * scale;
        const scaledH = imgHeight * scale;

        // Center on page
        const x = margin + (drawableWidth - scaledW) / 2;
        const y = margin + (drawableHeight - scaledH) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledW,
          height: scaledH,
        });
      }

      const bytes = await pdfDoc.save();
      setPdfBytes(bytes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create PDF from images."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploader
        accept="image/*"
        multiple
        onFiles={handleFiles}
        label="Drop images here or click to upload (multiple allowed)"
      />

      {images.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} selected
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs text-white">{img.name}</p>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Options</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as PageSize)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(PAGE_SIZES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Margin (pts)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={margin}
              onChange={(e) => setMargin(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={createPdf}
          disabled={images.length === 0 || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Create PDF
        </button>

        {pdfBytes && (
          <DownloadButton
            data={pdfBytes}
            filename="images.pdf"
            mimeType="application/pdf"
            label="Download PDF"
          />
        )}
      </div>
    </div>
  );
}
