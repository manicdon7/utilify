import { NextRequest, NextResponse } from "next/server";

// Uses the free cobalt.tools API — supports Instagram, Twitter/X, Facebook, TikTok
const COBALT_API = "https://cobalt.tools/api/json";

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const res = await fetch(COBALT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url,
        vCodec: "h264",
        vQuality: "720",
        aFormat: "mp3",
        filenamePattern: "basic",
        isAudioOnly: false,
        disableMetadata: false,
        twitterGif: false,
        tiktokH265: false,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.status === "error") {
      return NextResponse.json(
        { error: data.text || `Failed to fetch from ${platform}` },
        { status: 400 },
      );
    }

    // cobalt returns different statuses
    if (data.status === "redirect" || data.status === "stream") {
      return NextResponse.json({
        status: "success",
        url: data.url,
        filename: data.filename || `${platform}-download.mp4`,
      });
    }

    if (data.status === "picker") {
      // Multiple items (e.g. Instagram carousel)
      return NextResponse.json({
        status: "picker",
        items: data.picker || [],
        audio: data.audio || null,
      });
    }

    return NextResponse.json({ error: "Unexpected response from downloader" }, { status: 500 });
  } catch (error) {
    console.error("Social download error:", error);
    return NextResponse.json({ error: "Failed to process URL" }, { status: 500 });
  }
}
