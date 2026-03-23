"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api, ApiBillingPlan } from "@/lib/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ManagePlanPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState<string | null>(null);
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

  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => api.billing.upgrade(planId),
    onSuccess: (data) => {
      if (data.processUrl) {
        window.location.href = data.processUrl;
      }
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onSettled: () => setActionLoading(null),
  });

  const downgradeMutation = useMutation({
    mutationFn: (planId: string) => api.billing.downgrade(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      setShowDowngradeConfirm(null);
    },
    onSettled: () => setActionLoading(null),
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

  const currentPlan = subscription?.plan;
  const planHierarchy = ["starter", "professional", "enterprise"];

  const handleUpgrade = (planId: string) => {
    if (planId === "enterprise") {
      window.location.href =
        "mailto:sales@govdecision.com?subject=Enterprise Plan Inquiry";
      return;
    }
    setActionLoading(planId);
    upgradeMutation.mutate(planId);
  };

  const handleDowngrade = (planId: string) => {
    setActionLoading(planId);
    downgradeMutation.mutate(planId);
  };

  const getPlanRelation = (
    planId: string,
  ): "current" | "upgrade" | "downgrade" | null => {
    if (!currentPlan) return null;
    if (planId === currentPlan) return "current";
    const currentIdx = planHierarchy.indexOf(currentPlan);
    const targetIdx = planHierarchy.indexOf(planId);
    if (targetIdx > currentIdx) return "upgrade";
    if (targetIdx < currentIdx) return "downgrade";
    return null;
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Manage Plan</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Upgrade or change your subscription plan
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/billing">
            <Button variant="outline">Back to Billing</Button>
          </Link>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 border-b border-border pb-2">
        <Link
          href="/admin/billing"
          className="text-sm text-text-secondary hover:text-accent transition-colors pb-2"
        >
          Overview
        </Link>
        <Link
          href="/admin/billing/manage"
          className="text-sm font-medium text-accent border-b-2 border-accent pb-2"
        >
          Manage Plan
        </Link>
        <Link
          href="/admin/billing/payment-method"
          className="text-sm text-text-secondary hover:text-accent transition-colors pb-2"
        >
          Payment Method
        </Link>
      </div>

      {subLoading || plansLoading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans?.map((plan: ApiBillingPlan) => {
            const relation = getPlanRelation(plan.id);
            const isCurrent = relation === "current";
            const isUpgrade = relation === "upgrade";
            const isDowngrade = relation === "downgrade";
            const isEnterprise = plan.id === "enterprise";

            return (
              <Card
                key={plan.id}
                className={
                  isCurrent ? "ring-2 ring-accent relative" : "relative"
                }
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                      Current Plan
                    </span>
                  </div>
                )}
                <CardHeader className="pt-6">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="mt-2">
                    {isEnterprise ? (
                      <span className="text-2xl font-bold text-text">
                        Custom Pricing
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-text">
                          {formatCurrency(plan.annualPrice)}
                        </span>
                        <span className="text-sm text-text-muted">/year</span>
                        <p className="text-xs text-text-muted mt-1">
                          {formatCurrency(plan.price)}/mo equivalent
                        </p>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                    <span>
                      {plan.userLimit < 0
                        ? "Unlimited"
                        : `${plan.userLimit}`}{" "}
                      users
                    </span>
                    <span>{plan.storageGb}GB storage</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-text"
                      >
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.restrictions.length > 0 && (
                    <ul className="space-y-1 mb-6">
                      {plan.restrictions.map((r: string) => (
                        <li
                          key={r}
                          className="flex items-center gap-2 text-xs text-text-muted"
                        >
                          <X className="h-3 w-3 text-error shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {plan.restrictions.length === 0 && <div className="mb-6" />}

                  {isCurrent ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowUp className="mr-2 h-4 w-4" />
                          Upgrade
                        </>
                      )}
                    </Button>
                  ) : isDowngrade ? (
                    <>
                      {showDowngradeConfirm === plan.id ? (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-warning/10 border border-warning/30 p-3">
                            <p className="text-xs text-text-secondary">
                              Downgrading will take effect at the end of your
                              current billing period. You may lose access to
                              features not available on this plan.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowDowngradeConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 bg-warning text-white hover:bg-warning/90"
                              onClick={() => handleDowngrade(plan.id)}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === plan.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowDowngradeConfirm(plan.id)}
                          disabled={actionLoading !== null}
                        >
                          <ArrowDown className="mr-2 h-4 w-4" />
                          Downgrade
                        </Button>
                      )}
                    </>
                  ) : isEnterprise ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={actionLoading !== null}
                    >
                      Select Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
