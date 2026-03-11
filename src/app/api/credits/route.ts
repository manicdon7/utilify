import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/user";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("credits plan geminiApiKey");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    credits: Number(user.credits ?? 0),
    plan: user.plan || "free",
    hasOwnKey: !!user.geminiApiKey,
  });
}
