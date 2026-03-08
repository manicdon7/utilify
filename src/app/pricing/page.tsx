"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Zap, Loader2, Crown, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    credits: "3",
    features: ["3 AI credits", "All non-AI tools", "Use your own API key", "No sign-up for basic tools"],
    cta: "Current Plan",
    popular: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: process.env.NEXT_PUBLIC_PRICE_BASIC || "99",
    credits: process.env.NEXT_PUBLIC_CREDITS_BASIC || "50",
    features: ["50 AI credits", "All tools included", "Priority processing", "Email support"],
    cta: "Get Basic",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: process.env.NEXT_PUBLIC_PRICE_PRO || "299",
    credits: process.env.NEXT_PUBLIC_CREDITS_PRO || "200",
    features: ["200 AI credits", "All tools included", "Priority processing", "Priority support", "Early access to new tools"],
    cta: "Get Pro",
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(planId);
    setMessage(null);

    try {
      // Create payment link on backend
      const res = await fetch("/api/payment/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to Razorpay hosted payment page
      window.location.href = data.paymentUrl;
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to start payment" });
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Get AI credits to use grammar checking, text summarization, content generation, and more.
          Or bring your own Gemini API key for unlimited usage.
        </p>
      </div>

      {message && (
        <div className={`mx-auto mt-6 max-w-md rounded-lg border px-4 py-3 text-sm ${
          message.type === "success"
            ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
            : "border-red-500/30 bg-red-500/10 text-red-500"
        }`}>
          {message.text}
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 ${
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2">
                {plan.id === "pro" ? <Crown className="h-5 w-5 text-amber-500" /> : plan.id === "basic" ? <Sparkles className="h-5 w-5 text-primary" /> : <Zap className="h-5 w-5 text-muted-foreground" />}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  {plan.price === "0" ? "Free" : `₹${plan.price}`}
                </span>
                {plan.price !== "0" && <span className="text-muted-foreground">one-time</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.credits} AI credits</p>
            </div>

            <ul className="mb-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.id === "free" ? (
              <button disabled className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
                {plan.cta}
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loading === plan.id}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {loading === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="text-lg font-semibold">Bring Your Own API Key</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Have a Gemini API key? Add it in your dashboard for unlimited AI usage at no extra cost.
          Your key is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}
