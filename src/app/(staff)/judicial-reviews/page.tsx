"use client";

import Link from "next/link";
import { Scale, AlertTriangle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; variant: "warning" | "accent" | "success" | "outline" }> = {
  filed: { label: "Filed", variant: "warning" },
  pending: { label: "Pending", variant: "warning" },
  under_review: { label: "Under Review", variant: "accent" },
  resolved: { label: "Resolved", variant: "success" },
  dismissed: { label: "Dismissed", variant: "outline" },
};

const GROUND_CONFIG: Record<string, { label: string; className: string }> = {
  illegality: { label: "Illegality", className: "bg-error text-white" },
  irrationality: { label: "Irrationality", className: "bg-warning text-text" },
  proceduralimpropriety: { label: "Procedural Impropriety", className: "bg-accent text-white" },
  proportionality: { label: "Proportionality", className: "bg-purple-600 text-white" },
};

function groundKey(ground: string): string {
  return ground.toLowerCase().replace(/_/g, "");
}

export default function JudicialReviewsPage() {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["judicial-reviews"],
    queryFn: () => api.judicialReviews.list(),
  });

  const counts = reviews
    ? {
        pending: reviews.filter((r) => r.status === "filed" || r.status === "pending").length,
        underReview: reviews.filter((r) => r.status === "under_review").length,
        resolved: reviews.filter((r) => r.status === "resolved").length,
      }
    : { pending: 0, underReview: 0, resolved: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Judicial Reviews</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track decisions flagged for judicial review
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-text">{counts.pending}</p>
              <p className="text-sm text-text-secondary">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Clock className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-text">{counts.underReview}</p>
              <p className="text-sm text-text-secondary">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold text-text">{counts.resolved}</p>
              <p className="text-sm text-text-secondary">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center text-error">
            Failed to load judicial reviews: {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {reviews && reviews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Scale className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No judicial reviews have been filed.</p>
          </CardContent>
        </Card>
      )}

      {/* Review list */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = STATUS_MAP[review.status] ?? { label: review.status, variant: "outline" as const };
            const gk = groundKey(review.ground);
            const ground = GROUND_CONFIG[gk];

            return (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/decisions/${review.decisionId}`}
                          className="font-mono text-xs text-accent hover:underline"
                        >
                          {review.decisionReference ?? review.decisionId}
                        </Link>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {ground ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ground.className}`}>
                            {ground.label}
                          </span>
                        ) : (
                          <Badge variant="outline">{review.ground}</Badge>
                        )}
                      </div>
                      {review.decisionTitle && (
                        <p className="mt-1 text-sm font-semibold text-text">
                          {review.decisionTitle}
                        </p>
                      )}
                      {review.notes && (
                        <p className="mt-1 text-sm text-text-secondary">{review.notes}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                        <span>Filed: {review.filedDate}</span>
                        {review.courtReference && (
                          <span>Court Ref: {review.courtReference}</span>
                        )}
                      </div>
                      {review.outcome && (
                        <p className="mt-2 text-xs bg-success/10 text-accent-dark rounded p-2">
                          Outcome: {review.outcome}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
