"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

function generatePassword(length: number, upper: boolean, lower: boolean, numbers: boolean, symbols: boolean): string {
  let chars = "";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  let pw = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    pw += chars[arr[i] % chars.length];
  }
  return pw;
}

function getStrength(pw: string): { label: string; score: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", score: 1, color: "bg-red-500" };
  if (score === 2) return { label: "Fair", score: 2, color: "bg-orange-500" };
  if (score === 3) return { label: "Strong", score: 3, color: "bg-yellow-500" };
  return { label: "Very Strong", score: 4, color: "bg-green-500" };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>(() => [
    generatePassword(16, true, true, true, true),
  ]);

  const generate = useCallback(() => {
    const pws: string[] = [];
    for (let i = 0; i < count; i++) {
      pws.push(generatePassword(length, upper, lower, numbers, symbols));
    }
    setPasswords(pws);
  }, [length, upper, lower, numbers, symbols, count]);

  const primary = passwords[0] || "";
  const strength = getStrength(primary);

  const checkboxClass =
    "h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary";

  return (
    <div className="space-y-6">
      {/* Primary password display */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-muted px-4 py-3">
            <p className="whitespace-nowrap font-mono text-lg text-foreground">{primary}</p>
          </div>
          <CopyButton text={primary} />
          <button
            onClick={generate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Generate
          </button>
        </div>

        {/* Strength meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Password Strength</span>
            <span className="font-medium text-foreground">{strength.label}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${strength.color}`}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        {/* Length slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Length</label>
            <span className="text-sm font-semibold text-foreground">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character options */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} className={checkboxClass} />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} className={checkboxClass} />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className={checkboxClass} />
            Numbers (0-9)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className={checkboxClass} />
            Symbols (!@#...)
          </label>
        </div>

        {/* Count */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Generate Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="w-20 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Multiple passwords list */}
      {passwords.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Passwords ({passwords.length})
            </h3>
            <CopyButton text={passwords.join("\n")} />
          </div>
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                <span className="w-6 text-xs text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 truncate font-mono text-sm text-foreground">{pw}</span>
                <CopyButton text={pw} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
