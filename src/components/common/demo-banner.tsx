"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function DemoBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("demo_banner_dismissed") === "true") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const isSandboxUser = user?.email?.endsWith("@sandbox.govdecision.com");

  if (!isSandboxUser || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("demo_banner_dismissed", "true");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center gap-2 border-b bg-amber-50 border-amber-200 px-4 py-2 text-sm text-amber-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        <strong>DEMO ENVIRONMENT</strong> -- This data is for demonstration only.{" "}
        <Link href="/signup" className="font-semibold underline hover:text-amber-900">
          Sign Up for Real &rarr;
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss demo banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
