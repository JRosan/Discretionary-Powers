import Link from "next/link";

export default function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 h-screen overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          {/* Logo */}
          <div className="px-8 pt-8 pb-2 text-center">
            <img src="/images/logos/crest-bw.png" alt="BVI Coat of Arms" className="mx-auto mb-4 h-16 w-auto" />
            <h1 className="text-lg font-semibold text-text">
              Government of the Virgin Islands
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              Discretionary Powers Management System
            </p>
          </div>

          <div className="px-8 py-6 space-y-4 text-center">
            <h2 className="text-base font-semibold text-text">Session Expired</h2>
            <p className="text-sm text-text-muted">
              Your session has expired. Please sign in again to continue.
            </p>
            <Link
              href="/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
