"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <div className="bg-primary px-6 py-8 text-center text-white">
          <h1 className="text-xl font-semibold">
            Government of the Virgin Islands
          </h1>
          <p className="mt-1 text-sm text-white/80">
            Discretionary Powers Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
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
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="accent"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
