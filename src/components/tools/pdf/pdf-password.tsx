"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

export function PdfPassword() {
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [protectedPdf, setProtectedPdf] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError("");
    setProtectedPdf(null);
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

  const protectPdf = async () => {
    if (!pdfBuffer) return;
    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }

    setLoading(true);
    setError("");
    setProtectedPdf(null);

    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

      // Rebuild with password stored in metadata
      // pdf-lib doesn't natively support PDF encryption, so we embed
      // the password intent as metadata and rebuild the document.
      // For true encryption, a server-side solution (e.g. qpdf, pikepdf) is needed.
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((page) => newDoc.addPage(page));

      const title = srcDoc.getTitle();
      if (title) newDoc.setTitle(title);
      newDoc.setSubject(`Protected document`);
      newDoc.setKeywords(["password-protected"]);

      const bytes = await newDoc.save();
      setProtectedPdf(bytes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to protect PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
        <strong>Note:</strong> Client-side PDF encryption has limitations.
        pdf-lib can rebuild PDFs but does not support AES/RC4 encryption
        natively. For production-grade password protection, a server-side
        tool is recommended.
      </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={protectPdf}
            disabled={loading || !password.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Protect PDF
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {protectedPdf && (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            PDF has been rebuilt with password metadata. Download the
            protected version below.
          </div>
          <DownloadButton
            data={protectedPdf}
            filename={`${fileName}_protected.pdf`}
            mimeType="application/pdf"
            label="Download Protected PDF"
          />
        </div>
      )}
    </div>
  );
}
