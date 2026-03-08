import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callAI } from "@/lib/ai";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";

const PROMPTS: Record<string, { system: string; buildPrompt: (input: string, options?: string) => string }> = {
  grammar: {
    system: "You are a grammar checking assistant. Fix grammar, spelling, and punctuation errors. Return ONLY the corrected text, followed by a line '---CORRECTIONS---' and then a list of corrections made.",
    buildPrompt: (input) => `Fix the grammar in this text:\n\n${input}`,
  },
  summarize: {
    system: "You are a text summarization assistant. Provide clear, concise summaries.",
    buildPrompt: (input, options) => `Summarize the following text${options ? ` in ${options} style` : ""}:\n\n${input}`,
  },
  paraphrase: {
    system: "You are a paraphrasing assistant. Rewrite text while preserving meaning.",
    buildPrompt: (input, options) => `Paraphrase the following text${options ? ` in a ${options} tone` : ""}:\n\n${input}`,
  },
  hashtag: {
    system: "You are a social media expert. Generate relevant, trending hashtags.",
    buildPrompt: (input) => `Generate 20-30 relevant hashtags for the following topic or content. Return them as a space-separated list starting with #:\n\n${input}`,
  },
  "youtube-title": {
    system: "You are a YouTube SEO expert. Generate catchy, click-worthy titles that are optimized for search.",
    buildPrompt: (input) => `Generate 10 catchy YouTube video title ideas for this topic. Make them engaging and SEO-friendly. Return each title on a new line:\n\n${input}`,
  },
  "blog-headline": {
    system: "You are a content marketing expert. Generate compelling blog headlines.",
    buildPrompt: (input) => `Generate 10 compelling blog headline ideas for this topic. Use proven headline formulas. Return each on a new line:\n\n${input}`,
  },
  "email-subject": {
    system: "You are an email marketing expert. Generate subject lines that drive opens.",
    buildPrompt: (input, options) => `Generate 10 email subject lines for: ${input}${options ? `. Tone: ${options}` : ""}. Return each on a new line.`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to use AI tools. Sign up to get free credits!" },
        { status: 401 },
      );
    }

    const { type, input, options } = await req.json();

    if (!type || !input) {
      return NextResponse.json({ error: "Missing type or input" }, { status: 400 });
    }

    const config = PROMPTS[type];
    if (!config) {
      return NextResponse.json({ error: "Unknown AI tool type" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userApiKey = user.geminiApiKey || undefined;
    const usingOwnKey = !!userApiKey;

    if (!usingOwnKey && user.credits <= 0) {
      return NextResponse.json(
        {
          error: "You have no credits remaining. Buy more credits or add your own Gemini API key in the dashboard.",
          creditsExhausted: true,
        },
        { status: 403 },
      );
    }

    const result = await callAI({
      prompt: config.buildPrompt(input, options),
      systemPrompt: config.system,
      userApiKey,
    });

    if (!usingOwnKey) {
      user.credits -= 1;
      await user.save();
    }

    return NextResponse.json({
      result,
      credits: user.credits,
      usedOwnKey: usingOwnKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI processing failed";
    const status = message.includes("Rate limit") || message.includes("quota") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
