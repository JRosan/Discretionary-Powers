"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  if (showBackOnline) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-sm text-emerald-700">
        <Wifi className="h-4 w-4" />
        <span>Back online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-700">
      <WifiOff className="h-4 w-4" />
      <span>
        You are currently offline — some features may be limited
      </span>
    </div>
  );
}
