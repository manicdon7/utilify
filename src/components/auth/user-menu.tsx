"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, CreditCard, LayoutDashboard, Zap } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCredits(typeof data.credits === "number" ? data.credits : Number(data.credits) || 0);
      }
    } catch {
      setCredits(null);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchCredits();
    const handleCreditsUpdated = () => fetchCredits();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("credits-updated", handleCreditsUpdated);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("credits-updated", handleCreditsUpdated);
    };
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign In
      </Link>
    );
  }

  const displayCredits = credits !== null ? credits : (typeof session.user.credits === "number" ? session.user.credits : 0);
  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setOpen(!open); fetchCredits(); }}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
        )}
        <div className="hidden items-center gap-1.5 md:flex">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="min-w-[1.5rem] text-right text-sm font-medium tabular-nums">
            {credits === null ? "…" : displayCredits}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium">{credits === null ? "…" : displayCredits} credits</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground capitalize">{session.user.plan}</span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Buy Credits
            </Link>
          </div>

          <div className="border-t border-border pt-1">
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
