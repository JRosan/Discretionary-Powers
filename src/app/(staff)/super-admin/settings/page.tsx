"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Settings,
  CreditCard,
  Mail,
  Package,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PlatformSettings {
  version: string;
  database: string;
  paymentGateway: {
    provider: string;
    endpoint: string;
    configured: boolean;
  };
  email: {
    provider: string;
    configured: boolean;
  };
  plans: {
    id: string;
    name: string;
    price: number;
    currency: string;
    userLimit: number;
    storageGb: number;
  }[];
}

export default function PlatformSettingsPage() {
  const [data, setData] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getSettings();
        setData(result as unknown as PlatformSettings);
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
        Failed to load platform settings.
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Platform Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Read-only view of platform configuration
        </p>
      </div>

      <div className="rounded-md border border-warning/50 bg-warning/5 px-4 py-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-warning-dark mt-0.5 shrink-0" />
          <p className="text-sm text-warning-dark">
            Platform configuration is managed via environment variables and appsettings.json.
            Changes require a server restart.
          </p>
        </div>
      </div>

      {/* Platform Info */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text">Platform Info</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Version</p>
            <p className="text-sm font-mono text-text">{data.version}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Database Connection</p>
            <div className="flex items-center gap-1.5">
              {data.database === "connected" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-sm text-error font-medium">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text">Payment Gateway</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Provider</p>
            <p className="text-sm text-text">{data.paymentGateway.provider}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Endpoint</p>
            <p className="text-sm font-mono text-text truncate" title={data.paymentGateway.endpoint}>
              {data.paymentGateway.endpoint || "Not configured"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-1.5">
              {data.paymentGateway.configured ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-medium">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-sm text-error font-medium">Not Configured</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text">Email Configuration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Provider</p>
            <p className="text-sm text-text">{data.email.provider}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-1.5">
              {data.email.configured ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-sm text-accent font-medium">Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-sm text-error font-medium">Not Configured</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Default Plans */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text">Default Plans</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.plans.map((plan) => (
            <div key={plan.id} className="rounded-md border border-border p-4">
              <p className="text-sm font-semibold text-text">{plan.name}</p>
              <p className="text-2xl font-bold text-text mt-2">
                {formatCurrency(plan.price)}
                <span className="text-xs font-normal text-text-muted">/mo</span>
              </p>
              <div className="mt-3 space-y-1 text-xs text-text-muted">
                <p>Users: {plan.userLimit === -1 ? "Unlimited" : plan.userLimit}</p>
                <p>Storage: {plan.storageGb} GB</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
