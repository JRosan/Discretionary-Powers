"use client";

import { useEffect, useState } from "react";
import { api, ApiAnnouncement } from "@/lib/api";
import {
  Loader2,
  Megaphone,
  Trash2,
  Plus,
  Info,
  AlertTriangle,
  Wrench,
} from "lucide-react";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const result = await api.superAdmin.getAnnouncements();
      setAnnouncements(result);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setCreating(true);
    try {
      await api.superAdmin.createAnnouncement({
        message: message.trim(),
        type,
        expiresAt: expiresAt || undefined,
      });
      setMessage("");
      setType("info");
      setExpiresAt("");
      await fetchAnnouncements();
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.superAdmin.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      /* ignore */
    }
  };

  const typeIcon = (t: string) => {
    switch (t) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning-dark" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-error" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const typeBadge = (t: string) => {
    switch (t) {
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-dark">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            <Wrench className="h-3 w-3" />
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            <Info className="h-3 w-3" />
            Info
          </span>
        );
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
        <h1 className="text-2xl font-bold text-text">Platform Announcements</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage banners shown to all platform users
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Announcement
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message..."
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-muted resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-text"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || creating}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="h-4 w-4" />
            )}
            Publish Announcement
          </button>
        </form>
      </div>

      {/* Active announcements */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">
            All Announcements ({announcements.length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {announcements.map((a) => {
            const isExpired = a.expiresAt && new Date(a.expiresAt) < new Date();
            return (
              <div
                key={a.id}
                className={`flex items-start gap-3 px-4 py-3 ${isExpired ? "opacity-50" : ""}`}
              >
                <div className="mt-0.5">{typeIcon(a.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">{a.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {typeBadge(a.type)}
                    <span className="text-xs text-text-muted">
                      Created {new Date(a.createdAt).toLocaleString()}
                    </span>
                    {a.expiresAt && (
                      <span className="text-xs text-text-muted">
                        {isExpired ? "Expired" : `Expires ${new Date(a.expiresAt).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-text-muted hover:text-error transition-colors shrink-0"
                  title="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {announcements.length === 0 && (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              No announcements yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
