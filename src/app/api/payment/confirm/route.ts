import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { User } from "@/lib/models/user";

/**
 * Fallback: when user lands on callback with payment_link_status=paid,
 * verify payment and add credits if webhook hasn't run yet.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { paymentLinkId } = await req.json();
    if (!paymentLinkId) {
      return NextResponse.json({ error: "Missing payment link ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await Payment.findOne({ orderId: paymentLinkId });
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (payment.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (payment.status === "paid") {
      return NextResponse.json({
        status: "already_processed",
        credits: user.credits,
        message: "Credits already added",
      });
    }

    if (payment.status !== "created") {
      return NextResponse.json({ error: "Payment not in a valid state" }, { status: 400 });
    }

    user.credits = (user.credits ?? 0) + payment.credits;
    user.plan = payment.plan;
    await user.save();

    payment.status = "paid";
    payment.paymentId = payment.paymentId || "confirmed";
    await payment.save();

    return NextResponse.json({
      status: "success",
      credits: user.credits,
      added: payment.credits,
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
