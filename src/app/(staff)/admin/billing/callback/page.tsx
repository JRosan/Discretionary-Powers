"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("requestId");
  const [status, setStatus] = useState<string>("checking");
  const [error, setError] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    if (!requestId) {
      setError("Missing payment reference. Please return to billing.");
      setStatus("error");
      return;
    }

    try {
      const result = await api.billing.checkStatus(requestId);
      switch (result.status) {
        case "approved":
          setStatus("approved");
          setTimeout(() => router.push("/admin/billing"), 3000);
          break;
        case "rejected":
          setStatus("rejected");
          break;
        case "expired":
          setStatus("expired");
          break;
        case "pending":
          // Keep polling
          setTimeout(() => pollStatus(), 3000);
          break;
        default:
          setTimeout(() => pollStatus(), 3000);
      }
    } catch {
      setError("Unable to verify payment status. Please check back later.");
      setStatus("error");
    }
  }, [requestId, router]);

  useEffect(() => {
    pollStatus();
  }, [pollStatus]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === "checking" && (
            <>
              <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text">
                Processing Payment
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Please wait while we confirm your payment with PlaceToPay...
              </p>
            </>
          )}

          {status === "approved" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text">
                Payment Successful
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Your subscription has been activated. Redirecting to billing
                page...
              </p>
            </>
          )}

          {status === "rejected" && (
            <>
              <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text">
                Payment Declined
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Your payment was not approved. Please try again with a different
                payment method.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push("/admin/billing")}
              >
                Return to Billing
              </Button>
            </>
          )}

          {status === "expired" && (
            <>
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text">
                Session Expired
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Your payment session has expired. Please start a new checkout.
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push("/admin/billing")}
              >
                Return to Billing
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text">Error</h2>
              <p className="mt-2 text-sm text-text-secondary">
                {error ?? "An unexpected error occurred."}
              </p>
              <Button
                className="mt-6"
                onClick={() => router.push("/admin/billing")}
              >
                Return to Billing
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
