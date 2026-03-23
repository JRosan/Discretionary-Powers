"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type ApiAuditEntry } from "@/lib/api";

function formatTimestamp(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAction(action: string) {
  return action
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderDetails(details: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) return null;
  return (
    <div className="mt-1 space-y-0.5 rounded bg-surface p-2 text-xs text-text-muted">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="font-medium text-text-secondary min-w-[80px]">
            {key}:
          </span>
          <span className="break-all">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AuditTrailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: entries, isLoading } = useQuery({
    queryKey: ["audit", id],
    queryFn: () => api.audit.getByDecision(id),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/decisions/${id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decision
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Audit Trail</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Complete history of all actions taken on this decision
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/decisions/${id}/export?format=json`, '_blank')}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : !entries || entries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-sm text-text-muted">
              No audit entries recorded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {entries.map((entry: ApiAuditEntry, i: number) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent mt-2" />
                    {i < entries.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-6 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text">
                        {formatAction(entry.action)}
                      </p>
                      <span className="text-xs font-mono text-text-muted shrink-0">
                        {formatTimestamp(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      User: {entry.performedBy}
                    </p>
                    {renderDetails(entry.details)}
                    <p className="text-xs font-mono text-text-muted mt-1">
                      Hash: {entry.hash.slice(0, 16)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
