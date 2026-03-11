import { NextRequest, NextResponse } from "next/server";

// Cobalt API — supports Instagram, Twitter/X, Facebook, TikTok
// Docs: https://sprintingsnail69.github.io/cobalt/docs/api.html
const COBALT_API = "https://api.cobalt.tools";

// TikTok fallback — no auth, works when Cobalt is blocked
const TIKTOK_API = "https://tdownv4.sl-bjs.workers.dev";

function isTikTokUrl(url: string): boolean {
  return /tiktok\.com|vm\.tiktok\.com/.test(url);
}

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // TikTok fallback: try dedicated API first (often more reliable)
    if (isTikTokUrl(url)) {
      try {
        const tiktokRes = await fetch(`${TIKTOK_API}/?down=${encodeURIComponent(url)}`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Utilify/1.0)" },
        });
        if (tiktokRes.ok) {
          const tiktokData = (await tiktokRes.json()) as Record<string, unknown>;
          const videoUrl =
            tiktokData.noWaterMark ||
            tiktokData.video ||
            tiktokData.download ||
            (tiktokData.result as { noWaterMark?: string; video?: string })?.noWaterMark ||
            (tiktokData.result as { noWaterMark?: string; video?: string })?.video;
          if (typeof videoUrl === "string") {
            return NextResponse.json({
              status: "success",
              url: videoUrl,
              filename: "tiktok-video.mp4",
            });
          }
        }
      } catch (err) {
        console.error("TikTok API error:", err);
      }
    }

    const res = await fetch(COBALT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url,
        videoQuality: "720",
        audioFormat: "mp3",
        filenameStyle: "basic",
        downloadMode: "auto",
        youtubeVideoCodec: "h264",
        disableMetadata: false,
        twitterGif: false,
        tiktokH265: false,
      }),
    });

    const text = await res.text();
    let data: Record<string, unknown>;

    try {
      data = JSON.parse(text);
    } catch {
      // Bot protection or non-JSON response
      console.error("Social download: non-JSON response", text.slice(0, 200));
      return NextResponse.json(
        {
          error:
            "This service is temporarily unavailable or the URL could not be processed. Try again later or use a different URL.",
        },
        { status: 503 },
      );
    }

    if (data.status === "error") {
      const err = data.error as { code?: string; context?: { service?: string; limit?: number } } | undefined;
      const code = err?.code || "unknown";
      const msg =
        code === "api.auth.missing"
          ? "Download service requires authentication. Please try again later."
          : code === "stream.unavailable"
            ? "This content cannot be downloaded. It may be private, region-locked, or unsupported."
            : code === "stream.duration_limit"
              ? `Video exceeds maximum duration (${err?.context?.limit || "?"}s limit).`
              : err?.context?.service
                ? `Failed to fetch from ${err.context.service}. The content may be private or unavailable.`
                : "This URL could not be processed. Try a different link or platform.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Success: tunnel, redirect, or picker
    if (data.status === "tunnel" || data.status === "redirect") {
      return NextResponse.json({
        status: "success",
        url: data.url,
        filename: (data.filename as string) || `${platform || "download"}.mp4`,
      });
    }

    if (data.status === "picker") {
      const picker = (data.picker as Array<{ type?: string; url: string; thumb?: string }>) || [];
      return NextResponse.json({
        status: "picker",
        items: picker.map((p) => ({ type: p.type, url: p.url, thumb: p.thumb })),
        audio: data.audio || null,
      });
    }

    return NextResponse.json(
      { error: "Unexpected response from download service. Please try again." },
      { status: 500 },
    );
  } catch (error) {
    console.error("Social download error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process URL";
    return NextResponse.json(
      {
        error:
          msg.includes("fetch") || msg.includes("network")
            ? "Network error. Please check your connection and try again."
            : "Failed to process URL. The link may be invalid or the service may be temporarily unavailable.",
      },
      { status: 500 },
    );
  }
}
