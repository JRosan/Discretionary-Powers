"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/common/loading-skeleton";
import { DECISION_STEPS } from "@/lib/constants";

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

// ── Mock data (replace with real API calls) ─────────────────────────

const MOCK_STATUS_DATA: Record<string, number> = {
  draft: 8,
  in_progress: 12,
  under_review: 7,
  approved: 5,
  published: 14,
  challenged: 1,
  withdrawn: 0,
};

const MOCK_MINISTRY_DATA = [
  { name: "Ministry of Finance", count: 12 },
  { name: "Ministry of Natural Resources", count: 8 },
  { name: "Ministry of Education", count: 7 },
  { name: "Ministry of Health", count: 6 },
  { name: "Ministry of Communications", count: 5 },
  { name: "Ministry of Labour", count: 5 },
  { name: "Ministry of Trade & Commerce", count: 4 },
];

const MOCK_MINISTRY_BREAKDOWN = [
  { name: "Ministry of Finance", total: 12, draft: 2, inProgress: 3, underReview: 2, approved: 1, published: 4 },
  { name: "Ministry of Natural Resources", total: 8, draft: 1, inProgress: 2, underReview: 1, approved: 1, published: 3 },
  { name: "Ministry of Education", total: 7, draft: 1, inProgress: 1, underReview: 1, approved: 1, published: 3 },
  { name: "Ministry of Health", total: 6, draft: 1, inProgress: 2, underReview: 1, approved: 0, published: 2 },
  { name: "Ministry of Communications", total: 5, draft: 1, inProgress: 1, underReview: 1, approved: 1, published: 1 },
  { name: "Ministry of Labour", total: 5, draft: 1, inProgress: 1, underReview: 0, approved: 1, published: 2 },
  { name: "Ministry of Trade & Commerce", total: 4, draft: 1, inProgress: 1, underReview: 1, approved: 0, published: 1 },
];

const MOCK_TIMELINE_DATA = [
  { month: "Oct 2025", count: 3 },
  { month: "Nov 2025", count: 5 },
  { month: "Dec 2025", count: 4 },
  { month: "Jan 2026", count: 7 },
  { month: "Feb 2026", count: 9 },
  { month: "Mar 2026", count: 6 },
];

const MOCK_STEP_BOTTLENECK_DATA = DECISION_STEPS.map((step) => ({
  step: `${step.number}. ${step.name}`,
  avgDays: [1.2, 1.8, 3.5, 4.2, 2.1, 2.9, 3.8, 2.7, 1.5, 0.9][step.number - 1],
}));

const MOCK_STEP_TABLE_DATA = DECISION_STEPS.map((step) => {
  const avgDays = [1.2, 1.8, 3.5, 4.2, 2.1, 2.9, 3.8, 2.7, 1.5, 0.9][step.number - 1];
  const completionRate = [98, 95, 88, 82, 91, 85, 80, 87, 93, 97][step.number - 1];
  const issues = [
    "Missing delegation letters",
    "Incomplete checklists",
    "Delayed responses from stakeholders",
    "Insufficient supporting evidence",
    "Inconsistent proof standards",
    "Undisclosed conflicts of interest",
    "Late stakeholder consultations",
    "Incomplete merit assessments",
    "Delayed notification to parties",
    "Incomplete record filing",
  ][step.number - 1];
  return { step, avgDays, completionRate, commonIssue: issues };
});

const MOCK_RECENT_ACTIVITY = [
  { id: "1", title: "Coastal Development Permit", status: "published", date: "2 hours ago" },
  { id: "2", title: "Import License Renewal", status: "approved", date: "5 hours ago" },
  { id: "3", title: "Financial Aid Distribution", status: "under_review", date: "1 day ago" },
  { id: "4", title: "Environmental Impact Assessment", status: "in_progress", date: "1 day ago" },
  { id: "5", title: "Teacher Certification Review", status: "draft", date: "2 days ago" },
];

