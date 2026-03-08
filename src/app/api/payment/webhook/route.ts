import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/payment";
import { User } from "@/lib/models/user";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("Razorpay webhook secret not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    // Verify webhook signature
    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log("Razorpay webhook event:", event);

    // Handle payment link paid event
    if (event === "payment_link.paid") {
      const paymentLinkData = payload.payload.payment_link.entity;
      const paymentData = payload.payload.payment.entity;

      const linkId = paymentLinkData.id;
      const paymentId = paymentData.id;
      const notes = paymentLinkData.notes || {};

      await connectDB();

      // Find the payment record
      const payment = await Payment.findOne({ orderId: linkId });
      if (!payment) {
        console.error("Payment record not found for link:", linkId);
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      // Update payment status
      payment.paymentId = paymentId;
      payment.status = "success";
      await payment.save();

      // Add credits to user
      const user = await User.findById(payment.userId);
      if (user) {
        user.credits = (user.credits || 0) + payment.credits;
        user.plan = payment.plan;
        await user.save();
        console.log(`Added ${payment.credits} credits to user ${user.email}`);
      }

      return NextResponse.json({ status: "ok" });
    }

    // Handle payment link cancelled/expired
    if (event === "payment_link.cancelled" || event === "payment_link.expired") {
      const linkId = payload.payload.payment_link.entity.id;
      
      await connectDB();
      
      const payment = await Payment.findOne({ orderId: linkId });
      if (payment) {
        payment.status = event === "payment_link.cancelled" ? "cancelled" : "expired";
        await payment.save();
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
