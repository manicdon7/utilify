"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { GripVertical, Loader2, Trash2, FileText } from "lucide-react";

interface PdfFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
}

export function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    setError("");
    setMergedPdf(null);

    const newFiles: PdfFile[] = [];
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          data: buffer,
          pageCount: doc.getPageCount(),
        });
      } catch {
        setError(`Failed to load "${file.name}". It may be corrupted or encrypted.`);
      }
    }

    setPdfFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdf(null);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setPdfFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(idx, 0, moved);
      return updated;
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      setError("Please upload at least 2 PDF files to merge.");
      return;
    }

    setLoading(true);
    setError("");
    setMergedPdf(null);

    try {
      const mergedDoc = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const srcDoc = await PDFDocument.load(pdfFile.data, { ignoreEncryption: true });
        const copiedPages = await mergedDoc.copyPages(
          srcDoc,
          srcDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }

      const bytes = await mergedDoc.save();
      setMergedPdf(bytes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to merge PDF files."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".pdf"
        multiple
        onFiles={handleFiles}
        label="Drop PDF files here or click to upload (multiple allowed)"
      />

      {pdfFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {pdfFiles.length} file{pdfFiles.length !== 1 ? "s" : ""} &middot;{" "}
              {totalPages} total page{totalPages !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              Drag to reorder
            </span>
          </div>

          <div className="space-y-1.5">
            {pdfFiles.map((file, idx) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors ${
                  dragIdx === idx ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                  {idx + 1}
                </span>
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm text-foreground">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {file.pageCount} pg{file.pageCount !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={mergePdfs}
          disabled={pdfFiles.length < 2 || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Merge PDFs
        </button>

        {mergedPdf && (
          <DownloadButton
            data={mergedPdf}
            filename="merged.pdf"
            mimeType="application/pdf"
            label="Download Merged PDF"
          />
        )}
      </div>
    </div>
  );
}
