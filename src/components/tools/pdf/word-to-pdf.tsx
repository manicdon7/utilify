"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mammoth from "mammoth";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2 } from "lucide-react";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FONT_SIZE = 12;
const LINE_HEIGHT = FONT_SIZE * 1.4;

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines;
}

export function WordToPdf() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [stats, setStats] = useState<{ pages: number; chars: number } | null>(null);

  const createPdfFromText = useCallback(async (text: string) => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const maxWidth = PAGE_WIDTH - MARGIN * 2;
    const maxY = PAGE_HEIGHT - MARGIN;
    const lines = wrapText(text, font, FONT_SIZE, maxWidth);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = maxY - FONT_SIZE;

    for (const line of lines) {
      if (y < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = maxY - FONT_SIZE;
      }
      if (line) {
        page.drawText(line, {
          x: MARGIN,
          y,
          size: FONT_SIZE,
          font,
          color: rgb(0, 0, 0),
        });
      }
      y -= LINE_HEIGHT;
    }

    const bytes = await pdfDoc.save();
    setStats({ pages: pdfDoc.getPageCount(), chars: text.length });
    return bytes;
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setLoading(true);
      setError("");
      setPdfBytes(null);
      setStats(null);
      setFileName(file.name.replace(/\.(docx?|txt)$/i, ""));

      try {
        const buffer = await file.arrayBuffer();

        if (file.name.endsWith(".txt")) {
          const text = new TextDecoder().decode(buffer);
          const bytes = await createPdfFromText(text);
          setPdfBytes(bytes);
        } else {
          const result = await mammoth.extractRawText({ arrayBuffer: buffer });
          if (result.value.trim().length === 0) {
            setError("No text content found in the document.");
            return;
          }
          const bytes = await createPdfFromText(result.value);
          setPdfBytes(bytes);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to convert document."
        );
      } finally {
        setLoading(false);
      }
    },
    [createPdfFromText]
  );

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".docx,.doc,.txt"
        onFiles={handleFiles}
        label="Drop a Word document or text file here"
      />

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 p-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Converting to PDF...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {pdfBytes && stats && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pages:</span>{" "}
                <span className="font-medium text-foreground">{stats.pages}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Characters:</span>{" "}
                <span className="font-medium text-foreground">
                  {stats.chars.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DownloadButton
            data={pdfBytes}
            filename={`${fileName || "converted"}.pdf`}
            mimeType="application/pdf"
            label="Download PDF"
          />
        </div>
      )}
    </div>
  );
}
