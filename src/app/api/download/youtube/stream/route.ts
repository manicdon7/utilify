import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

/**
 * Proxy stream for YouTube downloads — avoids CORS and download attribute issues.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const itag = req.nextUrl.searchParams.get("itag");

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const info = await ytdl.getInfo(url);
    const format = info.formats.find((f) => String(f.itag) === itag);

    if (!format?.url) {
      return NextResponse.json({ error: "Format not found" }, { status: 404 });
    }

    const streamRes = await fetch(format.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!streamRes.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 });
    }

    const contentType = streamRes.headers.get("content-type") || "video/mp4";
    const contentLength = streamRes.headers.get("content-length");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    headers.set("Content-Disposition", `attachment; filename="video.${format.container || "mp4"}"`);

    return new NextResponse(streamRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("YouTube stream error:", error);
    return NextResponse.json({ error: "Failed to stream video" }, { status: 500 });
  }
}
