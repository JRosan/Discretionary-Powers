"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_AUDIT = [
  { id: "a1", timestamp: "2026-03-15 09:00:12", action: "Decision created", user: "Hon. Minister Smith", role: "Minister", details: "Decision DP-2026-001 initiated under Physical Planning Act s.12(3)." },
  { id: "a2", timestamp: "2026-03-16 10:30:45", action: "Step 1 completed", user: "Hon. Minister Smith", role: "Minister", details: "Authority confirmed. Legal basis: Physical Planning Act, 2004 — Section 12(3)." },
  { id: "a3", timestamp: "2026-03-16 14:22:08", action: "Document uploaded", user: "John Legal", role: "Legal Advisor", details: "Uploaded: Legal Opinion — Planning Authority.pdf (legal_opinion)" },
  { id: "a4", timestamp: "2026-03-17 09:15:33", action: "Step 2 completed", user: "Hon. Minister Smith", role: "Minister", details: "Procedures identified per Environmental Protection and Coastal Management guidelines." },
  { id: "a5", timestamp: "2026-03-17 11:00:00", action: "Document uploaded", user: "PS Williams", role: "Permanent Secretary", details: "Uploaded: Environmental Impact Assessment.pdf (evidence)" },
  { id: "a6", timestamp: "2026-03-18 10:45:19", action: "Document uploaded", user: "PS Williams", role: "Permanent Secretary", details: "Uploaded: Public Consultation Summary.pdf (correspondence)" },
  { id: "a7", timestamp: "2026-03-18 16:30:00", action: "Step 3 completed", user: "PS Williams", role: "Permanent Secretary", details: "Information gathering complete. 12 public submissions received." },
  { id: "a8", timestamp: "2026-03-19 09:30:00", action: "Step 4 started", user: "Hon. Minister Smith", role: "Minister", details: "Evidence evaluation commenced." },
];

export default function AuditTrailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {MOCK_AUDIT.length} entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {MOCK_AUDIT.map((entry, i) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent mt-2" />
                  {i < MOCK_AUDIT.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text">
                      {entry.action}
                    </p>
                    <span className="text-xs font-mono text-text-muted">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {entry.user}{" "}
                    <span className="text-text-muted">({entry.role})</span>
                  </p>
                  {entry.details && (
                    <p className="text-xs text-text-muted mt-1 bg-surface rounded p-2">
                      {entry.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
