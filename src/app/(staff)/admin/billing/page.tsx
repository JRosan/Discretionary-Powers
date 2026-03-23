"use client";

import { Check, CreditCard, FileText, Users, Database, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const PLAN_FEATURES = [
  "Up to 50 active users",
  "Unlimited decisions",
  "10 GB document storage",
  "Full audit trail",
  "Email notifications",
  "Standard support",
];

export default function BillingPage() {
  const { user } = useAuth();
  const isPermanentSecretary = user?.role === "permanent_secretary";

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

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Billing</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Government Starter</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Essential features for government decision management
              </p>
              <ul className="mt-4 space-y-2">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                Active
              </span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="outline" disabled title="Contact sales@govdecision.com to upgrade">
              Upgrade Plan
            </Button>
            <p className="mt-2 text-xs text-text-muted">
              Contact sales@govdecision.com to discuss enterprise plans
            </p>
          </div>
        </CardContent>
      </Card>

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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-lg bg-surface p-3 mb-3">
              <CreditCard className="h-8 w-8 text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text">No invoices yet</p>
            <p className="mt-1 text-xs text-text-muted">
              Invoices will appear here once billing is active.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
          <CardDescription>Manage how you pay for your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center">
            <p className="text-sm text-text-secondary">
              Payment methods are managed offline. Contact us to set up or update billing.
            </p>
            <p className="mt-2 text-sm font-medium text-accent">
              sales@govdecision.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
