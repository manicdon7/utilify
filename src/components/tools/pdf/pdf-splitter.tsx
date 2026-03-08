"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2, Scissors } from "lucide-react";

type SplitMode = "range" | "every";

interface SplitResult {
  name: string;
  data: Uint8Array;
}

function parseRanges(input: string, maxPage: number): number[][] {
  const groups: number[][] = [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(maxPage, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        groups.push(pages);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        groups.push([num]);
      }
    }
  }

  return groups;
}

export function PdfSplitter() {
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("range");
  const [rangeInput, setRangeInput] = useState("");
  const [everyN, setEveryN] = useState(1);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError("");
    setResults([]);
    setFileName(file.name.replace(/\.pdf$/i, ""));

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPdfBuffer(buffer);
      setPageCount(doc.getPageCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF.");
    }
  }, []);

  const splitPdf = async () => {
    if (!pdfBuffer) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      let groups: number[][];

      if (splitMode === "range") {
        groups = parseRanges(rangeInput, pageCount);
        if (groups.length === 0) {
          setError("Please enter valid page ranges (e.g. 1-3, 5, 7-10).");
          setLoading(false);
          return;
        }
      } else {
        const n = Math.max(1, everyN);
        groups = [];
        for (let i = 0; i < pageCount; i += n) {
          const group: number[] = [];
          for (let j = i; j < Math.min(i + n, pageCount); j++) {
            group.push(j + 1);
          }
          groups.push(group);
        }
      }

      const splitResults: SplitResult[] = [];

      for (let g = 0; g < groups.length; g++) {
        const newDoc = await PDFDocument.create();
        const indices = groups[g].map((p) => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach((page) => newDoc.addPage(page));
        const bytes = await newDoc.save();

        const label =
          groups[g].length === 1
            ? `page-${groups[g][0]}`
            : `pages-${groups[g][0]}-${groups[g][groups[g].length - 1]}`;
        splitResults.push({
          name: `${fileName}_${label}.pdf`,
          data: bytes,
        });
      }

      setResults(splitResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".pdf"
        onFiles={handleFiles}
        label="Drop a PDF file here or click to upload"
      />

      {pageCount > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              <span className="font-medium">{fileName}.pdf</span> &mdash;{" "}
              {pageCount} page{pageCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setSplitMode("range")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                splitMode === "range"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-l-lg`}
            >
              By Page Ranges
            </button>
            <button
              onClick={() => setSplitMode("every")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                splitMode === "every"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-r-lg`}
            >
              Every N Pages
            </button>
          </div>

          {splitMode === "range" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Page ranges
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Separate ranges with commas. Each range creates a separate PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Split every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={everyN}
                  onChange={(e) => setEveryN(parseInt(e.target.value, 10) || 1)}
                  className="w-24 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">page(s)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Creates {Math.ceil(pageCount / Math.max(1, everyN))} file(s)
              </p>
            </div>
          )}

          <button
            onClick={splitPdf}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scissors className="h-4 w-4" />
            )}
            Split PDF
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Split Results ({results.length} file{results.length !== 1 ? "s" : ""})
          </h3>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.name}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <span className="truncate text-sm text-foreground">
                  {result.name}
                </span>
                <DownloadButton
                  data={result.data}
                  filename={result.name}
                  mimeType="application/pdf"
                  label="Download"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
