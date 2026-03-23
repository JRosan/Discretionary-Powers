"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiOrganization } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Users, FileText, Plus, Loader2 } from "lucide-react";

interface CreateTenantForm {
  name: string;
  slug: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<ApiOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateTenantForm>({
    name: "",
    slug: "",
    adminEmail: "",
    adminName: "",
    adminPassword: "",
  });

  const fetchTenants = async () => {
    try {
      const data = await api.superAdmin.listTenants();
      setTenants(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const totalUsers = tenants.reduce((sum, t) => sum + (t.userCount ?? 0), 0);
  const totalDecisions = tenants.reduce((sum, t) => sum + (t.decisionCount ?? 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.superAdmin.createTenant(form as unknown as Record<string, unknown>);
      setShowCreate(false);
      setForm({ name: "", slug: "", adminEmail: "", adminName: "", adminPassword: "" });
      await fetchTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Tenant Management</h1>
          <p className="text-text-muted text-sm mt-1">
            Manage organizations on the GovDecision platform
          </p>
        </div>
        <Button variant="accent" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{tenants.length}</p>
              <p className="text-xs text-text-muted">Total Tenants</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totalUsers}</p>
              <p className="text-xs text-text-muted">Total Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FileText className="h-5 w-5 text-warning-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totalDecisions}</p>
              <p className="text-xs text-text-muted">Total Decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants table */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-medium text-text-muted">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted">Slug</th>
              <th className="px-4 py-3 text-center font-medium text-text-muted">Users</th>
              <th className="px-4 py-3 text-center font-medium text-text-muted">Decisions</th>
              <th className="px-4 py-3 text-center font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-muted">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/super-admin/tenants/${tenant.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {tenant.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{tenant.slug}</td>
                <td className="px-4 py-3 text-center">{tenant.userCount ?? 0}</td>
                <td className="px-4 py-3 text-center">{tenant.decisionCount ?? 0}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      tenant.isActive
                        ? "bg-accent/10 text-accent"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {tenant.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted text-xs">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No tenants found. Create your first tenant to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-text mb-4">Create New Tenant</h2>
            {error && (
              <div className="rounded-md bg-error/10 px-3 py-2 text-sm text-error mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Organization Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g., Government of Bermuda"
              />
              <Input
                label="Slug"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
                required
                placeholder="e.g., bermuda"
              />
              <Input
                label="Admin Email"
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                required
                placeholder="admin@example.gov"
              />
              <Input
                label="Admin Name"
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                required
                placeholder="Admin User"
              />
              <Input
                label="Admin Password"
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                required
                placeholder="Minimum 8 characters"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" loading={creating}>
                  {creating ? "Creating..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
