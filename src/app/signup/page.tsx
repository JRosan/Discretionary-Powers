"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Check, Building2, User, CreditCard, Shield } from "lucide-react";

export default function SignupPageWrapper() {
  return (
    <Suspense>
      <SignupPage />
    </Suspense>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const PLANS = [
  {
    id: "starter",
    name: "Government Starter",
    price: "$40,000/year",
    features: ["Up to 50 users", "5GB storage", "Standard workflow", "Email support"],
  },
  {
    id: "professional",
    name: "Government Professional",
    price: "$85,000/year",
    features: ["Up to 200 users", "25GB storage", "Custom workflows", "API access", "Priority support"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Government Enterprise",
    price: "Custom",
    features: ["Unlimited users", "100GB storage", "White-label", "Dedicated support", "SLA guarantee"],
  },
];

const STEPS = [
  { label: "Organization", icon: Building2 },
  { label: "Admin Account", icon: User },
  { label: "Select Plan", icon: CreditCard },
];

function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Organization
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [country, setCountry] = useState("");

  // Step 2: Admin
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 3: Plan
  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || "starter");

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(orgName));
    }
  }, [orgName, slugEdited]);

  function validateStep1(): boolean {
    if (!orgName.trim()) { setError("Organization name is required."); return false; }
    if (!slug.trim()) { setError("Organization slug is required."); return false; }
    setError("");
    return true;
  }

  function validateStep2(): boolean {
    if (!adminName.trim()) { setError("Full name is required."); return false; }
    if (!email.trim()) { setError("Email is required."); return false; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return false; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return false; }
    setError("");
    return true;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  }

  function handleBack() {
    setError("");
    setStep(step - 1);
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await api.auth.signup({
        organizationName: orgName,
        slug,
        country,
        adminName,
        email,
        password,
        plan: selectedPlan,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background h-screen overflow-y-auto">
        <div className="w-full max-w-md px-4">
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <Check className="h-7 w-7 text-accent" />
              </div>
            </div>
            <div className="px-8 py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Check className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-text">Check your email</h2>
              <p className="text-sm text-text-muted">
                We&apos;ve sent a verification link to <strong className="text-text">{email}</strong>.
                Please check your inbox and click the link to activate your account.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-sm text-accent hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepGuidance = [
    {
      title: "Set up your organization",
      points: [
        "Your organization name will appear on all official documents and the public transparency portal",
        "The URL slug is used to create your unique portal address",
        "You can change these settings later from the admin panel",
      ],
    },
    {
      title: "Create your admin account",
      points: [
        "This account will have Permanent Secretary privileges — full administrative access",
        "Use a secure password (minimum 8 characters)",
        "You can invite more team members after setup",
      ],
    },
    {
      title: "Choose your plan",
      points: [
        "All plans include a 14-day free trial — no payment required today",
        "You can upgrade or downgrade at any time",
        "Enterprise plans include dedicated support and SLA guarantees",
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Form */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-lg px-8 py-12">
          {/* Logo + header */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text">Create your organization</h1>
            <p className="mt-1 text-sm text-text-secondary">Start your 14-day free trial. No payment required.</p>
          </div>

          {/* Step Indicator */}
          <div className="px-8 pt-4 pb-2">
            {/* Circles and connectors */}
            <div className="flex items-center">
              {STEPS.map((s, i) => {
                const stepNum = i + 1;
                const Icon = s.icon;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                return (
                  <div key={s.label} className="contents">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? "border-accent bg-accent text-white"
                          : isActive
                          ? "border-accent bg-accent/10 text-accent ring-4 ring-accent/10"
                          : "border-border bg-surface text-text-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 ${isCompleted ? "bg-accent" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Labels */}
            <div className="flex items-start mt-2">
              {STEPS.map((s, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                return (
                  <div key={`label-${s.label}`} className="contents">
                    <span className={`shrink-0 w-10 text-[10px] font-medium text-center ${isActive || isCompleted ? "text-text" : "text-text-muted"}`}>
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && <div className="flex-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6 space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            {/* Step 1: Organization Info */}
            {step === 1 && (
              <>
                <Input
                  label="Organization Name"
                  placeholder="e.g., Government of the Cayman Islands"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="Organization Slug"
                  placeholder="e.g., cayman-islands"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                  helperText="Used in your organization URL"
                />
                <Input
                  label="Country / Territory"
                  placeholder="e.g., Cayman Islands"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <>
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@gov.ky"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                      selectedPlan === plan.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text">{plan.name}</span>
                          {plan.popular && (
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">{plan.price}</p>
                      </div>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selectedPlan === plan.id
                            ? "border-accent bg-accent"
                            : "border-border"
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {plan.features.map((f) => (
                        <span key={f} className="flex items-center gap-1 text-[11px] text-text-secondary">
                          <Check className="h-3 w-3 text-accent" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                <p className="text-center text-xs text-text-muted pt-1">
                  No credit card required. 14-day free trial on all plans.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="accent"
                  className="flex-1"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="accent"
                  className="flex-1"
                  onClick={handleSubmit}
                  loading={loading}
                >
                  {loading ? "Creating account..." : "Start 14-Day Free Trial"}
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 text-center">
            <p className="text-xs text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Branding + Guidance */}
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
          {/* Top: Branding */}
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Transparent governance starts here
            </h2>
            <p className="text-sm text-white/70">
              Join governments worldwide using GovDecision to manage discretionary powers with accountability, transparency, and compliance.
            </p>
          </div>

          {/* Middle: Step-specific guidance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 my-8">
            <h3 className="text-sm font-semibold mb-3">
              Step {step}: {stepGuidance[step - 1].title}
            </h3>
            <ul className="space-y-2">
              {stepGuidance[step - 1].points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: Trust signals */}
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                No credit card required
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                WCAG 2.2 AA accessible
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                SHA-256 audit trail
              </div>
            </div>
            <p className="text-[10px] text-white/40 pt-2">
              Trusted by governments worldwide. Built for accountability, transparency, and compliance with administrative law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
