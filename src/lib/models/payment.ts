import mongoose, { Schema, type Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  credits: number;
  plan: string;
  status: "created" | "paid" | "failed" | "cancelled" | "expired";
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    credits: { type: Number, required: true },
    plan: { type: String, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cancelled", "expired"],
      default: "created",
    },
  },
  { timestamps: true },
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
