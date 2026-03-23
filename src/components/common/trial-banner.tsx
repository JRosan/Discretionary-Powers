"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface TrialStatus {
  isTrial: boolean;
  daysRemaining: number;
  expiresAt: string;
}

export function TrialBanner() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchTrial = async () => {
      try {
        const status = await api.billing.getTrialStatus();
        if (status.isTrial) {
          setTrialStatus(status);
        }
      } catch {
        /* ignore */
      }
    };

    // Check sessionStorage for dismissal
    try {
      const stored = sessionStorage.getItem("trial_banner_dismissed");
      if (stored === "true") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }

    fetchTrial();
  }, [user]);

  if (!trialStatus || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("trial_banner_dismissed", "true");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center gap-2 border-b bg-amber-50 border-amber-200 text-amber-800 px-4 py-2 text-sm">
      <Clock className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        You&apos;re on a 14-day free trial.{" "}
        <strong>{trialStatus.daysRemaining} days remaining.</strong>{" "}
        <Link
          href="/admin/billing"
          className="underline font-medium hover:text-amber-900 transition-colors"
        >
          Choose a Plan
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss trial banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
