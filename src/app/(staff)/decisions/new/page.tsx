"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DECISION_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";

function formatType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NewDecisionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const ministriesQuery = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
  });
  const ministries = ministriesQuery.data ?? [];

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.list(),
  });
  const users = (usersQuery.data ?? []).filter((u) => u.active);

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.decisions.create(data),
    onSuccess: (decision) => {
      router.push(`/decisions/${decision.id}`);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const deadline = formData.get("deadline") as string;

    const assignedTo = formData.get("assignedTo") as string;

    createMutation.mutate({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      ministryId: formData.get("ministryId") as string,
      decisionType: formData.get("decisionType") as string,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      assignedTo: assignedTo || undefined,
    });
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

      {error && (
        <div role="alert" className="rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">
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

          <div>
            <label htmlFor="ministry" className="block text-sm font-medium text-text mb-1.5">
              Ministry <span className="text-error">*</span>
            </label>
            <select
              id="ministry"
              name="ministryId"
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select a ministry</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-text mb-1.5">
              Assign To
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">No assignment</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace(/_/g, " ")})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-muted">
              Optional. Assign this decision to a specific user.
            </p>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-text mb-1.5">
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

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-text mb-1.5">
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

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-primary">
            Once created, this decision will begin at Step 1 (Confirm Authority)
            of the 10-step discretionary powers framework. Each step must be
            completed in sequence before the decision can be approved and
            published.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createMutation.isPending ? "Creating..." : "Create Decision"}
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
