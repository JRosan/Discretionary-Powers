"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Check,
  Sparkles,
  Building2,
  Users,
  Rocket,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "minister", label: "Minister" },
  { value: "permanent_secretary", label: "Permanent Secretary" },
  { value: "legal_advisor", label: "Legal Advisor" },
  { value: "auditor", label: "Auditor" },
];

const STEPS = [
  { label: "Welcome", icon: Sparkles },
  { label: "Ministries", icon: Building2 },
  { label: "Team", icon: Users },
  { label: "Done", icon: Rocket },
];

interface MinistryItem {
  name: string;
  code: string;
}

interface InviteItem {
  name: string;
  email: string;
  role: string;
}

function generateCode(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 6)
    .padEnd(3, "X");
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2: Ministries
  const [ministries, setMinistries] = useState<MinistryItem[]>([
    { name: "General Administration", code: "GEN-ADMIN" },
    { name: "Policy & Planning", code: "POL-PLAN" },
    { name: "Public Services", code: "PUB-SERV" },
  ]);

  // Step 3: Team
  const [invites, setInvites] = useState<InviteItem[]>([
    { name: "", email: "", role: "minister" },
  ]);

  function addMinistry() {
    setMinistries([...ministries, { name: "", code: "" }]);
  }

  function removeMinistry(index: number) {
    setMinistries(ministries.filter((_, i) => i !== index));
  }

  function updateMinistry(index: number, field: keyof MinistryItem, value: string) {
    const updated = [...ministries];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "name" && !updated[index].code) {
      updated[index].code = generateCode(value);
    }
    setMinistries(updated);
  }

  function addInvite() {
    setInvites([...invites, { name: "", email: "", role: "minister" }]);
  }

  function removeInvite(index: number) {
    setInvites(invites.filter((_, i) => i !== index));
  }

  function updateInvite(index: number, field: keyof InviteItem, value: string) {
    const updated = [...invites];
    updated[index] = { ...updated[index], [field]: value };
    setInvites(updated);
  }

  async function handleSaveMinistries() {
    setError("");
    setLoading(true);
    try {
      const valid = ministries.filter((m) => m.name.trim() && m.code.trim());
      if (valid.length > 0) {
        await api.onboarding.updateMinistries(valid);
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ministries.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvites() {
    setError("");
    setLoading(true);
    try {
      const valid = invites.filter((i) => i.name.trim() && i.email.trim());
      if (valid.length > 0) {
        await api.onboarding.inviteUsers(valid);
      }
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      await api.onboarding.complete();
      router.push("/dashboard");
      router.refresh();
    } catch {
      router.push("/dashboard");
    }
  }

  const orgName = user?.name ? `${user.name}'s organization` : "your organization";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 h-screen overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {/* Step Indicator */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const stepNum = i + 1;
                const Icon = s.icon;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                return (
                  <div key={s.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? "border-accent bg-accent text-white"
                            : isActive
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-surface text-text-muted"
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span
                        className={`mt-1 text-[10px] font-medium ${
                          isActive || isCompleted ? "text-text" : "text-text-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 w-full mx-1 mb-4 ${step > stepNum ? "bg-accent" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-8 py-6 space-y-5">
            {error && (
              <div role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text">Welcome to GovDecision!</h2>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  Let&apos;s set up your organization in a few quick steps. This will only take a minute.
                </p>
                <ul className="text-sm text-text-secondary space-y-2 text-left max-w-sm mx-auto">
                  <li className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-accent" />
                    Configure your ministries and departments
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    Invite your team members
                  </li>
                  <li className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-accent" />
                    Start managing discretionary powers
                  </li>
                </ul>
                <Button variant="accent" size="lg" onClick={() => setStep(2)} className="mt-4">
                  Get Started
                </Button>
              </div>
            )}

            {/* Step 2: Ministries */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-text">Configure Ministries</h2>
                  <p className="text-sm text-text-muted mt-1">
                    We&apos;ve added some default ministries. Rename, add, or remove them as needed.
                  </p>
                </div>
                <div className="space-y-3">
                  {ministries.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Ministry name"
                          value={m.name}
                          onChange={(e) => updateMinistry(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="Code"
                          value={m.code}
                          onChange={(e) => updateMinistry(i, "code", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMinistry(i)}
                        className="mt-2 p-1 text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMinistry}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent-light transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Ministry
                </button>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="accent" className="flex-1" onClick={handleSaveMinistries} loading={loading}>
                    {loading ? "Saving..." : "Next"}
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Invite Team */}
            {step === 3 && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-text">Invite Team Members</h2>
                  <p className="text-sm text-text-muted mt-1">
                    Add your colleagues. They&apos;ll receive an email with login credentials.
                  </p>
                </div>
                <div className="space-y-3">
                  {invites.map((inv, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Full name"
                          value={inv.name}
                          onChange={(e) => updateInvite(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Email"
                          type="email"
                          value={inv.email}
                          onChange={(e) => updateInvite(i, "email", e.target.value)}
                        />
                      </div>
                      <div className="w-36">
                        <select
                          value={inv.role}
                          onChange={(e) => updateInvite(i, "role", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInvite(i)}
                        className="mt-2 p-1 text-text-muted hover:text-error transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addInvite}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent-light transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Another
                </button>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-sm text-text-muted hover:text-text transition-colors"
                  >
                    Skip for now
                  </button>
                  <Button variant="accent" className="flex-1" onClick={handleSendInvites} loading={loading}>
                    {loading ? "Sending..." : "Send Invitations"}
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <Rocket className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text">You&apos;re all set!</h2>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  Your organization is configured and ready to go.
                </p>
                <div className="text-left max-w-sm mx-auto space-y-2 py-2">
                  <div className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent" />
                    Organization created
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent" />
                    {ministries.filter((m) => m.name.trim()).length} ministries configured
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent" />
                    {invites.filter((i) => i.name.trim() && i.email.trim()).length > 0
                      ? `${invites.filter((i) => i.name.trim() && i.email.trim()).length} team member(s) invited`
                      : "Team invitations skipped"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent" />
                    10-step workflow template ready
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent" />
                    14-day free trial active
                  </div>
                </div>
                <Button variant="accent" size="lg" onClick={handleComplete} loading={loading} className="mt-4">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
