import Link from "next/link";
import {
  Shield,
  FileText,
  Eye,
  Scale,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PublicFooter } from "@/components/layout/public-footer";

const features = [
  {
    icon: FileText,
    title: "10-Step Decision Framework",
    description:
      "Every discretionary decision follows the BVI's structured 10-step process, ensuring lawful and fair outcomes.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description:
      "Published decisions are accessible to the public through the Transparency Portal with complete audit trails.",
  },
  {
    icon: Scale,
    title: "Judicial Review Ready",
    description:
      "Decisions can be challenged on grounds of illegality, irrationality, procedural impropriety, or proportionality.",
  },
  {
    icon: Lock,
    title: "Cryptographic Audit Trail",
    description:
      "Every action is recorded in an immutable, SHA-256 chained audit log for tamper detection.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Ministers, Permanent Secretaries, Legal Advisors, and Auditors each have tailored access and responsibilities.",
  },
  {
    icon: Shield,
    title: "Governance Reform",
    description:
      "Built in response to the 2022 Commission of Inquiry, implementing 46 of 48 governance reform recommendations.",
  },
];

const steps = [
  "Confirm Authority",
  "Follow Procedures",
  "Gather Information",
  "Evaluate Evidence",
  "Apply Correct Standard",
  "Act Fairly",
  "Ensure Procedural Fairness",
  "Consider Individual Merits",
  "Communicate Outcome",
  "Record Decisions",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background h-screen overflow-y-auto">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                Government of the Virgin Islands
              </p>
              <p className="text-xs text-text-muted">
                Discretionary Powers Management System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Public Portal
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative text-white bg-primary"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-accent-light uppercase tracking-wide mb-3">
              Digital Governance Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl drop-shadow-sm">
              Transparent, accountable exercise of discretionary powers
            </h1>
            <p className="mt-5 text-lg text-white/90 max-w-2xl drop-shadow-sm">
              A digital platform ensuring every discretionary decision by the
              Government of the Virgin Islands follows the proper 10-step
              framework for lawful, fair, and documented decision-making.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors shadow-md"
              >
                Staff Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Public Transparency Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Step Framework Preview */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-2xl font-bold text-text text-center mb-2">
            The 10-Step Framework
          </h2>
          <p className="text-sm text-text-secondary text-center mb-8 max-w-xl mx-auto">
            Every discretionary decision must follow these steps, as established
            in the BVI&apos;s official policy guide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {steps.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-text">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-text text-center mb-10">
            Built for Accountability
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-text mb-3">
            Strengthening governance in the Virgin Islands
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto mb-8">
            Following the 2022 Commission of Inquiry, the BVI Government
            committed to comprehensive governance reform. This system is a key
            part of delivering on that promise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/portal/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-text hover:border-accent hover:shadow-sm transition-all"
            >
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Learn About the Framework
            </Link>
            <Link
              href="/portal/decisions"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-text hover:border-accent hover:shadow-sm transition-all"
            >
              <Eye className="h-4 w-4 text-accent" />
              Browse Published Decisions
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
