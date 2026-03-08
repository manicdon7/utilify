"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { FileText, Loader2 } from "lucide-react";

export function PdfToWord() {
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setExtractedText("");
    setFileName(file.name.replace(/\.pdf$/i, ""));

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      setPageCount(pages.length);

      const textParts: string[] = [];

      // pdf-lib doesn't have built-in text extraction, so we use the raw page content
      // For a more robust solution, a server-side library would be needed
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        textParts.push(
          `--- Page ${i + 1} (${Math.round(width)} x ${Math.round(height)}) ---\n`
        );

        // Attempt to extract text from the page's content stream
        try {
          const content = page.node.lookup(page.node.get("Contents" as any) as any);
          if (content && typeof content === "object" && "decodeText" in content) {
            const decoded = (content as any).decodeText();
            const textMatches = decoded.match(/\((.*?)\)/g);
            if (textMatches) {
              const extracted = textMatches
                .map((m: string) => m.slice(1, -1))
                .join(" ");
              textParts.push(extracted);
            }
          }
        } catch {
          // Content extraction not available for this page structure
        }
      }

      let result = textParts.join("\n");
      if (result.replace(/--- Page \d+.*?---\n/g, "").trim().length === 0) {
        result =
          `PDF loaded successfully: ${pages.length} page(s)\n\n` +
          `Note: This PDF may contain scanned images or complex layouts.\n` +
          `Text extraction from client-side is limited.\n` +
          `The PDF structure has been parsed but readable text content\n` +
          `could not be directly extracted from the content streams.\n\n` +
          pages
            .map(
              (p, i) =>
                `Page ${i + 1}: ${Math.round(p.getSize().width)} x ${Math.round(p.getSize().height)} pts`
            )
            .join("\n");
      }

      setExtractedText(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process PDF file."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
            Extracting text from PDF...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {extractedText && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Extracted Content ({pageCount} page{pageCount !== 1 ? "s" : ""})
              </span>
            </div>
            <DownloadButton
              data={extractedText}
              filename={`${fileName || "extracted"}.txt`}
              mimeType="text/plain"
              label="Download .txt"
            />
          </div>

          <textarea
            value={extractedText}
            readOnly
            className="h-80 w-full resize-none rounded-lg border border-border bg-muted p-4 font-mono text-sm text-foreground focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
