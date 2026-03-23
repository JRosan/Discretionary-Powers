"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function PaymentMethodPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPermanentSecretary = user?.role === "permanent_secretary";

  const { data: paymentMethod, isLoading } = useQuery({
    queryKey: ["billing", "payment-method"],
    queryFn: () => api.billing.getPaymentMethod(),
    enabled: isPermanentSecretary,
  });

  const updateMutation = useMutation({
    mutationFn: () => api.billing.updatePaymentMethod(),
    onSuccess: (data) => {
      if (data.processUrl) {
        window.location.href = data.processUrl;
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => api.billing.removePaymentMethod(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "payment-method"] });
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

  const handleRemove = () => {
    if (
      window.confirm(
        "Are you sure you want to remove your payment method? You will need to add a new one before your next billing cycle.",
      )
    ) {
      removeMutation.mutate();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Payment Method</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your payment method for subscription billing
          </p>
        </div>
        <Link href="/admin/billing">
          <Button variant="outline">Back to Billing</Button>
        </Link>
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
          className="text-sm text-text-secondary hover:text-accent transition-colors pb-2"
        >
          Manage Plan
        </Link>
        <Link
          href="/admin/billing/payment-method"
          className="text-sm font-medium text-accent border-b-2 border-accent pb-2"
        >
          Payment Method
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Payment Method</CardTitle>
          <CardDescription>
            Your payment method on file for automatic billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-muted py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading payment method...
            </div>
          ) : paymentMethod?.hasPaymentMethod ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">
                    {paymentMethod.cardType ?? "Card"} ending in{" "}
                    {paymentMethod.lastFourDigits ?? "****"}
                  </p>
                  {paymentMethod.expiryDate && (
                    <p className="text-xs text-text-muted">
                      Expires {paymentMethod.expiryDate}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Payment Method
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={removeMutation.isPending}
                  className="text-error hover:text-error"
                >
                  {removeMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-lg bg-surface p-3 mb-3">
                <CreditCard className="h-8 w-8 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text">
                No payment method on file
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Add a payment method to enable automatic billing.
              </p>
              <Button
                className="mt-4"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  "Add Payment Method"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
