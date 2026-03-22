"use client";

import Link from "next/link";
import { Scale, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_REVIEWS = [
  {
    id: "jr-001",
    decisionRef: "DP-2025-039",
    decisionTitle: "Public School Zoning Reclassification",
    ground: "Procedural Impropriety",
    status: "pending",
    filedBy: "Sarah Auditor",
    filedAt: "2026-03-10",
    description: "The decision failed to provide adequate notice to affected parties before the zoning change was implemented.",
  },
  {
    id: "jr-002",
    decisionRef: "DP-2025-035",
    decisionTitle: "Fishing Vessel License Revocation",
    ground: "Irrationality",
    status: "under_review",
    filedBy: "John Legal",
    filedAt: "2026-02-28",
    description: "The decision to revoke the license was not supported by the evidence presented and no reasonable decision-maker would have reached this conclusion.",
  },
  {
    id: "jr-003",
    decisionRef: "DP-2025-028",
    decisionTitle: "Crown Land Allocation — Road Town",
    ground: "Illegality",
    status: "resolved",
    filedBy: "John Legal",
    filedAt: "2026-01-15",
    resolution: "Decision quashed and remitted for reconsideration",
    resolvedAt: "2026-02-20",
    description: "The Minister did not have delegated authority under the Crown Lands Act to approve allocations exceeding 5 acres.",
  },
];

const STATUS_MAP: Record<string, { label: string; variant: "warning" | "accent" | "success" | "outline" }> = {
  pending: { label: "Pending", variant: "warning" },
  under_review: { label: "Under Review", variant: "accent" },
  resolved: { label: "Resolved", variant: "success" },
  dismissed: { label: "Dismissed", variant: "outline" },
};

const GROUND_LABELS: Record<string, string> = {
  illegality: "Illegality",
  irrationality: "Irrationality",
  procedural_impropriety: "Procedural Impropriety",
  proportionality: "Proportionality",
};

export default function JudicialReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Judicial Reviews
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track decisions flagged for judicial review
          </p>
        </div>
        <Button variant="accent">
          <Scale className="h-4 w-4" />
          Flag for Review
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-text">1</p>
              <p className="text-sm text-text-secondary">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Clock className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-text">1</p>
              <p className="text-sm text-text-secondary">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold text-text">1</p>
              <p className="text-sm text-text-secondary">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => {
          const status = STATUS_MAP[review.status] ?? { label: review.status, variant: "outline" as const };
          return (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/decisions/${review.id}`}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        {review.decisionRef}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant="outline">{review.ground}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {review.decisionTitle}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {review.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                      <span>Filed by: {review.filedBy}</span>
                      <span>Date: {review.filedAt}</span>
                      {review.resolvedAt && (
                        <span>Resolved: {review.resolvedAt}</span>
                      )}
                    </div>
                    {review.resolution && (
                      <p className="mt-2 text-xs bg-success/10 text-accent-dark rounded p-2">
                        Resolution: {review.resolution}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
