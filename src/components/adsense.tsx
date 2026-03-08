"use client";

import { useEffect } from "react";

export function AdBanner({ slot, format = "auto" }: { slot: string; format?: string }) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  if (!pubId) return null;

  return (
    <div className="my-4 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
