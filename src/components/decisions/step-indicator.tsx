"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DECISION_STEPS } from "@/lib/constants";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start">
        {DECISION_STEPS.map((stepDef, index) => {
          const step = index + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border-2 transition-all",
                    isCompleted &&
                      "bg-accent border-accent text-white",
                    isCurrent &&
                      "border-accent text-accent animate-pulse",
                    isUpcoming &&
                      "border-border text-text-muted bg-surface"
                  )}
                >
                  {step}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-center text-[10px] leading-tight",
                    isCompleted && "text-accent font-medium",
                    isCurrent && "text-accent font-medium",
                    isUpcoming && "text-text-muted"
                  )}
                >
                  {stepDef.name}
                </span>
              </div>
              {step < 10 && (
                <div
                  className={cn(
                    "mt-4 h-0.5 flex-1 -mx-1",
                    isCompleted ? "bg-accent" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 md:hidden">
        {DECISION_STEPS.map((stepDef, index) => {
          const step = index + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2",
                    isCompleted &&
                      "bg-accent border-accent text-white",
                    isCurrent &&
                      "border-accent text-accent animate-pulse",
                    isUpcoming &&
                      "border-border text-text-muted bg-surface"
                  )}
                >
                  {step}
                </div>
                {step < 10 && (
                  <div
                    className={cn(
                      "w-0.5 h-6",
                      isCompleted ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-sm pt-1",
                  isCompleted && "text-accent font-medium",
                  isCurrent && "text-accent font-medium",
                  isUpcoming && "text-text-muted"
                )}
              >
                {stepDef.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
