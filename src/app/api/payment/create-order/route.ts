import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { User } from "@/lib/models/user";
import Razorpay from "razorpay";

const PLANS: Record<string, { credits: number; priceEnv: string; creditsEnv: string }> = {
  basic: { credits: 50, priceEnv: "PRICE_PLAN_BASIC", creditsEnv: "CREDITS_PLAN_BASIC" },
  pro: { credits: 200, priceEnv: "PRICE_PLAN_PRO", creditsEnv: "CREDITS_PLAN_PRO" },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated. Please sign in first." }, { status: 401 });
    }

    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured. Please contact support." }, { status: 503 });
    }

    const amount = parseInt(process.env[planConfig.priceEnv] || "99", 10);
    const credits = parseInt(process.env[planConfig.creditsEnv] || String(planConfig.credits), 10);
    const currency = process.env.CURRENCY || "INR";

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User account not found. Please sign out and sign in again." }, { status: 404 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `utilify_${user._id}_${Date.now()}`,
      notes: { userId: user._id.toString(), plan, credits: String(credits) },
    });

    await Payment.create({
      userId: user._id,
      orderId: order.id,
      amount,
      currency,
      credits,
      plan,
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Payment order error:", error);
    const message = error instanceof Error ? error.message : "Payment order creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
