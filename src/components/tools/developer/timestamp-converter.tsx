"use client";

import { useState, useEffect, useCallback } from "react";
import { CopyButton } from "@/components/shared/copy-button";

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const future = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let label: string;
  if (seconds < 60) label = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60) label = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) label = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) label = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12) label = `${months} month${months !== 1 ? "s" : ""}`;
  else label = `${years} year${years !== 1 ? "s" : ""}`;

  return future ? `in ${label}` : `${label} ago`;
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function TimestampConverter() {
  const [unix, setUnix] = useState("");
  const [unixMs, setUnixMs] = useState("");
  const [iso, setIso] = useState("");
  const [datetime, setDatetime] = useState("");
  const [relative, setRelative] = useState("");
  const [error, setError] = useState("");

  const updateAll = useCallback((date: Date, source: string) => {
    if (isNaN(date.getTime())) {
      setError("Invalid date value.");
      return;
    }
    setError("");
    if (source !== "unix") setUnix(String(Math.floor(date.getTime() / 1000)));
    if (source !== "unixMs") setUnixMs(String(date.getTime()));
    if (source !== "iso") setIso(date.toISOString());
    if (source !== "datetime") setDatetime(toLocalDatetimeValue(date));
    setRelative(formatRelativeTime(date));
  }, []);

  useEffect(() => {
    if (!unix && !unixMs && !iso && !datetime) return;
    const interval = setInterval(() => {
      const ts = unix ? parseInt(unix, 10) * 1000 : unixMs ? parseInt(unixMs, 10) : 0;
      if (ts) setRelative(formatRelativeTime(new Date(ts)));
    }, 1000);
    return () => clearInterval(interval);
  }, [unix, unixMs, iso, datetime]);

  const handleNow = () => {
    const now = new Date();
    setUnix(String(Math.floor(now.getTime() / 1000)));
    setUnixMs(String(now.getTime()));
    setIso(now.toISOString());
    setDatetime(toLocalDatetimeValue(now));
    setRelative(formatRelativeTime(now));
    setError("");
  };

  const handleUnixChange = (val: string) => {
    setUnix(val);
    if (!val) return;
    const num = parseInt(val, 10);
    if (isNaN(num)) { setError("Invalid Unix timestamp."); return; }
    updateAll(new Date(num * 1000), "unix");
  };

  const handleUnixMsChange = (val: string) => {
    setUnixMs(val);
    if (!val) return;
    const num = parseInt(val, 10);
    if (isNaN(num)) { setError("Invalid Unix timestamp (ms)."); return; }
    updateAll(new Date(num), "unixMs");
  };

  const handleIsoChange = (val: string) => {
    setIso(val);
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) { setError("Invalid ISO date string."); return; }
    updateAll(d, "iso");
  };

  const handleDatetimeChange = (val: string) => {
    setDatetime(val);
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) { setError("Invalid date/time."); return; }
    updateAll(d, "datetime");
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNow}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Now
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Unix Timestamp (seconds)" value={unix} onChange={handleUnixChange} />
        <FieldRow label="Unix Timestamp (ms)" value={unixMs} onChange={handleUnixMsChange} />
        <FieldRow label="ISO 8601" value={iso} onChange={handleIsoChange} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Date Picker</label>
            {datetime && <CopyButton text={datetime} />}
          </div>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => handleDatetimeChange(e.target.value)}
            step="1"
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {relative && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          <span className="text-muted-foreground">Relative: </span>
          <span className="font-medium text-foreground">{relative}</span>
        </div>
      )}
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value && <CopyButton text={value} />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
