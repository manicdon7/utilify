"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2, ArrowDown } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function PdfCompressor() {
  const [compressedPdf, setCompressedPdf] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setCompressedPdf(null);
    setOriginalSize(file.size);
    setFileName(file.name.replace(/\.pdf$/i, ""));

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Rebuild: copy all pages into a fresh document, stripping unused objects and metadata
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((page) => newDoc.addPage(page));

      // Copy basic metadata
      const title = srcDoc.getTitle();
      if (title) newDoc.setTitle(title);

      const bytes = await newDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setCompressedPdf(bytes);
      setCompressedSize(bytes.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to compress PDF."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reduction =
    originalSize > 0
      ? Math.max(0, ((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".pdf"
        onFiles={handleFiles}
        label="Drop a PDF file here or click to upload"
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 p-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Compressing PDF...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {compressedPdf && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatBytes(originalSize)}
                </p>
              </div>

              <ArrowDown className="h-5 w-5 text-muted-foreground" />

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Compressed</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatBytes(compressedSize)}
                </p>
              </div>

              <div className="rounded-full bg-primary/10 px-3 py-1">
                <span className="text-sm font-medium text-primary">
                  {reduction > 0
                    ? `-${reduction.toFixed(1)}%`
                    : "No reduction"}
                </span>
              </div>
            </div>

            {reduction <= 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                This PDF is already well-optimized. The rebuilt version may be
                slightly larger due to structural differences.
              </p>
            )}
          </div>

          <DownloadButton
            data={compressedPdf}
            filename={`${fileName}_compressed.pdf`}
            mimeType="application/pdf"
            label="Download Compressed PDF"
          />
        </div>
      )}
    </div>
  );
}
