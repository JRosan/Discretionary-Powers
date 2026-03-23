"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CreditCard,
  FileText,
  Users,
  HardDrive,
  Loader2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api, ApiBillingPlan, ApiBillingSubscription, ApiPaymentRecord } from "@/lib/api";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-accent/10 text-accent",
  },
  trialing: {
    label: "Trial",
    className: "bg-blue-100 text-blue-700",
  },
  past_due: {
    label: "Past Due",
    className: "bg-warning/10 text-warning",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-error/10 text-error",
  },
  none: {
    label: "No Plan",
    className: "bg-surface text-text-muted",
  },
};

const PAYMENT_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  approved: { label: "Paid", className: "text-accent" },
  pending: { label: "Pending", className: "text-warning" },
  rejected: { label: "Rejected", className: "text-error" },
  expired: { label: "Expired", className: "text-text-muted" },
};

export default function BillingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const isPermanentSecretary = user?.role === "permanent_secretary";

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: () => api.billing.getSubscription(),
    enabled: isPermanentSecretary,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => api.billing.getPlans(),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: () => api.billing.getInvoices(),
    enabled: isPermanentSecretary,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.billing.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  if (!isPermanentSecretary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">Access Denied</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const result = await api.billing.checkout(planId);
      if (result.processUrl) {
        window.location.href = result.processUrl;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutLoading(null);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You will retain access until the end of the current billing period.",
      )
    ) {
      cancelMutation.mutate();
    }
  };

  const currentPlan = subscription?.plan;
  const badge = STATUS_BADGES[subscription?.status ?? "none"] ?? STATUS_BADGES.none;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Billing</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscription...
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">
                  {currentPlan
                    ? plans?.find((p) => p.id === currentPlan)?.name ?? currentPlan
                    : "No active plan"}
                </h3>
                {subscription?.monthlyPrice !== undefined &&
                  subscription.monthlyPrice > 0 && (
                    <p className="mt-1 text-sm text-text-secondary">
                      ${subscription.monthlyPrice}/{subscription.currency ?? "USD"} per month
                    </p>
                  )}
                {subscription?.currentPeriodEnd && (
                  <p className="mt-1 text-xs text-text-muted">
                    Current period ends:{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          )}
          {subscription?.status === "active" && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Available Plans</h2>
        {plansLoading ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading plans...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans?.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isUpgrade =
                currentPlan &&
                plans.findIndex((p) => p.id === currentPlan) <
                  plans.findIndex((p) => p.id === plan.id);

              return (
                <Card
                  key={plan.id}
                  className={isCurrent ? "ring-2 ring-accent" : ""}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-text-muted">
                        /{plan.currency}/mo
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-text"
                        >
                          <Check className="h-4 w-4 text-accent shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading !== null}
                      >
                        {checkoutLoading === plan.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting...
                          </>
                        ) : isUpgrade ? (
                          "Upgrade"
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Users</p>
                <p className="text-xl font-semibold text-text">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Decisions</p>
                <p className="text-xl font-semibold text-text">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <HardDrive className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Storage Used</p>
                <p className="text-xl font-semibold text-text">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
          <CardDescription>Past invoices and payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading invoices...
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-lg bg-surface p-3 mb-3">
                <CreditCard className="h-8 w-8 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text">No invoices yet</p>
              <p className="mt-1 text-xs text-text-muted">
                Invoices will appear here once you subscribe to a plan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="pb-2 pr-4 font-medium">Reference</th>
                    <th className="pb-2 pr-4 font-medium">Amount</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const ps =
                      PAYMENT_STATUS_BADGES[inv.status] ??
                      PAYMENT_STATUS_BADGES.pending;
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3 pr-4 font-mono text-xs">
                          {inv.reference ?? "--"}
                        </td>
                        <td className="py-3 pr-4">
                          ${inv.amount.toFixed(2)} {inv.currency}
                        </td>
                        <td className={`py-3 pr-4 font-medium ${ps.className}`}>
                          {ps.label}
                        </td>
                        <td className="py-3 pr-4 text-text-muted">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-text-muted">
                          {inv.paidAt
                            ? new Date(inv.paidAt).toLocaleDateString()
                            : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
