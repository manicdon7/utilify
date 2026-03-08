"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [status, setStatus] = useState<"idle" | "speaking" | "paused">("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadVoices = useCallback(() => {
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);
      if (!selectedVoice) {
        const defaultVoice = available.find((v) => v.default) ?? available[0];
        setSelectedVoice(defaultVoice.name);
      }
    }
  }, [selectedVoice]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [loadVoices]);

  const handlePlay = () => {
    if (!text.trim()) return;

    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("speaking");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus("speaking");
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setStatus("idle");
  };

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="space-y-6">
      {!supported && (
        <p className="text-sm text-red-500">
          Your browser does not support the Web Speech API.
        </p>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to speak..."
          className="h-40 w-full resize-y rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Rate: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x</span>
            <span>2x</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5</span>
            <span>2</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePlay}
          disabled={!text.trim() || !supported}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "paused" ? "Resume" : "Play"}
        </button>

        <button
          onClick={handlePause}
          disabled={status !== "speaking"}
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pause
        </button>

        <button
          onClick={handleStop}
          disabled={status === "idle"}
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Stop
        </button>

        {status !== "idle" && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "speaking" ? "animate-pulse bg-green-500" : "bg-yellow-500"
              }`}
            />
            {status === "speaking" ? "Speaking..." : "Paused"}
          </span>
        )}
      </div>
    </div>
  );
}
