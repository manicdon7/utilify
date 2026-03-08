import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10) {
    return NextResponse.json({ error: "Please provide a valid API key" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { geminiApiKey: apiKey });

  return NextResponse.json({ message: "API key saved successfully" });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  await User.findByIdAndUpdate(session.user.id, { $unset: { geminiApiKey: 1 } });

  return NextResponse.json({ message: "API key removed" });
}
