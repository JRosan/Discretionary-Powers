"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/common/loading-skeleton";
import { DECISION_STEPS } from "@/lib/constants";
import { api } from "@/lib/api";
import { useTranslations } from "@/i18n";

const StatusChart = dynamic(
  () => import("@/components/dashboard/status-chart").then((m) => ({ default: m.StatusChart })),
  { ssr: false, loading: () => <SkeletonChart /> },
);
const MinistryChart = dynamic(
  () => import("@/components/dashboard/ministry-chart").then((m) => ({ default: m.MinistryChart })),
  { ssr: false, loading: () => <SkeletonChart /> },
);
const TimelineChart = dynamic(
  () => import("@/components/dashboard/timeline-chart").then((m) => ({ default: m.TimelineChart })),
  { ssr: false, loading: () => <SkeletonChart /> },
);
const StepBottleneckChart = dynamic(
  () => import("@/components/dashboard/step-bottleneck-chart").then((m) => ({ default: m.StepBottleneckChart })),
  { ssr: false, loading: () => <SkeletonChart /> },
);

interface DashboardResponse {
  total: number;
  overdueCount: number;
  byStatus: Record<string, number>;
  byMinistry: { name: string; count: number }[];
  overTime: { month: string; count: number }[];
  stepTimes: { step: number; avgDays: number }[];
}

function computeDateRange(dateRange: string): { from?: string; to?: string } {
  const now = new Date();
  const toStr = now.toISOString();
  if (dateRange === "this_month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString(), to: toStr };
  }
  if (dateRange === "this_quarter") {
    const quarterStart = Math.floor(now.getMonth() / 3) * 3;
    const from = new Date(now.getFullYear(), quarterStart, 1);
    return { from: from.toISOString(), to: toStr };
  }
  if (dateRange === "this_year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: from.toISOString(), to: toStr };
  }
  // all_time
  return {};
}

// ── Component ────────────────────────────────────────────────────────

export default function ReportsPage() {
  const t = useTranslations("reports");
  const [dateRange, setDateRange] = useState("this_quarter");

  const dateParams = useMemo(() => computeDateRange(dateRange), [dateRange]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["reports", "dashboard", dateParams],
    queryFn: () => api.reports.getDashboard(dateParams as Record<string, unknown>) as unknown as Promise<DashboardResponse>,
    staleTime: 5 * 60 * 1000,
  });

  // Derive display data from API response
  const byStatus = dashboard?.byStatus ?? {};
  const publishedCount = byStatus["Published"] ?? byStatus["published"] ?? 0;
  const totalDecisions = dashboard?.total ?? 0;

  // Map step times from API into chart format
  const stepTimesMap = new Map(
    (dashboard?.stepTimes ?? []).map((s) => [s.step, s.avgDays]),
  );
  const stepBottlenecks = DECISION_STEPS.map((step) => ({
    step: `${step.number}. ${step.name}`,
    avgDays: stepTimesMap.get(step.number) ?? 0,
  }));

  // Map step times into table format
  const stepTable = DECISION_STEPS.map((step) => ({
    step,
    avgDays: stepTimesMap.get(step.number) ?? 0,
  }));

  // Format timeline months for display (2026-03 -> Mar 2026)
  const timeline = (dashboard?.overTime ?? []).map((item) => {
    const [year, month] = item.month.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return { month: label, count: item.count };
  });

  // Compute average completion days from step times
  const avgCompletionDays =
    dashboard?.stepTimes && dashboard.stepTimes.length > 0
      ? Math.round(dashboard.stepTimes.reduce((sum, s) => sum + s.avgDays, 0))
      : 0;

  const handleExport = (format: "csv" | "json") => {
    const blob = new Blob(
      [JSON.stringify(dashboard, null, 2)],
      { type: format === "json" ? "application/json" : "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${dateRange}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: t("totalDecisions"),
      value: isLoading ? "--" : totalDecisions,
      icon: FileText,
      color: "text-primary",
    },
    {
      label: t("avgCompletion"),
      value: isLoading ? "--" : `${avgCompletionDays} days`,
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Published",
      value: isLoading ? "--" : publishedCount,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: t("overdue"),
      value: isLoading ? "--" : (dashboard?.overdueCount ?? 0),
      icon: AlertTriangle,
      color: "text-error",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-text-muted" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">{t("thisMonth")}</SelectItem>
                <SelectItem value="this_quarter">{t("thisQuarter")}</SelectItem>
                <SelectItem value="this_year">{t("thisYear")}</SelectItem>
                <SelectItem value="all_time">{t("allTime")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={isLoading}>
              <Download className="h-4 w-4" />
              {t("exportCsv")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={isLoading}>
              <Download className="h-4 w-4" />
              {t("exportJson")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="ministry">{t("byMinistry")}</TabsTrigger>
          <TabsTrigger value="workflow">{t("workflowAnalysis")}</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ─────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary">{stat.label}</p>
                          <p className="mt-1 text-2xl font-bold text-text">
                            {stat.value}
                          </p>
                        </div>
                        <Icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Decisions by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <SkeletonChart /> : <StatusChart data={byStatus} />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Decisions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <SkeletonChart /> : <TimelineChart data={timeline} />}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── By Ministry Tab ──────────────────────────────────── */}
        <TabsContent value="ministry">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Decisions by Ministry</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonChart />
                ) : (
                  <MinistryChart data={dashboard?.byMinistry ?? []} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ministry Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 pr-4 font-medium text-text-secondary">Ministry</th>
                        <th className="pb-3 pl-4 font-medium text-text-secondary text-right">Decisions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard?.byMinistry ?? []).map((row) => (
                        <tr key={row.name} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 font-medium text-text">{row.name}</td>
                          <td className="py-3 pl-4 text-right text-text">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Workflow Analysis Tab ────────────────────────────── */}
        <TabsContent value="workflow">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Time per Step</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <SkeletonChart />
                ) : (
                  <StepBottleneckChart data={stepBottlenecks} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Step Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 pr-4 font-medium text-text-secondary">Step</th>
                        <th className="pb-3 pl-4 font-medium text-text-secondary text-right">Avg. Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stepTable.map((row) => (
                        <tr
                          key={row.step.number}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {row.step.number}
                              </span>
                              <span className="font-medium text-text">{row.step.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <span
                              className={
                                row.avgDays >= 4
                                  ? "font-semibold text-error"
                                  : row.avgDays >= 3
                                    ? "font-medium text-warning-dark"
                                    : "text-text"
                              }
                            >
                              {row.avgDays > 0 ? `${row.avgDays} days` : "No data"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
