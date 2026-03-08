"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Upload, X } from "lucide-react";

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
  label?: string;
}

export function FileUploader({ accept, multiple = false, maxSize, onFiles, children, label }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files);
      const filtered = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
      setFileNames(filtered.map((f) => f.name));
      onFiles(filtered);
    },
    [maxSize, onFiles],
  );

  return (
    <div>
      <label
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium">{label || "Drop files here or click to upload"}</span>
        {accept && <span className="mt-1 text-xs text-muted-foreground">Accepts: {accept}</span>}
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {children}
      </label>

      {fileNames.length > 0 && (
        <div className="mt-3 space-y-1">
          {fileNames.map((name) => (
            <div key={name} className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
              <span className="truncate flex-1">{name}</span>
              <button onClick={() => { setFileNames((p) => p.filter((n) => n !== name)); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
