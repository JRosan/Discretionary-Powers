"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CLASSIFICATION_LABELS: Record<string, { label: string; variant: "default" | "accent" | "warning" | "outline" }> = {
  evidence: { label: "Evidence", variant: "default" },
  legal_opinion: { label: "Legal Opinion", variant: "accent" },
  correspondence: { label: "Correspondence", variant: "outline" },
  public_notice: { label: "Public Notice", variant: "warning" },
  internal_memo: { label: "Internal Memo", variant: "outline" },
};

const MOCK_DOCUMENTS = [
  { id: "doc-1", name: "Environmental Impact Assessment.pdf", classification: "evidence", size: "2.4 MB", uploadedBy: "PS Williams", uploadedAt: "2026-03-16", step: 3 },
  { id: "doc-2", name: "Legal Opinion — Planning Authority.pdf", classification: "legal_opinion", size: "890 KB", uploadedBy: "John Legal", uploadedAt: "2026-03-17", step: 1 },
  { id: "doc-3", name: "Public Consultation Summary.pdf", classification: "correspondence", size: "1.2 MB", uploadedBy: "PS Williams", uploadedAt: "2026-03-18", step: 3 },
  { id: "doc-4", name: "Stakeholder Submissions (12).zip", classification: "correspondence", size: "5.7 MB", uploadedBy: "PS Williams", uploadedAt: "2026-03-18", step: 3 },
  { id: "doc-5", name: "Site Survey Report.pdf", classification: "evidence", size: "3.1 MB", uploadedBy: "Hon. Minister Smith", uploadedAt: "2026-03-19", step: 4 },
];

export default function DocumentsPage({
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
            <h1 className="text-2xl font-semibold text-text">Documents</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Supporting documents and evidence for this decision
            </p>
          </div>
          <Button variant="accent">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {MOCK_DOCUMENTS.length} documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_DOCUMENTS.map((doc) => {
              const cls = CLASSIFICATION_LABELS[doc.classification] ?? { label: doc.classification, variant: "outline" as const };
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border border-border p-4 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={cls.variant}>{cls.label}</Badge>
                        <span className="text-xs text-text-muted">
                          {doc.size}
                        </span>
                        <span className="text-xs text-text-muted">
                          Step {doc.step}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
