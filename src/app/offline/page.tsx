"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      {/* Government branding */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-primary tracking-wide">DPMS</h2>
        <p className="text-xs text-text-secondary">
          Government of the Virgin Islands
        </p>
      </div>

      {/* Offline message */}
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <WifiOff className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-text-primary">
          You are currently offline
        </h1>

        <p className="mb-6 text-sm text-text-secondary">
          Some features are unavailable while offline. Previously viewed
          decisions may still be accessible.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-light"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
