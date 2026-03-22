"use client";

import {
  BarChart3,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SUMMARY_STATS = [
  { label: "Total Decisions", value: 47, icon: FileText, color: "text-primary" },
  { label: "Avg. Completion Time", value: "18 days", icon: Clock, color: "text-accent" },
  { label: "Completion Rate", value: "89%", icon: CheckCircle2, color: "text-success" },
  { label: "Overdue Rate", value: "8.5%", icon: AlertTriangle, color: "text-error" },
];

const MINISTRY_DATA = [
  { name: "Ministry of Finance", total: 12, completed: 9, inProgress: 2, overdue: 1 },
  { name: "Ministry of Natural Resources", total: 8, completed: 5, inProgress: 2, overdue: 1 },
  { name: "Ministry of Education", total: 7, completed: 6, inProgress: 1, overdue: 0 },
  { name: "Ministry of Health", total: 6, completed: 4, inProgress: 1, overdue: 1 },
  { name: "Ministry of Communications", total: 5, completed: 3, inProgress: 2, overdue: 0 },
  { name: "Ministry of Labour", total: 5, completed: 4, inProgress: 1, overdue: 0 },
  { name: "Ministry of Trade & Commerce", total: 4, completed: 2, inProgress: 1, overdue: 1 },
];

const STEP_BOTTLENECKS = [
  { step: 4, name: "Evaluate Evidence", avgDays: 4.2, decisions: 6 },
  { step: 7, name: "Ensure Procedural Fairness", avgDays: 3.8, decisions: 4 },
  { step: 3, name: "Gather Information", avgDays: 3.5, decisions: 5 },
  { step: 6, name: "Act Fairly Without Bias", avgDays: 2.9, decisions: 3 },
  { step: 8, name: "Consider Merits", avgDays: 2.7, decisions: 4 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Reports</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Analytics and insights on discretionary powers activity
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_STATS.map((stat) => {
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ministry breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Decisions by Ministry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MINISTRY_DATA.map((m) => {
                const pct = Math.round((m.completed / m.total) * 100);
                return (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text">{m.name}</span>
                      <span className="text-xs text-text-muted">
                        {m.completed}/{m.total} completed
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-text-muted">
                      <span>{m.inProgress} in progress</span>
                      {m.overdue > 0 && (
                        <span className="text-error">{m.overdue} overdue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step bottlenecks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Workflow Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-muted mb-4">
              Steps where decisions spend the most time
            </p>
            <div className="space-y-4">
              {STEP_BOTTLENECKS.map((b) => (
                <div key={b.step} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {b.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{b.name}</p>
                    <p className="text-xs text-text-muted">
                      {b.decisions} decisions currently at this step
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text">
                      {b.avgDays} days
                    </p>
                    <p className="text-xs text-text-muted">avg. duration</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
