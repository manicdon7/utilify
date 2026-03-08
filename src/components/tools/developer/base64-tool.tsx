"use client";

import { useState, useRef } from "react";
import { CopyButton } from "@/components/shared/copy-button";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
      setError("");
    } catch {
      setError(mode === "encode" ? "Failed to encode text." : "Invalid base64 string.");
      setOutput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || result;
      setOutput(base64);
      setInput(`[File: ${file.name}]`);
      setMode("encode");
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            } rounded-l-lg`}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            } rounded-r-lg`}
          >
            Decode
          </button>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          File → Base64
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {mode === "encode" ? "Text Input" : "Base64 Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Enter base64 to decode..."}
            className="h-60 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === "encode" ? "Base64 Output" : "Text Output"}
            </label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="h-60 w-full resize-none rounded-lg border border-border bg-muted p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <button
        onClick={handleConvert}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {mode === "encode" ? "Encode" : "Decode"}
      </button>
    </div>
  );
}
