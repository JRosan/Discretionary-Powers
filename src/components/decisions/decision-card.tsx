"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface DecisionCardProps {
  id: string;
  referenceNumber: string;
  title: string;
  ministry: string;
  status: string;
  statusVariant?: "default" | "accent" | "warning" | "error" | "success" | "outline";
  currentStep: number;
  totalSteps?: number;
  assignedTo: string;
  deadline: string;
  createdAt: string;
  className?: string;
}

export function DecisionCard({
  id,
  referenceNumber,
  title,
  ministry,
  status,
  statusVariant = "default",
  currentStep,
  totalSteps = 10,
  assignedTo,
  deadline,
  createdAt,
  className,
}: DecisionCardProps) {
  const isOverdue = new Date(deadline) < new Date();

  return (
    <Link href={`/decisions/${id}`}>
      <Card
        className={cn(
          "p-4 transition-shadow hover:shadow-md cursor-pointer",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-text-secondary">
              {referenceNumber}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-text truncate">
              {title}
            </h3>
          </div>
          <Badge variant={statusVariant}>{status}</Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{ministry}</Badge>
          <span className="text-xs text-text-secondary">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {assignedTo}
          </span>
          <span
            className={cn(
              "flex items-center gap-1",
              isOverdue && "text-error font-medium"
            )}
          >
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            {deadline}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {createdAt}
          </span>
        </div>
      </Card>
    </Link>
  );
}