const STATUS_BADGE_VARIANT: Record<string, "default" | "accent" | "warning" | "error" | "success" | "outline"> = {
  draft: "outline",
  in_progress: "accent",
  under_review: "warning",
  approved: "success",
  published: "default",
  challenged: "error",
  withdrawn: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  under_review: "Under Review",
  approved: "Approved",
  published: "Published",
  challenged: "Challenged",
  withdrawn: "Withdrawn",
};

// ── Component ────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("this_quarter");

  const { data: reportData } = useQuery({
    queryKey: ["reports", dateRange],
    queryFn: async () => {
      // TODO: Replace with real API call — api.reports.getDashboard({ dateRange })
      return {
        totalDecisions: 47,
        avgCompletionDays: 18,
        publishedThisMonth: 6,
        overdueCount: 4,
        byStatus: MOCK_STATUS_DATA,
        byMinistry: MOCK_MINISTRY_DATA,
        ministryBreakdown: MOCK_MINISTRY_BREAKDOWN,
        timeline: MOCK_TIMELINE_DATA,
        stepBottlenecks: MOCK_STEP_BOTTLENECK_DATA,
        stepTable: MOCK_STEP_TABLE_DATA,
        recentActivity: MOCK_RECENT_ACTIVITY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleExport = (format: "csv" | "json") => {
    // TODO: Replace with real API call — api.reports.export({ dateRange, format })
    const blob = new Blob(
      [JSON.stringify(reportData, null, 2)],
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
      label: "Total Decisions",
      value: reportData?.totalDecisions ?? "--",
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Avg. Completion Time",
      value: reportData ? `${reportData.avgCompletionDays} days` : "--",
      icon: Clock,
      color: "text-accent",
    },
    {
      label: "Published This Month",
      value: reportData?.publishedThisMonth ?? "--",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Overdue",
      value: reportData?.overdueCount ?? "--",
      icon: AlertTriangle,
      color: "text-error",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Insights and metrics on discretionary powers activity
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
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ministry">By Ministry</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Analysis</TabsTrigger>
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
                  <StatusChart data={reportData?.byStatus ?? {}} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Decisions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <TimelineChart data={reportData?.timeline ?? []} />
                </CardContent>
              </Card>
            </div>

            {/* Recent activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {(reportData?.recentActivity ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-text-muted">{item.date}</p>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[item.status] ?? "outline"}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <MinistryChart data={reportData?.byMinistry ?? []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ministry Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 pr-4 font-medium text-text-secondary">Ministry</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Total</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Draft</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">In Progress</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Under Review</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Approved</th>
                        <th className="pb-3 pl-4 font-medium text-text-secondary text-right">Published</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.ministryBreakdown ?? []).map((row) => (
                        <tr key={row.name} className="border-b border-border last:border-0">
                          <td className="py-3 pr-4 font-medium text-text">{row.name}</td>
                          <td className="py-3 px-4 text-right text-text">{row.total}</td>
                          <td className="py-3 px-4 text-right text-text-secondary">{row.draft}</td>
                          <td className="py-3 px-4 text-right text-text-secondary">{row.inProgress}</td>
                          <td className="py-3 px-4 text-right text-text-secondary">{row.underReview}</td>
                          <td className="py-3 px-4 text-right text-text-secondary">{row.approved}</td>
                          <td className="py-3 pl-4 text-right text-text-secondary">{row.published}</td>
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
                <StepBottleneckChart data={reportData?.stepBottlenecks ?? []} />
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
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Avg. Time</th>
                        <th className="pb-3 px-4 font-medium text-text-secondary text-right">Completion Rate</th>
                        <th className="pb-3 pl-4 font-medium text-text-secondary">Most Common Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.stepTable ?? []).map((row) => (
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
                          <td className="py-3 px-4 text-right">
                            <span
                              className={
                                row.avgDays >= 4
                                  ? "font-semibold text-error"
                                  : row.avgDays >= 3
                                    ? "font-medium text-warning-dark"
                                    : "text-text"
                              }
                            >
                              {row.avgDays} days
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={
                                row.completionRate >= 90
                                  ? "text-accent"
                                  : row.completionRate >= 80
                                    ? "text-warning-dark"
                                    : "text-error"
                              }
                            >
                              {row.completionRate}%
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-text-secondary">
                            {row.commonIssue}
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
