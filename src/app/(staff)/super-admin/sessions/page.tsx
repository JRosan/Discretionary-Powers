"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Users, Monitor, Info } from "lucide-react";

interface Session {
  email: string;
  userId: string | null;
  organizationId: string | null;
  organizationName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  lastSeen: string;
}

interface SessionsData {
  count: number;
  items: Session[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export default function SessionsPage() {
  const [data, setData] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getSessions();
        setData(result as unknown as SessionsData);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-bold text-text">Active Sessions</h1>
        <p className="text-text-muted text-sm mt-1">
          Users who have logged in within the last 24 hours
        </p>
      </div>

      {/* Count badge */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-text">
            {data?.count ?? 0} active session{data?.count !== 1 ? "s" : ""} in last 24h
          </span>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Sessions are stateless (JWT). This shows recent login activity grouped by user.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-2 text-left font-medium text-text-muted">User Email</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Organization</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">IP Address</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Last Seen</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((session, i) => (
                <tr key={`${session.email}-${i}`} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                      <span className="font-medium text-text">{session.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs">
                    {session.organizationName ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-text-muted font-mono text-xs">
                    {session.ipAddress ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs whitespace-nowrap">
                    {timeAgo(session.lastSeen)}
                    <span className="ml-1 text-text-muted/60">
                      ({new Date(session.lastSeen).toLocaleTimeString()})
                    </span>
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs max-w-[200px] truncate" title={session.userAgent ?? ""}>
                    {session.userAgent ?? "-"}
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    No active sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
