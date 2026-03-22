"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";

const publishedDecisions = [
  {
    id: "5",
    reference: "DP-FIN-2026-0040",
    title: "Tax Exemption for Maritime Industry",
    description: "Amendment to provide tax exemptions for qualifying maritime businesses operating within the BVI maritime registry framework.",
    decisionType: "Financial",
    ministry: "Ministry of Finance",
    publishedAt: "2026-02-28",
  },
  {
    id: "6",
    reference: "DP-NAT-2026-0032",
    title: "Marine Conservation Zone Designation — Anegada",
    description: "Designation of the northern reef system of Anegada as a protected marine conservation zone under the National Parks Act.",
    decisionType: "Regulatory",
    ministry: "Ministry of Natural Resources",
    publishedAt: "2026-02-15",
  },
  {
    id: "7",
    reference: "DP-EDU-2026-0029",
    title: "Teacher Certification Standards Update",
    description: "Updated certification requirements for primary and secondary school teachers in the British Virgin Islands.",
    decisionType: "Policy",
    ministry: "Ministry of Education",
    publishedAt: "2026-01-20",
  },
];

export default function PublicDecisionsPage() {
  const [search, setSearch] = useState("");

  const filtered = publishedDecisions.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-text mb-2">Published Decisions</h1>
      <p className="text-text-secondary mb-8">
        Browse discretionary power decisions that have been published for public
        transparency.
      </p>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search published decisions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <FileText className="h-12 w-12 mx-auto mb-3" />
          <p className="font-medium">No decisions found</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((decision) => (
            <Link
              key={decision.id}
              href={`/decisions/${decision.id}`}
              className="block rounded-lg border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs text-text-muted">
                  {decision.reference}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {decision.decisionType}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-text mb-1">
                {decision.title}
              </h2>
              <p className="text-sm text-text-secondary mb-3">
                {decision.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{decision.ministry}</span>
                <span>Published {decision.publishedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-text-muted">
        Showing {filtered.length} published decisions
      </p>
    </div>
  );
}
