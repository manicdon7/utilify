"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import Link from "next/link";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get("razorpay_payment_id");
    const paymentLinkId = searchParams.get("razorpay_payment_link_id");
    const paymentLinkStatus = searchParams.get("razorpay_payment_link_status");
    const paymentLinkReferenceId = searchParams.get("razorpay_payment_link_reference_id");

    console.log("Payment callback params:", {
      paymentId,
      paymentLinkId,
      paymentLinkStatus,
      paymentLinkReferenceId,
    });

    if (!paymentLinkId && !paymentLinkReferenceId) {
      setStatus("failed");
      setMessage("Invalid payment callback. No payment link ID found.");
      return;
    }

    // Check payment link status from URL params
    if (paymentLinkStatus === "paid") {
      setStatus("success");
      setMessage("Payment successful! Your credits are being added...");
      
      // Poll for credits update since webhook might take a moment
      let pollAttempts = 0;
      const pollInterval = setInterval(async () => {
        pollAttempts++;
        
        try {
          const res = await fetch("/api/credits");
          if (res.ok) {
            const data = await res.json();
            // Check if credits increased (more than default 3)
            if (data.credits > 3) {
              clearInterval(pollInterval);
              setCreditsAdded(data.credits);
              setMessage(`${data.credits} credits have been added to your account!`);
              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                router.push("/dashboard");
              }, 2000);
            }
          }
        } catch (err) {
          console.error("Error checking credits:", err);
        }

        // Stop polling after 15 attempts (30 seconds)
        if (pollAttempts >= 15) {
          clearInterval(pollInterval);
          setStatus("success");
          setMessage("Payment successful! Credits will appear in your dashboard shortly.");
          // Still redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    } else if (paymentLinkStatus === "cancelled") {
      setStatus("failed");
      setMessage("Payment was cancelled. No charges were made.");
    } else if (paymentLinkStatus === "expired") {
      setStatus("failed");
      setMessage("Payment link expired. Please create a new order from the pricing page.");
    } else {
      // Payment status unknown or processing
      setStatus("pending");
      setMessage("Verifying your payment. Please wait...");
      
      // Poll for payment status
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        
        if (attempts > 10) {
          clearInterval(pollInterval);
          setStatus("pending");
          setMessage("Payment verification is taking longer than expected. Please check your dashboard for updated credits.");
          return;
        }

        try {
          const res = await fetch("/api/credits");
          if (res.ok) {
            const data = await res.json();
            // If credits increased, payment was successful
            if (data.credits > 3) {
              clearInterval(pollInterval);
              setStatus("success");
              setCreditsAdded(data.credits);
              setMessage(`Payment confirmed! ${data.credits} credits added.`);
              setTimeout(() => router.push("/dashboard"), 2000);
            }
          }
        } catch (err) {
          console.error("Error checking credits:", err);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h1 className="mt-6 text-2xl font-bold">Processing Payment</h1>
            <p className="mt-2 text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-6 text-2xl font-bold text-green-600 dark:text-green-400">Payment Successful!</h1>
            <p className="mt-2 text-muted-foreground">{message}</p>
            {creditsAdded && (
              <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  ✨ {creditsAdded} Credits Added
                </p>
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">Redirecting to dashboard...</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-6 text-2xl font-bold text-red-600 dark:text-red-400">Payment Failed</h1>
            <p className="mt-2 text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try Again
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <Clock className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-6 text-2xl font-bold text-amber-600 dark:text-amber-400">Payment Pending</h1>
            <p className="mt-2 text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Check Dashboard
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Back to Pricing
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
