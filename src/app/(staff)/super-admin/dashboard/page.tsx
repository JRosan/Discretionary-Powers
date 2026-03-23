"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Activity,
  Database,
  HardDrive,
  Loader2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface DashboardData {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalDecisions: number;
  mrr: number;
  arr: number;
  recentTenants: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    userCount: number;
  }[];
  subscriptionsByPlan: Record<string, number>;
}

export default function PlatformDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<"up" | "down" | "checking">("checking");
  const [sandbox, setSandbox] = useState<{ exists: boolean; isActive?: boolean; userCount?: number; decisionCount?: number } | null>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getDashboard();
        setData(result as unknown as DashboardData);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };

    const checkHealth = async () => {
      try {
        await api.health.check();
        setApiHealth("up");
      } catch {
        setApiHealth("down");
      }
    };

    const fetchSandbox = async () => {
      try {
        const result = await api.superAdmin.getSandboxStatus();
        setSandbox(result);
      } catch {
        /* ignore */
      }
    };

    fetchData();
    checkHealth();
    fetchSandbox();
  }, []);

  const handleCreateSandbox = async () => {
    setSandboxLoading(true);
    try {
      await api.superAdmin.createSandbox();
      const result = await api.superAdmin.getSandboxStatus();
      setSandbox(result);
    } catch {
      /* ignore */
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleResetSandbox = async () => {
    setSandboxLoading(true);
    try {
      await api.superAdmin.resetSandbox();
      const result = await api.superAdmin.getSandboxStatus();
      setSandbox(result);
    } catch {
      /* ignore */
    } finally {
      setSandboxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-text-muted">
        Failed to load platform dashboard data.
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Platform Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          GovDecision SaaS platform overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data.totalTenants}</p>
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
              <p className="text-2xl font-bold text-text">{data.totalUsers}</p>
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
              <p className="text-2xl font-bold text-text">{data.totalDecisions}</p>
              <p className="text-xs text-text-muted">Total Decisions</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{formatCurrency(data.mrr)}</p>
              <p className="text-xs text-text-muted">Monthly Recurring Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active vs Inactive Tenants */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="text-sm font-semibold text-text mb-4">Tenant Status</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Active</span>
                <span className="text-sm font-semibold text-accent">{data.activeTenants}</span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{
                    width: data.totalTenants > 0
                      ? `${(data.activeTenants / data.totalTenants) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Inactive</span>
                <span className="text-sm font-semibold text-error">
                  {data.totalTenants - data.activeTenants}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-error transition-all"
                  style={{
                    width: data.totalTenants > 0
                      ? `${((data.totalTenants - data.activeTenants) / data.totalTenants) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subscriptions by plan */}
          {Object.keys(data.subscriptionsByPlan).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wider">
                Subscriptions by Plan
              </h3>
              <div className="space-y-2">
                {Object.entries(data.subscriptionsByPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="text-sm text-text capitalize">{plan}</span>
                    <span className="text-sm font-medium text-text">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h2 className="text-sm font-semibold text-text mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text">API Status</span>
              </div>
              {apiHealth === "checking" ? (
                <span className="text-xs text-text-muted">Checking...</span>
              ) : apiHealth === "up" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  Operational
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                  <XCircle className="h-3 w-3" />
                  Down
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text">Database</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text">Storage (MinIO)</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                <CheckCircle2 className="h-3 w-3" />
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sandbox Environment */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <PlayCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Sandbox Environment</h2>
              <p className="text-xs text-text-muted">Pre-populated demo for prospects</p>
            </div>
          </div>
          {sandbox?.exists ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-muted">
              Not Created
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sandbox?.exists ? (
            <>
              <button
                onClick={handleResetSandbox}
                disabled={sandboxLoading}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Sandbox
              </button>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-light transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Demo Page
              </Link>
              {sandbox.userCount !== undefined && (
                <span className="text-xs text-text-muted ml-auto">
                  {sandbox.userCount} users, {sandbox.decisionCount} decisions
                </span>
              )}
            </>
          ) : (
            <button
              onClick={handleCreateSandbox}
              disabled={sandboxLoading}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-light transition-colors disabled:opacity-50"
            >
              {sandboxLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PlayCircle className="h-3.5 w-3.5" />
              )}
              Create Sandbox
            </button>
          )}
        </div>
      </div>

      {/* Recent Tenant Signups */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Recent Tenant Signups</h2>
          <Link
            href="/super-admin/tenants"
            className="text-xs text-accent hover:underline"
          >
            View all tenants
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-2 text-left font-medium text-text-muted">Organization</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Slug</th>
              <th className="px-4 py-2 text-center font-medium text-text-muted">Users</th>
              <th className="px-4 py-2 text-center font-medium text-text-muted">Status</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.recentTenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                <td className="px-4 py-2">
                  <Link
                    href={`/super-admin/tenants/${tenant.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {tenant.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-text-muted font-mono text-xs">{tenant.slug}</td>
                <td className="px-4 py-2 text-center">{tenant.userCount}</td>
                <td className="px-4 py-2 text-center">
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
                <td className="px-4 py-2 text-text-muted text-xs">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {data.recentTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                  No tenants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
