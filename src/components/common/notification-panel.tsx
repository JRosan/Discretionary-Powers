"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  FileText,
  Clock,
  AlertTriangle,
  MessageSquare,
  Scale,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean | null;
  sentAt: string | Date | null;
  decisionId: string | null;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  assignment: UserPlus,
  approval_needed: FileText,
  overdue: AlertTriangle,
  status_change: Check,
  comment: MessageSquare,
  judicial_review: Scale,
};

const typeColors: Record<string, string> = {
  assignment: "text-blue-600 bg-blue-50",
  approval_needed: "text-amber-600 bg-amber-50",
  overdue: "text-red-600 bg-red-50",
  status_change: "text-green-600 bg-green-50",
  comment: "text-purple-600 bg-purple-50",
  judicial_review: "text-rose-600 bg-rose-50",
};

function formatTime(date: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onRefresh,
}: NotificationPanelProps) {
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleNotificationClick(n: Notification) {
    if (!n.read) onMarkRead(n.id);
    if (n.decisionId) {
      router.push(`/decisions/${n.decisionId}`);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) onRefresh();
        }}
        className="relative rounded-md p-2 text-text-secondary hover:bg-surface transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-lg border border-border bg-white shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-accent hover:bg-surface transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-text-muted hover:bg-surface transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Clock className="h-10 w-10 text-text-muted mb-3" />
                <p className="text-sm font-medium text-text-secondary">No notifications</p>
                <p className="text-xs text-text-muted mt-1">You're all caught up</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] ?? Bell;
                const colorClass = typeColors[n.type] ?? "text-gray-600 bg-gray-50";

                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-surface",
                      !n.read && "bg-blue-50/40"
                    )}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm truncate", !n.read ? "font-semibold text-text-primary" : "text-text-secondary")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-text-muted mt-1">{formatTime(n.sentAt)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(n.id);
                      }}
                      className="mt-0.5 shrink-0 rounded p-1 text-text-muted opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
