"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Check, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}

function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api.auth
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully. You can now sign in.");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Invalid or expired verification link.");
      });
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 h-screen overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            </div>
          </div>

          <div className="px-8 py-8 text-center space-y-4">
            {status === "loading" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Loader2 className="h-7 w-7 text-accent animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-text">Verifying your email...</h2>
                <p className="text-sm text-text-muted">Please wait while we verify your email address.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Check className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-text">Email verified!</h2>
                <p className="text-sm text-text-muted">{message}</p>
                <p className="text-xs text-text-muted">Redirecting to sign in...</p>
                <div className="pt-2">
                  <Link
                    href="/login?verified=true"
                    className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light transition-colors"
                  >
                    Sign In Now
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                  <XCircle className="h-7 w-7 text-error" />
                </div>
                <h2 className="text-xl font-semibold text-text">Verification failed</h2>
                <p className="text-sm text-text-muted">{message}</p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="text-sm text-accent hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
