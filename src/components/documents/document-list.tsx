"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Trash2, FileText, ShieldAlert } from "lucide-react";
import { api, type ApiDocument } from "@/lib/api";
import { RedactionPanel } from "@/components/documents/redaction-panel";

const CLASSIFICATION_LABELS: Record<string, string> = {
  evidence: "Evidence",
  legal_opinion: "Legal Opinion",
  correspondence: "Correspondence",
  public_notice: "Public Notice",
  internal_memo: "Internal Memo",
};

const CLASSIFICATION_VARIANTS: Record<
  string,
  "default" | "accent" | "warning" | "success" | "outline"
> = {
  evidence: "default",
  legal_opinion: "accent",
  correspondence: "outline",
  public_notice: "success",
  internal_memo: "warning",
};

interface DocumentListProps {
  decisionId: string;
}

export function DocumentList({ decisionId }: DocumentListProps) {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ApiDocument | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [redactTarget, setRedactTarget] = useState<ApiDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await api.documents.list(decisionId);
      setDocuments(data);
    } catch {
      // silently fail -- user sees empty state
    } finally {
      setLoading(false);
    }
  }, [decisionId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = useCallback(async (documentId: string) => {
    try {
      setError(null);
      const { url, filename } = await api.documents.getDownloadUrl(documentId);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download document.";
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.documents.delete(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete document.";
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "Pending";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-text-muted">
        Loading documents...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        <FileText className="mb-3 h-10 w-10 text-text-muted" />
        <p className="text-sm font-medium text-text-secondary">
          No documents uploaded
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Upload documents to attach them to this decision.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Filename
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Classification
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Size
              </th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">
                Date
              </th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-border last:border-0 hover:bg-surface-hover"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="truncate font-medium">
                      {doc.originalFilename}
                    </span>
                    {doc.isRedacted && (
                      <Badge variant="error">Redacted</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      CLASSIFICATION_VARIANTS[doc.classification] ?? "outline"
                    }
                  >
                    {CLASSIFICATION_LABELS[doc.classification] ??
                      doc.classification}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {formatFileSize(doc.sizeBytes)}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(doc.id)}
                      className="rounded p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedactTarget(doc)}
                      className="rounded p-1.5 text-text-muted hover:bg-warning/10 hover:text-warning"
                      title="Redact"
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(doc)}
                      className="rounded p-1.5 text-text-muted hover:bg-error/10 hover:text-error"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Redaction dialog */}
      <Dialog
        open={!!redactTarget}
        onOpenChange={(open) => !open && setRedactTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Redaction</DialogTitle>
            <DialogDescription>
              Manage redaction status for &quot;{redactTarget?.originalFilename}&quot;
            </DialogDescription>
          </DialogHeader>
          {redactTarget && (
            <RedactionPanel
              documentId={redactTarget.id}
              isRedacted={redactTarget.isRedacted ?? false}
              redactionNotes={redactTarget.redactionNotes}
              onSave={async (data) => {
                await api.documents.redact(redactTarget.id, data);
                setDocuments((prev) =>
                  prev.map((d) =>
                    d.id === redactTarget.id
                      ? { ...d, isRedacted: data.isRedacted, redactionNotes: data.redactionNotes }
                      : d,
                  ),
                );
                setRedactTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.originalFilename}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
