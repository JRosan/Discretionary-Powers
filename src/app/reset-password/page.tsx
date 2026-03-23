"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { api } from "@/lib/api";

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid reset link. No token provided.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-lg font-semibold text-text">
              Government of the Virgin Islands
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Discretionary Powers Management System
            </p>
          </div>

          <div className="px-8 py-6">
            {success ? (
              <div className="space-y-4 text-center">
                <div className="rounded-md bg-accent/10 border border-accent/20 px-3 py-3 text-sm text-accent-dark">
                  Password reset successfully.
                </div>
                <Link
                  href="/login"
                  className="inline-block text-sm text-accent hover:underline"
                >
                  Sign in with your new password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-base font-semibold text-text">Reset your password</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Enter your new password below.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                    {error}
                  </div>
                )}

                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  loading={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
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
