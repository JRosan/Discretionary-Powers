import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <p className="text-sm font-medium tracking-wide uppercase">
            Government of the Virgin Islands
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Discretionary Powers Management System
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mb-12">
          Transparent tracking and reporting of discretionary powers exercised by
          government officials, aligned with the 10-step framework for proper
          and lawful decision-making.
        </p>

        <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
          <Link
            href="/dashboard"
            className="rounded-lg border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
          >
            <h2 className="text-lg font-semibold text-primary mb-2">
              Staff Portal
            </h2>
            <p className="text-sm text-text-secondary">
              Manage decisions, track workflow progress, and generate reports.
            </p>
          </Link>

          <Link
            href="/decisions"
            className="rounded-lg border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
          >
            <h2 className="text-lg font-semibold text-primary mb-2">
              Public Transparency
            </h2>
            <p className="text-sm text-text-secondary">
              Browse published decisions and access public records.
            </p>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Government of the Virgin Islands.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
