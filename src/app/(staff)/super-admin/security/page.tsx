"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Search,
  ChevronDown,
} from "lucide-react";

interface LoginEvent {
  id: string;
  email: string;
  userId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface LoginActivityData {
  items: LoginEvent[];
  total: number;
  hasMore: boolean;
  stats: {
    loginsToday: number;
    failedToday: number;
    mfaToday: number;
  };
}

export default function SecurityPage() {
  const [data, setData] = useState<LoginActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchData = useCallback(async (resetOffset = false) => {
    setLoading(true);
    try {
      const currentOffset = resetOffset ? 0 : offset;
      if (resetOffset) setOffset(0);
      const result = await api.superAdmin.getLoginActivity({
        limit,
        offset: currentOffset,
        status: statusFilter || undefined,
        email: emailFilter || undefined,
      });
      setData(result as unknown as LoginActivityData);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [offset, statusFilter, emailFilter]);

  useEffect(() => {
    fetchData();
  }, [offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    fetchData(true);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            <AlertTriangle className="h-3 w-3" />
            Failed
          </span>
        );
      case "mfa_required":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-dark">
            <KeyRound className="h-3 w-3" />
            MFA Required
          </span>
        );
      case "mfa_verified":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            <KeyRound className="h-3 w-3" />
            MFA Verified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Security</h1>
        <p className="text-text-muted text-sm mt-1">
          Login activity and authentication monitoring
        </p>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{data.stats.loginsToday}</p>
                <p className="text-xs text-text-muted">Logins Today</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{data.stats.failedToday}</p>
                <p className="text-xs text-text-muted">Failed Attempts Today</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <KeyRound className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{data.stats.mfaToday}</p>
                <p className="text-xs text-text-muted">MFA Verifications Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 pr-8 text-sm text-text appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="mfa_required">MFA Required</option>
            <option value="mfa_verified">MFA Verified</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-text placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={handleSearch}
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2 text-left font-medium text-text-muted">Timestamp</th>
                    <th className="px-4 py-2 text-left font-medium text-text-muted">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-text-muted">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-text-muted">IP Address</th>
                    <th className="px-4 py-2 text-left font-medium text-text-muted">Organization</th>
                    <th className="px-4 py-2 text-left font-medium text-text-muted">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((event) => (
                    <tr key={event.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                      <td className="px-4 py-2 text-text-muted text-xs whitespace-nowrap">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-medium text-text">{event.email}</td>
                      <td className="px-4 py-2">{statusBadge(event.status)}</td>
                      <td className="px-4 py-2 text-text-muted font-mono text-xs">
                        {event.ipAddress ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-text-muted text-xs">
                        {event.organizationName ?? "-"}
                      </td>
                      <td className="px-4 py-2 text-text-muted text-xs max-w-[200px] truncate" title={event.userAgent ?? ""}>
                        {event.userAgent ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {(!data?.items || data.items.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        No login events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-text-muted">
                  Showing {offset + 1}–{Math.min(offset + limit, data.total)} of {data.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="h-8 rounded-md border border-border px-3 text-xs font-medium text-text disabled:opacity-50 hover:bg-surface transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={!data.hasMore}
                    className="h-8 rounded-md border border-border px-3 text-xs font-medium text-text disabled:opacity-50 hover:bg-surface transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
