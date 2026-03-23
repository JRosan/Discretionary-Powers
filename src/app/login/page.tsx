"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "@/i18n";
import { Shield, Scale, FileSearch, UserCheck } from "lucide-react";

const demoAccounts = [
  {
    email: "minister@gov.vg",
    role: "Minister",
    description: "Create, approve, and publish decisions",
    icon: Shield,
    color: "bg-primary/10 text-primary",
  },
  {
    email: "secretary@gov.vg",
    role: "Permanent Secretary",
    description: "Manage decisions, users, and ministry operations",
    icon: UserCheck,
    color: "bg-accent/10 text-accent",
  },
  {
    email: "legal@gov.vg",
    role: "Legal Advisor",
    description: "Review decisions and flag for judicial review",
    icon: Scale,
    color: "bg-warning/20 text-warning-dark",
  },
  {
    email: "auditor@gov.vg",
    role: "Auditor",
    description: "View audit trails and export data",
    icon: FileSearch,
    color: "bg-error/10 text-error",
  },
];

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const loggedOut = searchParams.get("logged_out") === "true";
  const { login, loginWithMfa } = useAuth();
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setLoading(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(tAuth("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (mfaCode.length !== 6 || !mfaToken) return;
    setError("");
    setLoading(true);
    try {
      await loginWithMfa(mfaToken, mfaCode);
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Invalid verification code. Please try again.");
      setMfaCode("");
    } finally {
      setLoading(false);
    }
  }

  function handleMfaCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setMfaCode(digits);
    if (digits.length === 6) {
      setTimeout(() => handleMfaVerify(), 0);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  async function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password");
    await handleLogin(demoEmail, "password");
  }

  if (mfaToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 h-screen overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <div className="bg-primary px-6 py-8 text-center text-white">
              <h1 className="text-xl font-semibold">{tCommon("government")}</h1>
              <p className="mt-1 text-sm text-white/80">{tCommon("appName")}</p>
            </div>

            <form onSubmit={handleMfaVerify} className="space-y-4 px-6 py-6">
              <h2 className="text-lg font-semibold text-text text-center">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-text-muted text-center">
                Enter the 6-digit code from your authenticator app.
              </p>

              {error && (
                <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                  {error}
                </div>
              )}

              <Input
                label="Verification Code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => handleMfaCodeChange(e.target.value)}
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
              />

              <Button
                type="submit"
                variant="accent"
                className="w-full"
                loading={loading}
                disabled={mfaCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setMfaToken(null);
                  setMfaCode("");
                  setError("");
                }}
                className="w-full text-sm text-text-muted hover:text-text"
              >
                Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
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
              {tCommon("government")}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {tCommon("appName")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-8 py-6">
            {loggedOut && !error && (
              <div className="rounded-md bg-accent/10 border border-accent/20 px-3 py-2 text-sm text-accent-dark text-center">
                You have been signed out successfully.
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <Input
              label={tAuth("email")}
              type="email"
              placeholder="you@gov.vg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label={tAuth("password")}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="mt-1 text-right">
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              loading={loading}
            >
              {loading ? tAuth("signingIn") : tAuth("signIn")}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="border-t border-border px-8 py-5 bg-surface/50">
            <p className="text-xs font-medium text-text-muted mb-3 text-center uppercase tracking-wide">
              Demo Accounts
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email)}
                    disabled={loading}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 text-left hover:border-accent hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${account.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text">
                        {account.role}
                      </p>
                      <p className="text-[10px] text-text-muted leading-tight">
                        {account.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-text-muted mt-2.5 text-center">
              Password: <code className="rounded bg-surface px-1 py-0.5 font-mono">password</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
