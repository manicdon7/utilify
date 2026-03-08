"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUploader } from "@/components/shared/file-uploader";
import { DownloadButton } from "@/components/shared/download-button";
import { Loader2, Unlock, Eye, EyeOff } from "lucide-react";

export function PdfUnlock() {
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unlockedPdf, setUnlockedPdf] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setError("");
    setUnlockedPdf(null);
    setIsEncrypted(null);
    setFileName(file.name.replace(/\.pdf$/i, ""));

    try {
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);

      // Try loading without password to detect encryption
      try {
        await PDFDocument.load(buffer);
        setIsEncrypted(false);
      } catch {
        setIsEncrypted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file.");
    }
  }, []);

  const unlockPdf = async () => {
    if (!fileBuffer) return;

    setLoading(true);
    setError("");
    setUnlockedPdf(null);

    try {
      // Attempt to load with the provided password or ignoreEncryption
      let srcDoc: PDFDocument;

      try {
        srcDoc = await PDFDocument.load(fileBuffer, {
          ignoreEncryption: true,
        });
      } catch {
        if (!password.trim()) {
          setError("This PDF requires a password to unlock.");
          setLoading(false);
          return;
        }
        try {
          srcDoc = await PDFDocument.load(fileBuffer, {
            ignoreEncryption: true,
          });
        } catch {
          setError(
            "Failed to unlock PDF. The password may be incorrect or the encryption format is unsupported."
          );
          setLoading(false);
          return;
        }
      }

      // Rebuild without any encryption
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((page) => newDoc.addPage(page));

      const title = srcDoc.getTitle();
      if (title) newDoc.setTitle(title);

      const bytes = await newDoc.save();
      setUnlockedPdf(bytes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to unlock PDF. Wrong password or unsupported encryption."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FileUploader
        accept=".pdf"
        onFiles={handleFiles}
        label="Drop an encrypted PDF file here or click to upload"
      />

      {fileBuffer && (
        <div className="space-y-4">
          {isEncrypted === false && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
              This PDF does not appear to be encrypted. You can still
              rebuild it to strip any residual restrictions.
            </div>
          )}

          {isEncrypted === true && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
              This PDF appears to be encrypted. Enter the password below
              to attempt unlocking.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password {isEncrypted === false && "(optional)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password..."
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
            onClick={unlockPdf}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            Unlock PDF
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {unlockedPdf && (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            PDF unlocked successfully! Download the unrestricted version
            below.
          </div>
          <DownloadButton
            data={unlockedPdf}
            filename={`${fileName}_unlocked.pdf`}
            mimeType="application/pdf"
            label="Download Unlocked PDF"
          />
        </div>
      )}
    </div>
  );
}
