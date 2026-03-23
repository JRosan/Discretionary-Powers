"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  XCircle,
  Loader2,
} from "lucide-react";

interface RevenueData {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  byPlan: Record<string, number>;
  recentPayments: {
    id: string;
    organizationId: string;
    tenantName: string | null;
    reference: string | null;
    status: string;
    amount: number;
    currency: string;
    paymentMethod: string | null;
    receiptNumber: string | null;
    createdAt: string;
    paidAt: string | null;
  }[];
  cancelledThisMonth: number;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.superAdmin.getRevenue();
        setData(result as unknown as RevenueData);
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
        Failed to load revenue data.
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

  const statusColors: Record<string, string> = {
    approved: "bg-accent/10 text-accent",
    pending: "bg-warning/10 text-warning-dark",
    rejected: "bg-error/10 text-error",
    expired: "bg-surface text-text-muted",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Revenue & Billing</h1>
        <p className="text-text-muted text-sm mt-1">
          Platform revenue overview and payment history
        </p>
      </div>

      {/* Revenue stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{formatCurrency(data.mrr)}</p>
              <p className="text-xs text-text-muted">Monthly Recurring Revenue</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{formatCurrency(data.arr)}</p>
              <p className="text-xs text-text-muted">Annual Recurring Revenue</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data.activeSubscriptions}</p>
              <p className="text-xs text-text-muted">Active Subscriptions</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
              <XCircle className="h-5 w-5 text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data.cancelledThisMonth}</p>
              <p className="text-xs text-text-muted">Cancelled This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions by Plan */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold text-text mb-4">Active Subscriptions by Plan</h2>
        {Object.keys(data.byPlan).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["starter", "professional", "enterprise"].map((plan) => {
              const count = data.byPlan[plan] ?? 0;
              const planLabels: Record<string, string> = {
                starter: "Government Starter",
                professional: "Government Professional",
                enterprise: "Government Enterprise",
              };
              const planPrices: Record<string, string> = {
                starter: "$3,333/mo",
                professional: "$7,083/mo",
                enterprise: "$16,667/mo",
              };
              return (
                <div key={plan} className="rounded-md border border-border p-4 text-center">
                  <p className="text-sm font-medium text-text">{planLabels[plan]}</p>
                  <p className="text-3xl font-bold text-text mt-2">{count}</p>
                  <p className="text-xs text-text-muted mt-1">{planPrices[plan]}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No active subscriptions.</p>
        )}
      </div>

      {/* Revenue Trend Placeholder */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h2 className="text-sm font-semibold text-text mb-2">Revenue Trend</h2>
        <div className="flex items-center justify-center py-8 text-text-muted text-sm">
          <p>Revenue trend chart will be available when historical data has been collected.</p>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-2 text-left font-medium text-text-muted">Tenant</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Reference</th>
                <th className="px-4 py-2 text-right font-medium text-text-muted">Amount</th>
                <th className="px-4 py-2 text-center font-medium text-text-muted">Status</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Method</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-2 font-medium text-text">
                    {payment.tenantName ?? "Unknown"}
                  </td>
                  <td className="px-4 py-2 text-text-muted font-mono text-xs">
                    {payment.reference ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-text">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[payment.status] ?? "bg-surface text-text-muted"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs capitalize">
                    {payment.paymentMethod ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-text-muted text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.recentPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
