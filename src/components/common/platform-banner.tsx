"use client";

import { useEffect, useState } from "react";
import { api, ApiAnnouncement } from "@/lib/api";
import { Info, AlertTriangle, Wrench, X } from "lucide-react";

export function PlatformBanner() {
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load dismissed IDs from sessionStorage
    try {
      const stored = sessionStorage.getItem("dismissed_announcements");
      if (stored) {
        setDismissed(new Set(JSON.parse(stored)));
      }
    } catch {
      /* ignore */
    }

    const fetchAnnouncements = async () => {
      try {
        const result = await api.announcements.getActive();
        setAnnouncements(result);
      } catch {
        /* ignore */
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    try {
      sessionStorage.setItem("dismissed_announcements", JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const visible = announcements.filter((a) => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-0">
      {visible.map((a) => {
        let bgClass = "bg-blue-50 border-blue-200 text-blue-800";
        let Icon = Info;
        if (a.type === "warning") {
          bgClass = "bg-amber-50 border-amber-200 text-amber-800";
          Icon = AlertTriangle;
        } else if (a.type === "maintenance") {
          bgClass = "bg-red-50 border-red-200 text-red-800";
          Icon = Wrench;
        }

        return (
          <div
            key={a.id}
            className={`flex items-center gap-2 border-b px-4 py-2 text-sm ${bgClass}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <p className="flex-1">{a.message}</p>
            <button
              onClick={() => handleDismiss(a.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
