"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { queryConfig } from "@/lib/query-config";
import { useTranslations } from "@/i18n";

const statusVariantMap: Record<string, "default" | "accent" | "warning" | "error" | "success" | "outline"> = {
  draft: "outline",
  in_progress: "default",
  under_review: "accent",
  approved: "success",
  published: "accent",
  challenged: "error",
  withdrawn: "outline",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  const statsQuery = useQuery({
    queryKey: ["decision-stats"],
    queryFn: () => api.decisions.getStats(),
    placeholderData: { total: 0, byStatus: {} },
    ...queryConfig.stats,
  });

  const recentQuery = useQuery({
    queryKey: ["decisions", "recent"],
    queryFn: () => api.decisions.list({ limit: 5 }),
    placeholderData: { items: [], hasMore: false, nextCursor: null },
    ...queryConfig.decisions,
  });

  const stats = statsQuery.data;
  const recentDecisions = recentQuery.data?.items ?? [];

  const statCards = [
    {
      label: t('totalDecisions'),
      value: String(stats?.total ?? 0),
      icon: FileText,
      change: `${stats?.byStatus?.["published"] ?? 0} published`,
    },
    {
      label: t('inProgress'),
      value: String(stats?.byStatus?.["in_progress"] ?? 0),
      icon: Clock,
      change: `${stats?.byStatus?.["draft"] ?? 0} drafts`,
    },
    {
      label: t('completed'),
      value: String((stats?.byStatus?.["approved"] ?? 0) + (stats?.byStatus?.["published"] ?? 0)),
      icon: CheckCircle2,
      change: `${stats?.byStatus?.["under_review"] ?? 0} under review`,
    },
    {
      label: t('overdue'),
      value: String(stats?.byStatus?.["challenged"] ?? 0),
      icon: AlertTriangle,
      change: stats?.byStatus?.["challenged"] ? "Needs attention" : "None",
      alert: (stats?.byStatus?.["challenged"] ?? 0) > 0,
    },
  ];

  const isLoading = statsQuery.isLoading || recentQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{t('title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('subtitle')}
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/decisions/new">
            <Plus className="h-4 w-4" />
            {t('newDecision')}
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-text">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      stat.alert
                        ? "bg-error/10 text-error"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p
                  className={`mt-2 text-xs ${
                    stat.alert ? "text-error font-medium" : "text-text-muted"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent decisions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t('recentDecisions')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/decisions">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : recentDecisions.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <FileText className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">No decisions yet. Create your first one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDecisions.map((decision) => (
                <Link
                  key={decision.id}
                  href={`/decisions/${decision.id}`}
                  className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">
                        {decision.referenceNumber}
                      </span>
                      <Badge variant={statusVariantMap[decision.status] ?? "outline"}>
                        {formatStatus(decision.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-text">
                      {decision.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>Step {decision.currentStep}/10</span>
                      <span>{decision.createdAt ? timeAgo(decision.createdAt) : ""}</span>
                    </div>
                  </div>
                  <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-text-muted" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
