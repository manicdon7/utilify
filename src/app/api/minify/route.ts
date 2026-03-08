import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type, code } = await req.json();

    if (!type || !code) {
      return NextResponse.json({ error: "Missing type or code" }, { status: 400 });
    }

    let result: string;

    switch (type) {
      case "html": {
        const { minify } = await import("html-minifier-terser");
        result = await minify(code, {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
        });
        break;
      }
      case "css": {
        const CleanCSS = (await import("clean-css")).default;
        const output = new CleanCSS({ level: 2 }).minify(code);
        if (output.errors.length > 0) {
          return NextResponse.json({ error: output.errors.join(", ") }, { status: 400 });
        }
        result = output.styles;
        break;
      }
      case "js": {
        const { minify } = await import("terser");
        const output = await minify(code, { compress: true, mangle: true });
        result = output.code || "";
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown minification type" }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Minification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
