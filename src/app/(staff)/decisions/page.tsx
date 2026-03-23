"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import { DECISION_STATUSES, DECISION_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";
import { queryConfig } from "@/lib/query-config";
import { useTranslations } from "@/i18n";

const statusColors: Record<string, string> = {
  draft: "bg-surface text-text-secondary",
  in_progress: "bg-accent/10 text-accent-dark",
  under_review: "bg-warning/20 text-warning-dark",
  approved: "bg-accent/10 text-accent",
  published: "bg-primary/10 text-primary",
  challenged: "bg-error/10 text-error",
  withdrawn: "bg-surface text-text-muted",
};

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DecisionsPage() {
  const t = useTranslations("decisions");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["decisions", "list", searchQuery, statusFilter, typeFilter],
    queryFn: () =>
      api.decisions.list({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        decisionType: typeFilter || undefined,
        limit: 50,
      }),
    ...queryConfig.decisions,
  });

  const decisions = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/decisions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("newDecision")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">{t("allStatuses")}</option>
          {Object.values(DECISION_STATUSES).map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">{t("allTypes")}</option>
          {Object.values(DECISION_TYPES).map((type) => (
            <option key={type} value={type}>
              {formatLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        ) : decisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <FileText className="h-12 w-12 mb-3" />
            <p className="font-medium">{t("noDecisions")}</p>
            <p className="text-sm mt-1">
              {searchQuery || statusFilter || typeFilter
                ? "Try adjusting your search or filters."
                : t("createFirst")}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("reference")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("decisionTitle")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("type")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("status")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("step")}</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("deadline")}</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((decision) => (
                <tr
                  key={decision.id}
                  className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/decisions/${decision.id}`}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {decision.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-text max-w-xs truncate">
                    <Link href={`/decisions/${decision.id}`} className="hover:text-accent">
                      {decision.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatLabel(decision.decisionType)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[decision.status] ?? ""
                      }`}
                    >
                      {formatLabel(decision.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    <span className="font-mono">{decision.currentStep}</span>
                    <span className="text-text-muted">/10</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {decision.deadline
                      ? new Date(decision.deadline).toLocaleDateString()
                      : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-text-muted">
        Showing {decisions.length} decisions
        {data?.hasMore && " (more available)"}
      </p>
    </div>
  );
}
