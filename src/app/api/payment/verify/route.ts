import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { User } from "@/lib/models/user";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { orderId, paymentId, signature } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await Payment.findOne({ orderId, userId: user._id });
    if (!payment) {
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
    }

    if (payment.status === "paid") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 409 });
    }

    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = "paid";
    await payment.save();

    user.credits += payment.credits;
    if (payment.plan === "pro" || (payment.plan === "basic" && user.plan === "free")) {
      user.plan = payment.plan;
    }
    await user.save();

    return NextResponse.json({
      message: "Payment verified successfully",
      credits: user.credits,
      plan: user.plan,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
