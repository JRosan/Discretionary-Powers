"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, ApiDecision, ApiMinistry } from "@/lib/api";
import { Search, FileText, Building2, BarChart3, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublicHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["public-statistics"],
    queryFn: () => api.statistics.getPublic(),
  });

  const { data: recentDecisions, isLoading: decisionsLoading } = useQuery({
    queryKey: ["public-decisions-recent"],
    queryFn: () => api.decisions.getPublicList({ limit: 5, sort: "newest" }),
  });

  const { data: ministries, isLoading: ministriesLoading } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/decisions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const totalDecisions = (stats as Record<string, unknown>)?.totalPublished ?? 0;
  const totalMinistries = (stats as Record<string, unknown>)?.totalMinistries ?? ministries?.length ?? 0;
  const avgSteps = (stats as Record<string, unknown>)?.averageCompletionSteps ?? 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white -mx-4 -mt-8 px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-white/70 mb-2">
            Government of the Virgin Islands
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">
            Discretionary Powers Transparency Portal
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Promoting accountability and good governance through the structured 10-step
            framework for the proper and lawful exercise of discretionary powers.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search published decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-0 bg-white py-4 pl-12 pr-4 text-text shadow-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Published Decisions</p>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text">{String(totalDecisions)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Government Ministries</p>
                {statsLoading && ministriesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text">{String(totalMinistries)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Avg. Completion Steps</p>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-text">{String(avgSteps)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Published Decisions */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text">Recent Published Decisions</h2>
          <Link
            href="/portal/decisions"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {decisionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        ) : !recentDecisions?.items?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No published decisions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentDecisions.items.map((decision: ApiDecision) => (
              <Link
                key={decision.id}
                href={`/portal/decisions/${decision.id}`}
                className="block rounded-lg border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs text-text-muted">
                    {decision.referenceNumber}
                  </span>
                  <Badge variant="outline">{decision.decisionType}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-text mb-1">{decision.title}</h3>
                {decision.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {decision.description}
                  </p>
                )}
                <p className="text-xs text-text-muted">
                  {decision.createdAt
                    ? `Published ${new Date(decision.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
                    : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Browse by Ministry */}
      <section className="pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text">Browse by Ministry</h2>
          <Link
            href="/portal/ministries"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {ministriesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        ) : !ministries?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No ministries found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry: ApiMinistry) => (
              <Link
                key={ministry.id}
                href={`/portal/decisions?ministry=${ministry.id}`}
                className="block"
              >
                <Card className="h-full hover:border-accent hover:shadow-sm transition-all">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text truncate">{ministry.name}</p>
                      <p className="text-xs text-text-muted">{ministry.code}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer Links */}
      <section className="border-t border-border pt-8 pb-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-text mb-3">Learn More</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/portal/about" className="text-accent hover:text-accent/80 transition-colors">
                  About the 10-Step Framework
                </Link>
              </li>
              <li>
                <Link href="/about#rights" className="text-accent hover:text-accent/80 transition-colors">
                  Your Rights — Judicial Review
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="text-accent hover:text-accent/80 transition-colors">
                  How to Request Information
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-3">Government Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-text-secondary">
                  Official Government Website — gov.vg
                </span>
              </li>
              <li>
                <span className="text-text-secondary">
                  House of Assembly — hoabvi.org
                </span>
              </li>
              <li>
                <span className="text-text-secondary">
                  BVI Commission of Inquiry Report
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
