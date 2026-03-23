"use client";

import { useEffect, useState } from "react";
import { api, ApiOrganization } from "@/lib/api";
import {
  Loader2,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";

export default function CompliancePage() {
  const [tenants, setTenants] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  // Export state
  const [exportTenantId, setExportTenantId] = useState("");
  const [exporting, setExporting] = useState(false);

  // Delete state
  const [deleteTenantId, setDeleteTenantId] = useState("");
  const [confirmSlug, setConfirmSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const result = await api.superAdmin.listTenants();
        setTenants(result);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleExport = async () => {
    if (!exportTenantId) return;
    setExporting(true);
    try {
      const data = await api.superAdmin.exportTenantData(exportTenantId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const tenant = tenants.find((t) => t.id === exportTenantId);
      a.href = url;
      a.download = `tenant-export-${tenant?.slug ?? exportTenantId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTenantId || !confirmSlug) return;
    setDeleteError("");
    setDeleting(true);
    try {
      await api.superAdmin.deleteTenantData(deleteTenantId, confirmSlug);
      setTenants((prev) => prev.filter((t) => t.id !== deleteTenantId));
      setDeleteTenantId("");
      setConfirmSlug("");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  const selectedDeleteTenant = tenants.find((t) => t.id === deleteTenantId);

  const complianceItems = [
    { label: "Cryptographic audit trail (SHA-256 chain)", done: true },
    { label: "Role-based access control", done: true },
    { label: "Multi-factor authentication available", done: true },
    { label: "Data encryption at rest (TLS + AES-256)", done: true },
    { label: "Data encryption in transit (TLS 1.3)", done: true },
    { label: "Tenant data isolation (EF Core query filters)", done: true },
    { label: "SOC 2 Type II certification", done: false, note: "in progress" },
    { label: "ISO 27001 certification", done: false, note: "planned" },
    { label: "Annual penetration testing", done: false, note: "planned" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Data Compliance</h1>
        <p className="text-text-muted text-sm mt-1">
          GDPR data export, deletion, and compliance status
        </p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-warning-dark mt-0.5 shrink-0" />
        <p className="text-sm text-warning-dark">
          Data deletion is irreversible. Ensure you have exported data before proceeding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Export */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Tenant Data Export
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Select Tenant
              </label>
              <select
                value={exportTenantId}
                onChange={(e) => setExportTenantId(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text"
              >
                <option value="">Choose a tenant...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={!exportTenantId || exporting}
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export All Data
            </button>
          </div>
        </div>

        {/* Data Deletion */}
        <div className="rounded-lg border border-error/30 bg-background p-5">
          <h2 className="text-sm font-semibold text-error mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Tenant Data Deletion
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Select Tenant
              </label>
              <select
                value={deleteTenantId}
                onChange={(e) => {
                  setDeleteTenantId(e.target.value);
                  setConfirmSlug("");
                  setDeleteError("");
                }}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text"
              >
                <option value="">Choose a tenant...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            </div>
            {selectedDeleteTenant && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Type &quot;{selectedDeleteTenant.slug}&quot; to confirm
                </label>
                <input
                  type="text"
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                  placeholder={selectedDeleteTenant.slug}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text placeholder:text-text-muted"
                />
              </div>
            )}
            {deleteError && (
              <p className="text-xs text-error">{deleteError}</p>
            )}
            <button
              onClick={handleDelete}
              disabled={
                !deleteTenantId ||
                !confirmSlug ||
                confirmSlug !== selectedDeleteTenant?.slug ||
                deleting
              }
              className="h-9 rounded-md bg-error px-4 text-sm font-medium text-white hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Permanently Delete
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Compliance Status
        </h2>
        <div className="space-y-3">
          {complianceItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-text-muted shrink-0" />
              )}
              <span className={`text-sm ${item.done ? "text-text" : "text-text-muted"}`}>
                {item.label}
              </span>
              {item.note && (
                <span className="text-xs text-text-muted italic">({item.note})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
