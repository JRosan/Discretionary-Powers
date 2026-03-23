"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DECISION_STEPS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  CheckCircle2,
  MinusCircle,
  Circle,
  FileText,
  Download,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function PublicDecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: decision,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-decision", id],
    queryFn: () => api.decisions.getPublicById(id),
  });

  const { data: ministries } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="py-16 text-center">
        <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-text mb-1">Decision not found</h2>
        <p className="text-sm text-text-secondary mb-6">
          This decision may not be published or does not exist.
        </p>
        <Link
          href="/portal/decisions"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
        >
          <ArrowLeft className="h-4 w-4" /> Back to decisions
        </Link>
      </div>
    );
  }

  const ministryName =
    ministries?.find((m) => m.id === decision.ministryId)?.name ?? decision.ministryId;

  // Build step status map from decision steps
  const stepStatusMap: Record<number, { status: string; completedAt: string | null; skipReason: string | null }> = {};
  if (decision.steps) {
    for (const step of decision.steps) {
      stepStatusMap[step.stepNumber] = {
        status: step.status,
        completedAt: step.completedAt,
        skipReason: step.skipReason,
      };
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-text-muted mb-6">
        <Link href="/portal" className="hover:text-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/portal/decisions" className="hover:text-accent transition-colors">
          Decisions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text font-medium">{decision.referenceNumber}</span>
      </nav>

      {/* Reference Number */}
      <p className="font-mono text-sm text-text-muted mb-2">{decision.referenceNumber}</p>

      {/* Title */}
      <h1 className="text-3xl font-bold text-text mb-4">{decision.title}</h1>

      {/* Description */}
      {decision.description && (
        <p className="text-text-secondary mb-8 max-w-3xl">{decision.description}</p>
      )}

      {/* Metadata Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-text-muted mb-1">Ministry</p>
            <p className="text-sm font-medium text-text">{ministryName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-text-muted mb-1">Decision Type</p>
            <Badge variant="outline">{decision.decisionType}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-text-muted mb-1">Date Published</p>
            <p className="text-sm font-medium text-text">
              {decision.updatedAt
                ? new Date(decision.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-text-muted mb-1">Status</p>
            <Badge variant="success">Published</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Decision Framework Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Decision Framework Progress</CardTitle>
          <p className="text-sm text-text-secondary">
            Completion status of the 10-step framework for this decision.
          </p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {DECISION_STEPS.map((step) => {
              const stepData = stepStatusMap[step.number];
              const isCompleted = stepData?.status === "completed";
              const isSkipped = stepData?.status === "skipped";

              return (
                <li key={step.number} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : isSkipped ? (
                      <MinusCircle className="h-5 w-5 text-text-muted" />
                    ) : (
                      <Circle className="h-5 w-5 text-border" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted">
                        Step {step.number}
                      </span>
                      <span className="text-sm font-medium text-text">{step.name}</span>
                      {isSkipped && (
                        <Badge variant="outline" className="text-xs">
                          Skipped
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                    {isCompleted && stepData.completedAt && (
                      <p className="text-xs text-success mt-0.5">
                        Completed{" "}
                        {new Date(stepData.completedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {isSkipped && stepData.skipReason && (
                      <p className="text-xs text-text-muted mt-0.5 italic">
                        Reason: {stepData.skipReason}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Public Documents */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Public Documents</CardTitle>
          <p className="text-sm text-text-secondary">
            Documents associated with this decision that are available for public access.
          </p>
        </CardHeader>
        <CardContent>
          <PublicDocuments decisionId={id} />
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-text-secondary">
          This decision was made following the Government&apos;s 10-step framework for the
          proper and lawful exercise of discretionary powers.{" "}
          <Link href="/portal/about" className="text-accent hover:text-accent/80 transition-colors">
            Learn more about the framework
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function PublicDocuments({ decisionId }: { decisionId: string }) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", decisionId],
    queryFn: () => api.documents.list(decisionId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
      </div>
    );
  }

  // Only show public notices and correspondence
  const publicDocs = documents?.filter(
    (d) => d.classification === "public_notice" || d.classification === "correspondence"
  );

  if (!publicDocs?.length) {
    return (
      <p className="text-sm text-text-muted py-4">
        No public documents are available for this decision.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {publicDocs.map((doc) => (
        <li key={doc.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">{doc.originalFilename}</p>
              <p className="text-xs text-text-muted">
                {(doc.sizeBytes / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <DownloadButton documentId={doc.id} />
        </li>
      ))}
    </ul>
  );
}

function DownloadButton({ documentId }: { documentId: string }) {
  const handleDownload = async () => {
    try {
      const { url } = await api.documents.getDownloadUrl(documentId);
      window.open(url, "_blank");
    } catch {
      // silently fail — download URL may not be available for public
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
    >
      <Download className="h-4 w-4" />
      Download
    </button>
  );
}
