"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Shield, UserCheck, Scale, FileSearch, Loader2, ArrowRight, Check, Calendar, PlayCircle } from "lucide-react";

const sandboxAccounts = [
  {
    email: "demo-minister@sandbox.govdecision.com",
    role: "Minister",
    description: "Create, approve, and publish decisions. Full authority over the 10-step framework.",
    icon: Shield,
    color: "bg-primary/10 text-primary border-primary/20",
    hoverColor: "hover:border-primary/50 hover:bg-primary/5",
  },
  {
    email: "demo-secretary@sandbox.govdecision.com",
    role: "Permanent Secretary",
    description: "Manage decisions, users, workflows, and ministry operations. Full administrative access.",
    icon: UserCheck,
    color: "bg-accent/10 text-accent border-accent/20",
    hoverColor: "hover:border-accent/50 hover:bg-accent/5",
  },
  {
    email: "demo-legal@sandbox.govdecision.com",
    role: "Legal Advisor",
    description: "Review decisions for legal compliance, flag for judicial review, and advise on procedural fairness.",
    icon: Scale,
    color: "bg-warning/20 text-warning-dark border-warning/30",
    hoverColor: "hover:border-warning/60 hover:bg-warning/10",
  },
  {
    email: "demo-auditor@sandbox.govdecision.com",
    role: "Auditor",
    description: "View audit trails, verify cryptographic chain integrity, and export compliance data.",
    icon: FileSearch,
    color: "bg-error/10 text-error border-error/20",
    hoverColor: "hover:border-error/40 hover:bg-error/5",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleTryRole = async (email: string) => {
    setError("");
    setLoading(email);
    try {
      const result = await login(email, "demo");
      if (result.token) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to log in. Make sure the sandbox environment has been created."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Demo Cards */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-2xl px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <PlayCircle className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text">
              Try GovDecision -- Live Demo
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Explore a pre-populated sandbox environment with sample decisions,
              workflows, and audit trails. No signup required.
            </p>
          </div>

          {/* Demo Banner */}
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800 font-medium">
              DEMO ENVIRONMENT -- This is a sandbox with sample data. Changes
              are periodically reset.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Role Cards */}
          <div className="space-y-4">
            {sandboxAccounts.map((account) => {
              const Icon = account.icon;
              const isLoading = loading === account.email;
              return (
                <div
                  key={account.email}
                  className={`rounded-xl border-2 p-5 transition-all ${account.color} ${account.hoverColor}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text">
                        {account.role}
                      </h3>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {account.description}
                      </p>
                      <p className="mt-2 text-[11px] text-text-muted font-mono">
                        {account.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTryRole(account.email)}
                      disabled={!!loading}
                      className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Try as {account.role.split(" ")[0]}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Links */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-text hover:border-accent hover:shadow-sm transition-all"
            >
              <Calendar className="h-4 w-4 text-accent" />
              Book a Live Demo with Our Team
            </Link>
            <Link
              href="/signup"
              className="text-sm text-accent hover:underline font-medium"
            >
              Ready to get started? Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Branding */}
      <div
        className="hidden lg:flex lg:w-[480px] flex-col text-white relative"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/80" />

        <div className="relative flex-1 flex flex-col justify-between p-10">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Experience GovDecision firsthand
            </h2>
            <p className="text-sm text-white/70">
              Our sandbox environment includes realistic sample data so you can
              explore every feature without any commitment.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 my-8">
            <h3 className="text-sm font-semibold mb-3">
              What you can explore
            </h3>
            <ul className="space-y-2">
              {[
                "6 sample decisions in various workflow stages",
                "Full 10-step decision framework in action",
                "Cryptographic audit trail with SHA-256 chaining",
                "Role-based dashboards and permissions",
                "Document management and comments",
                "Public transparency portal",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-white/80"
                >
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                No signup required
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                Pre-populated data
              </div>
            </div>
            <p className="text-[10px] text-white/40 pt-2">
              Trusted by governments worldwide. Built for accountability,
              transparency, and compliance with administrative law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
