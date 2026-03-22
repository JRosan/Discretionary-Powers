"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Total Decisions",
    value: "47",
    icon: FileText,
    change: "+3 this week",
  },
  {
    label: "In Progress",
    value: "12",
    icon: Clock,
    change: "5 assigned to you",
  },
  {
    label: "Completed",
    value: "28",
    icon: CheckCircle2,
    change: "4 this month",
  },
  {
    label: "Overdue",
    value: "3",
    icon: AlertTriangle,
    change: "Needs attention",
    alert: true,
  },
];

const recentDecisions = [
  {
    id: "1",
    referenceNumber: "DP-2026-001",
    title: "Telecommunications Licence Renewal — BVI Telecom",
    status: "Under Review",
    statusVariant: "accent" as const,
    currentStep: 6,
    assignedTo: "Jane Smith",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    referenceNumber: "DP-2026-002",
    title: "Road Town Harbour Development Permit",
    status: "In Progress",
    statusVariant: "default" as const,
    currentStep: 3,
    assignedTo: "John Doe",
    updatedAt: "5 hours ago",
  },
  {
    id: "3",
    referenceNumber: "DP-2026-003",
    title: "Financial Services Regulatory Amendment",
    status: "Draft",
    statusVariant: "outline" as const,
    currentStep: 1,
    assignedTo: "Mary Johnson",
    updatedAt: "1 day ago",
  },
  {
    id: "4",
    referenceNumber: "DP-2025-045",
    title: "Environmental Impact Assessment — West End",
    status: "Approved",
    statusVariant: "success" as const,
    currentStep: 10,
    assignedTo: "Robert Williams",
    updatedAt: "2 days ago",
  },
];

const overdueItems = [
  {
    id: "5",
    referenceNumber: "DP-2025-039",
    title: "Public School Zoning Reclassification",
    deadline: "Mar 15, 2026",
    daysOverdue: 7,
    assignedTo: "Jane Smith",
  },
  {
    id: "6",
    referenceNumber: "DP-2025-041",
    title: "Customs Duty Exemption — Hurricane Relief Materials",
    deadline: "Mar 18, 2026",
    daysOverdue: 4,
    assignedTo: "John Doe",
  },
  {
    id: "7",
    referenceNumber: "DP-2025-044",
    title: "Crown Land Lease Renewal — East End",
    deadline: "Mar 20, 2026",
    daysOverdue: 2,
    assignedTo: "Mary Johnson",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Overview of discretionary powers activity
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/decisions/new">
            <Plus className="h-4 w-4" />
            New Decision
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-text">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      stat.alert ? "bg-error/10 text-error" : "bg-accent/10 text-accent"
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent decisions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Decisions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/decisions">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
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
                      <Badge variant={decision.statusVariant}>
                        {decision.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-text">
                      {decision.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>Step {decision.currentStep}/10</span>
                      <span>{decision.assignedTo}</span>
                      <span>{decision.updatedAt}</span>
                    </div>
                  </div>
                  <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-text-muted" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-error" />
              Overdue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/decisions/${item.id}`}
                  className="block rounded-md border border-error/20 bg-error/5 p-3 transition-colors hover:bg-error/10"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs text-text-secondary">
                      {item.referenceNumber}
                    </span>
                    <Badge variant="error">
                      {item.daysOverdue}d overdue
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium text-text">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span>Due: {item.deadline}</span>
                    <span>{item.assignedTo}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
