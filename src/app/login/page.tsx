"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { login } = useAuth();
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(tAuth("invalidCredentials"));
    } finally {
      setLoading(false);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Login Card */}
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="bg-primary px-6 py-8 text-center text-white">
            <h1 className="text-xl font-semibold">{tCommon("government")}</h1>
            <p className="mt-1 text-sm text-white/80">{tCommon("appName")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
            <h2 className="text-lg font-semibold text-text text-center">
              {tAuth("signInTitle")}
            </h2>

            {error && (
              <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
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

            <Input
              label={tAuth("password")}
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
              {loading ? tAuth("signingIn") : tAuth("signIn")}
            </Button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="rounded-lg border border-border bg-background p-6">
          <h3 className="text-sm font-semibold text-text mb-1">
            Demo Accounts
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Click any role below to sign in instantly with a demo account.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account.email)}
                  disabled={loading}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left hover:border-accent hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${account.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      {account.role}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {account.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-text-muted mt-3 text-center">
            All demo accounts use password:{" "}
            <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">
              password
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
