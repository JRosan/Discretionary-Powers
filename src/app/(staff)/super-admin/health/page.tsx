"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  HardDrive,
  Mail,
  CreditCard,
  Activity,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface HealthData {
  status: string;
  uptime: string;
  database: {
    status: string;
    responseMs: number;
    tableCount: number;
  };
  storage: {
    status: string;
    endpoint: string;
  };
  email: {
    provider: string;
    configured: boolean;
  };
  payments: {
    provider: string;
    configured: boolean;
  };
  metrics: {
    apiRequestsToday: number;
    errorRate: number;
    activeUsers24h: number;
  };
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getDetailedHealth();
        setData(result as unknown as HealthData);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-text-muted">
        Failed to load health data.
      </div>
    );
  }

  const isHealthy = data.status === "healthy";

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? (
      <CheckCircle2 className="h-5 w-5 text-accent" />
    ) : (
      <XCircle className="h-5 w-5 text-error" />
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">System Health</h1>
        <p className="text-text-muted text-sm mt-1">
          Infrastructure monitoring and service status
        </p>
      </div>

      {/* Overall Status Banner */}
      <div
        className={`rounded-lg border px-5 py-4 flex items-center gap-3 ${
          isHealthy
            ? "border-accent/30 bg-accent/5"
            : "border-error/30 bg-error/5"
        }`}
      >
        {isHealthy ? (
          <CheckCircle2 className="h-6 w-6 text-accent" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-error" />
        )}
        <div>
          <p className={`text-sm font-semibold ${isHealthy ? "text-accent" : "text-error"}`}>
            {isHealthy ? "All Systems Operational" : "System Degraded"}
          </p>
          <p className="text-xs text-text-muted">
            Uptime: {data.uptime}
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <Database className="h-5 w-5 text-text-muted" />
            <StatusIcon ok={data.database.status === "connected"} />
          </div>
          <h3 className="text-sm font-semibold text-text">Database</h3>
          <p className="text-xs text-text-muted mt-1">
            {data.database.status === "connected" ? "Connected" : "Disconnected"}
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Response Time</span>
              <span className="font-mono text-text">{data.database.responseMs}ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Tables</span>
              <span className="font-mono text-text">{data.database.tableCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <HardDrive className="h-5 w-5 text-text-muted" />
            <StatusIcon ok={data.storage.status === "configured"} />
          </div>
          <h3 className="text-sm font-semibold text-text">Storage (MinIO)</h3>
          <p className="text-xs text-text-muted mt-1">
            {data.storage.status === "configured" ? "Configured" : "Not Configured"}
          </p>
          {data.storage.endpoint && (
            <p className="text-xs text-text-muted mt-2 font-mono truncate" title={data.storage.endpoint}>
              {data.storage.endpoint}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <Mail className="h-5 w-5 text-text-muted" />
            <StatusIcon ok={data.email.configured} />
          </div>
          <h3 className="text-sm font-semibold text-text">Email</h3>
          <p className="text-xs text-text-muted mt-1">
            {data.email.provider} - {data.email.configured ? "Configured" : "Not Configured"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="h-5 w-5 text-text-muted" />
            <StatusIcon ok={data.payments.configured} />
          </div>
          <h3 className="text-sm font-semibold text-text">Payments</h3>
          <p className="text-xs text-text-muted mt-1">
            {data.payments.provider} - {data.payments.configured ? "Configured" : "Not Configured"}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold text-text mb-4">Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{data.metrics.apiRequestsToday}</p>
              <p className="text-xs text-text-muted">Login Events Today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{data.metrics.errorRate}%</p>
              <p className="text-xs text-text-muted">Login Failure Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-text">{data.metrics.activeUsers24h}</p>
              <p className="text-xs text-text-muted">Active Users (24h)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-text-muted" />
          <div>
            <p className="text-sm font-semibold text-text">Process Uptime</p>
            <p className="text-xs text-text-muted">{data.uptime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
