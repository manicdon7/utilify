"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, Key, CreditCard, Shield, Eye, EyeOff, Loader2,
  Check, Trash2, Crown, ArrowRight,
} from "lucide-react";

interface PaymentRecord {
  _id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  credits: number;
  plan: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("free");
  const [hasOwnKey, setHasOwnKey] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [creditsRes, paymentsRes] = await Promise.all([
        fetch("/api/credits"),
        fetch("/api/payment/history"),
      ]);
      const creditsData = await creditsRes.json();
      const paymentsData = await paymentsRes.json();

      if (creditsRes.ok) {
        setCredits(creditsData.credits);
        setPlan(creditsData.plan);
        setHasOwnKey(creditsData.hasOwnKey);
      }
      if (paymentsRes.ok) {
        setPayments(paymentsData.payments || []);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (status === "authenticated") fetchData();
  }, [status, router, fetchData]);

  const saveApiKey = async () => {
    setSavingKey(true);
    setKeyMessage(null);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKeyMessage({ type: "success", text: "API key saved! AI tools will now use your key." });
      setHasOwnKey(true);
      setApiKey("");
    } catch (err) {
      setKeyMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save key" });
    } finally {
      setSavingKey(false);
    }
  };

  const removeApiKey = async () => {
    setSavingKey(true);
    setKeyMessage(null);
    try {
      const res = await fetch("/api/user/api-key", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKeyMessage({ type: "success", text: "API key removed. Credits will be used for AI tools." });
      setHasOwnKey(false);
    } catch (err) {
      setKeyMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to remove key" });
    } finally {
      setSavingKey(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Manage your credits, API key, and account</p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2"><Zap className="h-5 w-5 text-amber-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-bold">{credits}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><Crown className="h-5 w-5 text-purple-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold capitalize">{plan}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><Key className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Own API Key</p>
              <p className="text-2xl font-bold">{hasOwnKey ? "Active" : "None"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Credits CTA */}
      <div className="mt-6">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" />
          Buy More Credits
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* API Key Management */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Shield className="h-5 w-5" />
          Gemini API Key
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your own Gemini API key for unlimited AI usage without spending credits.
          Get a key at{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            aistudio.google.com
          </a>
        </p>

        {keyMessage && (
          <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
            keyMessage.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-500"
          }`}>
            {keyMessage.text}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {hasOwnKey ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Check className="h-5 w-5 text-green-500" />
              <span className="flex-1 text-sm">Your API key is active. AI tools use your key (no credits deducted).</span>
              <button
                onClick={removeApiKey}
                disabled={savingKey}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                {savingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (your Gemini API key)"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={saveApiKey}
                disabled={savingKey || !apiKey}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {savingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <CreditCard className="h-5 w-5" />
          Payment History
        </h2>

        {payments.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">No payments yet.</p>
            <Link href="/pricing" className="mt-2 inline-block text-sm text-primary hover:underline">
              View pricing plans
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Credits</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 capitalize">{p.plan}</td>
                    <td className="px-4 py-3">{p.credits}</td>
                    <td className="px-4 py-3">
                      {p.currency === "INR" ? "₹" : p.currency} {p.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "paid"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : p.status === "failed"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
