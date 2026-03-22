"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DECISION_TYPES } from "@/lib/constants";

function formatType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const mockMinistries = [
  { id: "m1", name: "Ministry of Finance", code: "FIN" },
  { id: "m2", name: "Ministry of Natural Resources", code: "NAT" },
  { id: "m3", name: "Ministry of Education", code: "EDU" },
  { id: "m4", name: "Ministry of Health", code: "HEA" },
  { id: "m5", name: "Ministry of Communications", code: "COM" },
];

export default function NewDecisionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with tRPC mutation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push("/decisions");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/decisions"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decisions
        </Link>
        <h1 className="text-2xl font-semibold text-text">New Decision</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Create a new discretionary power decision. This will initiate the
          10-step review framework.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-6 space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Decision Title <span className="text-error">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Financial Services Licensing Amendment"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide a brief description of the decision and its context..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Ministry */}
          <div>
            <label
              htmlFor="ministry"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Ministry <span className="text-error">*</span>
            </label>
            <select
              id="ministry"
              name="ministryId"
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select a ministry</option>
              {mockMinistries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Decision Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Decision Type <span className="text-error">*</span>
            </label>
            <select
              id="type"
              name="decisionType"
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select a type</option>
              {Object.values(DECISION_TYPES).map((type) => (
                <option key={type} value={type}>
                  {formatType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-text-muted">
              Optional. Set a target date for completing this decision.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-primary">
            Once created, this decision will begin at Step 1 (Confirm Authority)
            of the 10-step discretionary powers framework. Each step must be
            completed in sequence before the decision can be approved and
            published.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Decision"}
          </button>
          <Link
            href="/decisions"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
