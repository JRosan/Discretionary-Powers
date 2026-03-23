"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiOrganization } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  BarChart3,
  Loader2,
  Save,
} from "lucide-react";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tenant, setTenant] = useState<ApiOrganization | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    domain: "",
    primaryColor: "",
    accentColor: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [tenantData, statsData] = await Promise.all([
          api.superAdmin.getTenant(id),
          api.superAdmin.getTenantStats(id),
        ]);
        setTenant(tenantData);
        setStats(statsData);
        setEditForm({
          name: tenantData.name,
          slug: tenantData.slug,
          domain: tenantData.domain ?? "",
          primaryColor: tenantData.primaryColor ?? "",
          accentColor: tenantData.accentColor ?? "",
        });
      } catch {
        setError("Failed to load tenant details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.superAdmin.updateTenant(id, editForm as unknown as Record<string, unknown>);
      setSuccess("Tenant updated successfully");
      const updated = await api.superAdmin.getTenant(id);
      setTenant(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tenant");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!tenant) return;
    const action = tenant.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this tenant?`)) return;
    try {
      await api.superAdmin.updateTenant(id, { isActive: !tenant.isActive });
      const updated = await api.superAdmin.getTenant(id);
      setTenant(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} tenant`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Tenant not found</p>
      </div>
    );
  }

  const byStatus = (stats?.byStatus as Record<string, number>) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/super-admin/tenants"
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{tenant.name}</h1>
          <p className="text-text-muted text-sm mt-1 font-mono">{tenant.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              tenant.isActive ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
            }`}
          >
            {tenant.isActive ? "Active" : "Inactive"}
          </span>
          <Button
            variant={tenant.isActive ? "outline" : "accent"}
            onClick={handleDeactivate}
          >
            {tenant.isActive ? "Deactivate Tenant" : "Activate Tenant"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold text-text">
                {(stats?.totalUsers as number) ?? 0}
              </p>
              <p className="text-xs text-text-muted">Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xl font-bold text-text">
                {(stats?.totalDecisions as number) ?? 0}
              </p>
              <p className="text-xs text-text-muted">Decisions</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-warning-dark" />
            <div>
              <p className="text-xl font-bold text-text">
                {(stats?.totalPublished as number) ?? 0}
              </p>
              <p className="text-xs text-text-muted">Published</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">Last Activity</p>
              <p className="text-sm font-medium text-text">
                {stats?.lastActivity
                  ? new Date(stats.lastActivity as string).toLocaleDateString()
                  : "No activity"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decisions by status */}
      {Object.keys(byStatus).length > 0 && (
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-medium text-text mb-3">Decisions by Status</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="rounded-md bg-surface px-3 py-2 text-sm">
                <span className="text-text-muted capitalize">{status.replace(/_/g, " ")}</span>
                <span className="ml-2 font-semibold text-text">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Organization Settings</h3>
        {error && (
          <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error mb-4">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <Input
            label="Organization Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={editForm.slug}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              })
            }
            required
          />
          <Input
            label="Domain"
            value={editForm.domain}
            onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
            placeholder="e.g., decisions.gov.bm"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primary Color"
              value={editForm.primaryColor}
              onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
              placeholder="#1D3557"
            />
            <Input
              label="Accent Color"
              value={editForm.accentColor}
              onChange={(e) => setEditForm({ ...editForm, accentColor: e.target.value })}
              placeholder="#2A9D8F"
            />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="accent" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Metadata */}
      <div className="rounded-lg border border-border bg-background p-4 text-sm text-text-muted">
        <p>
          Created: {new Date(tenant.createdAt).toLocaleString()} | Last updated:{" "}
          {new Date(tenant.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
