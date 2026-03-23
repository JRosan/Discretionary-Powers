"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: "professional" | "enterprise";
}

const PLAN_LABELS: Record<string, string> = {
  professional: "Professional",
  enterprise: "Enterprise",
};

export function UpgradePrompt({ feature, requiredPlan }: UpgradePromptProps) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-warning/10 p-3 mb-4">
          <Lock className="h-8 w-8 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-text">
          This feature requires the {PLAN_LABELS[requiredPlan]} plan
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md">
          Upgrade your plan to access {feature}. Contact your administrator or
          visit the billing page to manage your subscription.
        </p>
        <Link href="/admin/billing" className="mt-6">
          <Button>View Plans & Upgrade</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
