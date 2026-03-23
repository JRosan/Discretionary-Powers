"use client";

import { useEffect, useState } from "react";
import { api, ApiDemoRequest } from "@/lib/api";
import { Loader2, Calendar, Mail, Building2, Globe } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
];

function getStatusBadge(status: string) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${opt.color}`}>
      {opt.label}
    </span>
  );
}

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<ApiDemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await api.superAdmin.getDemoRequests();
        setRequests(result.items);
        setTotal(result.total);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.superAdmin.updateDemoRequestStatus(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      /* ignore */
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
      <div>
        <h1 className="text-2xl font-bold text-text">Demo Requests</h1>
        <p className="text-text-muted text-sm mt-1">
          {total} total demo booking request{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-2 text-left font-medium text-text-muted">Name</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Email</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Organization</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Country</th>
              <th className="px-4 py-2 text-center font-medium text-text-muted">Users</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Preferred Date</th>
              <th className="px-4 py-2 text-center font-medium text-text-muted">Status</th>
              <th className="px-4 py-2 text-left font-medium text-text-muted">Received</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-border last:border-0 hover:bg-surface/50"
              >
                <td className="px-4 py-2">
                  <div>
                    <p className="font-medium text-text">{req.name}</p>
                    <p className="text-xs text-text-muted">{req.jobTitle}</p>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <a
                    href={`mailto:${req.email}`}
                    className="text-accent hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {req.email}
                  </a>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-text-muted" />
                    {req.organization}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-text-muted" />
                    {req.country}
                  </div>
                </td>
                <td className="px-4 py-2 text-center text-text-muted">
                  {req.userRange ?? "--"}
                </td>
                <td className="px-4 py-2">
                  {req.preferredDate ? (
                    <div className="flex items-center gap-1 text-text-muted">
                      <Calendar className="h-3 w-3" />
                      {req.preferredDate}
                    </div>
                  ) : (
                    <span className="text-text-muted">--</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-text-muted text-xs">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                  No demo requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
