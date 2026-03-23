"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ApiOrganization } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Filter } from "lucide-react";

interface AuditEntry {
  id: number;
  decisionId: string | null;
  action: string;
  stepNumber: number | null;
  organizationId: string;
  organizationName: string | null;
  userId: string;
  userName: string | null;
  decisionReference: string | null;
  ipAddress: string | null;
  entryHash: string;
  createdAt: string;
}

interface AuditResponse {
  items: AuditEntry[];
  total: number;
  hasMore: boolean;
}

export default function PlatformAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [organizations, setOrganizations] = useState<ApiOrganization[]>([]);

  // Filters
  const [orgFilter, setOrgFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchEntries = useCallback(
    async (currentOffset: number, append: boolean = false) => {
      try {
        const params: Record<string, unknown> = { limit, offset: currentOffset };
        if (orgFilter) params.organizationId = orgFilter;
        if (actionFilter) params.action = actionFilter;

        const result = (await api.superAdmin.getAuditLog(params)) as unknown as AuditResponse;

        if (append) {
          setEntries((prev) => [...prev, ...result.items]);
        } else {
          setEntries(result.items);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch {
        /* ignore */
      }
    },
    [orgFilter, actionFilter],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setOffset(0);
      await fetchEntries(0);
      setLoading(false);
    };
    load();
  }, [fetchEntries]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await api.superAdmin.listTenants();
        setOrganizations(orgs);
      } catch {
        /* ignore */
      }
    };
    fetchOrgs();
  }, []);

  const handleLoadMore = async () => {
    const newOffset = offset + limit;
    setLoadingMore(true);
    setOffset(newOffset);
    await fetchEntries(newOffset, true);
    setLoadingMore(false);
  };

  // Collect unique actions for the filter dropdown
  const uniqueActions = Array.from(new Set(entries.map((e) => e.action))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Platform Audit Log</h1>
        <p className="text-text-muted text-sm mt-1">
          Cross-tenant audit entries across all organizations ({total} total)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-text-muted" />
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {/* Audit table */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-2 text-left font-medium text-text-muted">Timestamp</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Organization</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">User</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Action</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Decision Ref</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-2 text-text-muted text-xs whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-text text-xs">
                    {entry.organizationName ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-text text-xs">
                    {entry.userName ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-text-muted">
                    {entry.decisionReference ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">
                    {entry.stepNumber != null ? `Step ${entry.stepNumber}` : ""}
                    {entry.ipAddress ? ` (${entry.ipAddress})` : ""}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No audit entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} loading={loadingMore}>
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
