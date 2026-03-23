"use client";

import Link from "next/link";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicFooter } from "@/components/layout/public-footer";
import { api, ApiBillingPlan } from "@/lib/api";

const FALLBACK_PLANS: ApiBillingPlan[] = [
  {
    id: "starter",
    name: "Government Starter",
    price: 3333,
    annualPrice: 40000,
    currency: "USD",
    userLimit: 50,
    storageGb: 5,
    features: [
      "Up to 50 users",
      "Standard 10-step workflow",
      "Cryptographic audit trail",
      "5GB document storage",
      "Basic reporting (counts only)",
      "Public transparency portal",
      "Email notifications",
      "JSON data export",
      "Email support (48h response)",
    ],
    restrictions: [
      "No custom workflows",
      "No API access",
      "No document redaction",
      "No MFA",
    ],
    multiYearDiscounts: { oneYear: 40000, twoYear: 36000, threeYear: 33600 },
  },
  {
    id: "professional",
    name: "Government Professional",
    price: 7083,
    annualPrice: 85000,
    currency: "USD",
    userLimit: 200,
    storageGb: 25,
    features: [
      "Up to 200 users",
      "Custom workflow templates",
      "Advanced reporting & analytics",
      "25GB document storage",
      "API access & integration keys",
      "Document redaction engine",
      "Audit trail verification",
      "Judicial review tracking",
      "CSV & JSON export",
      "MFA for elevated roles",
      "Priority support (24h response)",
    ],
    restrictions: ["No custom branding", "No HTML report export"],
    multiYearDiscounts: { oneYear: 85000, twoYear: 76500, threeYear: 71400 },
  },
  {
    id: "enterprise",
    name: "Government Enterprise",
    price: 16667,
    annualPrice: 200000,
    currency: "USD",
    userLimit: -1,
    storageGb: 100,
    features: [
      "Unlimited users",
      "Everything in Professional",
      "100GB document storage",
      "Custom branding & white-label",
      "All export formats (JSON, CSV, HTML)",
      "Custom domain support",
      "Dedicated account manager",
      "SLA: 99.5% uptime guarantee",
      "Dedicated support (4h response)",
      "Mandatory MFA enforcement",
      "Data sovereignty options",
    ],
    restrictions: [],
    multiYearDiscounts: {
      oneYear: 200000,
      twoYear: 180000,
      threeYear: 168000,
    },
  },
];

const faqs = [
  {
    q: "What's included in each plan?",
    a: "Every plan includes the core 10-step decision framework, cryptographic audit trail, public transparency portal, and email notifications. Higher tiers unlock advanced features like custom workflows, API access, document redaction, and dedicated support.",
  },
  {
    q: "Can we upgrade or downgrade our plan?",
    a: "Yes. You can upgrade at any time and the new features become available immediately. Downgrades take effect at the end of your current billing period, so you retain access to your existing features until then.",
  },
  {
    q: "Do you offer free trials?",
    a: "Yes. Every new organization starts with a 14-day free trial on the Starter plan. No payment method is required to begin the trial. You can upgrade to any plan at any time during or after the trial.",
  },
  {
    q: "How does government procurement work?",
    a: "We support standard government procurement processes including purchase orders, net-30 invoicing, and multi-year agreements. Contact our sales team for procurement-friendly documentation and custom terms.",
  },
  {
    q: "Where is our data stored? Can we choose a specific jurisdiction?",
    a: "By default, data is hosted in secure cloud infrastructure. Enterprise customers can choose specific data sovereignty options including on-premises deployment or jurisdiction-specific hosting to meet local data residency requirements.",
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: fetchedPlans } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => api.billing.getPlans(),
  });

  const plans = fetchedPlans ?? FALLBACK_PLANS;

  return (
    <div className="min-h-screen bg-background h-screen overflow-y-auto">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/images/logos/crest-bw.png"
                alt="GovDecision logo"
                className="h-9 w-auto"
              />
              <div>
                <p className="text-sm font-semibold text-primary">
                  GovDecision
                </p>
                <p className="text-xs text-text-muted">
                  Discretionary Powers Management
                </p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Public Portal
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">Plans & Pricing</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Transparent, predictable pricing for government organizations.
            Choose the plan that fits your needs.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Save 10% with a 2-year agreement, or 16% with a 3-year agreement.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isEnterprise = plan.id === "enterprise";
              const isProfessional = plan.id === "professional";

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border bg-white p-8 flex flex-col ${
                    isProfessional
                      ? "border-accent ring-2 ring-accent"
                      : "border-border"
                  }`}
                >
                  {isProfessional && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-text">
                    {plan.name}
                  </h3>

                  <div className="mt-4">
                    {isEnterprise ? (
                      <div>
                        <span className="text-3xl font-bold text-text">
                          Custom
                        </span>
                        <p className="mt-1 text-sm text-text-muted">
                          Contact sales for pricing
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-text">
                          {formatCurrency(plan.annualPrice)}
                        </span>
                        <span className="text-sm text-text-muted">/year</span>
                        <p className="mt-1 text-sm text-text-muted">
                          {formatCurrency(plan.price)}/month equivalent
                        </p>
                      </div>
                    )}
                  </div>

                  {plan.multiYearDiscounts && !isEnterprise && (
                    <div className="mt-3 rounded-lg bg-surface p-3">
                      <p className="text-xs font-medium text-text-secondary mb-1">
                        Multi-year discounts
                      </p>
                      <p className="text-xs text-text-muted">
                        2-year:{" "}
                        {formatCurrency(plan.multiYearDiscounts.twoYear)}/yr
                        (save 10%)
                      </p>
                      <p className="text-xs text-text-muted">
                        3-year:{" "}
                        {formatCurrency(plan.multiYearDiscounts.threeYear)}/yr
                        (save 16%)
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
                    <span>
                      {plan.userLimit < 0
                        ? "Unlimited"
                        : `${plan.userLimit}`}{" "}
                      users
                    </span>
                    <span className="text-border">|</span>
                    <span>{plan.storageGb}GB storage</span>
                  </div>

                  <div className="mt-6 flex-1">
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-text"
                        >
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.restrictions.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {plan.restrictions.map((r) => (
                          <li
                            key={r}
                            className="flex items-start gap-2 text-sm text-text-muted"
                          >
                            <X className="h-4 w-4 text-error shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-8">
                    {isEnterprise ? (
                      <a
                        href="mailto:sales@govdecision.com?subject=Enterprise Plan Inquiry"
                        className="flex w-full items-center justify-center rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-text hover:border-accent hover:shadow-sm transition-all"
                      >
                        Contact Sales
                      </a>
                    ) : (
                      <Link
                        href="/login"
                        className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                          isProfessional
                            ? "bg-accent text-white hover:bg-accent-light"
                            : "bg-primary text-white hover:bg-primary-light"
                        }`}
                      >
                        Get Started
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-text text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-text hover:bg-surface transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
