import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  credits: number;
  geminiApiKey?: string;
  plan: "free" | "basic" | "pro";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    credits: {
      type: Number,
      default: parseInt(process.env.CREDITS_DEFAULT || "3", 10),
    },
    geminiApiKey: { type: String },
    plan: {
      type: String,
      enum: ["free", "basic", "pro"],
      default: "free",
    },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
