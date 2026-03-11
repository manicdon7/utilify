import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Build quality options — video+audio (muxed) and audio-only
    const formats = ytdl.filterFormats(info.formats, "videoandaudio");
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    const videoOptions = formats
      .filter((f) => f.qualityLabel)
      .map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel,
        container: f.container,
        size: f.contentLength
          ? `${(parseInt(f.contentLength) / 1024 / 1024).toFixed(1)} MB`
          : "Unknown size",
        url: f.url,
        type: "video",
      }))
      .filter((v, i, arr) => arr.findIndex((x) => x.quality === v.quality) === i); // dedupe by quality

    const audioOptions = audioFormats.slice(0, 2).map((f) => ({
      itag: f.itag,
      quality: f.audioQuality || "Audio only",
      container: f.container,
      size: f.contentLength
        ? `${(parseInt(f.contentLength) / 1024 / 1024).toFixed(1)} MB`
        : "Unknown size",
      url: f.url,
      type: "audio",
    }));

    return NextResponse.json({
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails.at(-1)?.url || "",
      duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
      author: videoDetails.author.name,
      views: parseInt(videoDetails.viewCount).toLocaleString(),
      formats: [...videoOptions, ...audioOptions],
    });
  } catch (error) {
    console.error("YouTube download error:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch video info";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
