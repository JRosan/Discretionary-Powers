"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Shield, Check, Calendar, Users, FileText, Eye, Lock } from "lucide-react";

const USER_RANGE_OPTIONS = ["1-50", "51-200", "200+"];

export default function BookDemoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [userRange, setUserRange] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Full name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!organization.trim()) { setError("Organization name is required."); return; }
    if (!jobTitle.trim()) { setError("Job title is required."); return; }
    if (!country.trim()) { setError("Country/territory is required."); return; }

    setLoading(true);
    try {
      const dateStr = preferredDate
        ? preferredTime
          ? `${preferredDate} ${preferredTime}`
          : preferredDate
        : undefined;

      await api.demoRequests.submit({
        name,
        email,
        organization,
        jobTitle,
        country,
        userRange: userRange || undefined,
        message: message || undefined,
        preferredDate: dateStr,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md px-4">
          <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Check className="h-7 w-7 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text">Demo request received!</h2>
            <p className="text-sm text-text-muted">
              Thank you, <strong className="text-text">{name}</strong>. Our team will
              reach out to <strong className="text-text">{email}</strong> to confirm
              your demo session.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/demo"
                className="text-sm text-accent hover:underline font-medium"
              >
                Try the live demo while you wait
              </Link>
              <Link href="/" className="text-sm text-text-muted hover:underline">
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Form */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-lg px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text">Book a Live Demo</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Schedule a personalized walkthrough with our team. No obligation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@government.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Organization / Government Name"
              placeholder="e.g., Government of the Cayman Islands"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />

            <Input
              label="Job Title"
              placeholder="e.g., Permanent Secretary"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />

            <Input
              label="Country / Territory"
              placeholder="e.g., British Virgin Islands"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Number of Users
              </label>
              <select
                value={userRange}
                onChange={(e) => setUserRange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                <option value="">Select range</option>
                {USER_RANGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Preferred Time
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Message / Questions (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Any specific features or questions you'd like to discuss?"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              />
            </div>

            <Button type="submit" variant="accent" className="w-full" loading={loading}>
              {loading ? "Submitting..." : "Book Demo"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              Want to explore on your own?{" "}
              <Link href="/demo" className="text-accent hover:underline font-medium">
                Try the live demo
              </Link>
            </p>
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
              See GovDecision in action
            </h2>
            <p className="text-sm text-white/70">
              Get a personalized walkthrough tailored to your government&apos;s
              specific needs and workflows.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 my-8">
            <h3 className="text-sm font-semibold mb-3">What to expect</h3>
            <ul className="space-y-3">
              {[
                { icon: Calendar, text: "30-minute live walkthrough" },
                { icon: FileText, text: "See the full 10-step decision workflow" },
                { icon: Lock, text: "Document management and audit trail demo" },
                { icon: Eye, text: "Public transparency portal showcase" },
                { icon: Users, text: "Q&A and pricing discussion" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-xs text-white/80"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-accent" />
                    {item.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                No obligation
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                Trusted by governments worldwide
              </div>
            </div>
            <p className="text-[10px] text-white/40 pt-2">
              Our team will follow up within 24 hours to confirm your preferred
              date and time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
