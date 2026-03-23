"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 h-screen overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {/* Logo */}
          <div className="px-8 pt-8 pb-2 text-center">
            <img src="/images/logos/crest-bw.png" alt="BVI Coat of Arms" className="mx-auto mb-4 h-16 w-auto" />
            <h1 className="text-lg font-semibold text-text">
              Government of the Virgin Islands
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Discretionary Powers Management System
            </p>
          </div>

          <div className="px-8 py-6">
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="rounded-md bg-accent/10 border border-accent/20 px-3 py-3 text-sm text-accent-dark">
                  If an account exists with that email, you will receive a password reset link.
                </div>
                <Link
                  href="/login"
                  className="inline-block text-sm text-accent hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-base font-semibold text-text">Forgot your password?</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                    {error}
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@gov.vg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  loading={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-accent hover:underline"
                  >
                    Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
