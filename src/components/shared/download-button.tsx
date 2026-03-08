"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  data: string | Blob | Uint8Array;
  filename: string;
  mimeType?: string;
  label?: string;
  className?: string;
}

export function DownloadButton({ data, filename, mimeType = "application/octet-stream", label = "Download", className = "" }: DownloadButtonProps) {
  const handleDownload = () => {
    let blob: Blob;
    if (data instanceof Blob) {
      blob = data;
    } else if (data instanceof Uint8Array) {
      blob = new Blob([data as BlobPart], { type: mimeType });
    } else {
      blob = new Blob([data], { type: mimeType });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${className}`}
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
