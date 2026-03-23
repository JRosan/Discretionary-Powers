"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="dashboard"]',
    title: "Dashboard",
    description:
      "Your command center. View stats, recent decisions, approaching deadlines, and quick actions all in one place.",
    position: "right",
  },
  {
    selector: '[data-tour="decisions"]',
    title: "Decisions",
    description:
      "Create and manage discretionary power decisions through the structured 10-step framework.",
    position: "right",
  },
  {
    selector: '[data-tour="reports"]',
    title: "Reports & Analytics",
    description:
      "Track progress with charts, analytics, and bottleneck analysis. Export data for compliance reporting.",
    position: "right",
  },
  {
    selector: '[data-tour="search"]',
    title: "Quick Search",
    description:
      "Find any decision or document instantly. Use Ctrl+K to open the search from anywhere.",
    position: "bottom",
  },
  {
    selector: '[data-tour="notifications"]',
    title: "Notifications",
    description:
      "Stay updated with real-time notifications on deadlines, approvals, and actions required.",
    position: "bottom",
  },
  {
    selector: '[data-tour="admin"]',
    title: "Administration",
    description:
      "Manage users, workflows, branding, and billing from the admin panel. Only visible to administrators.",
    position: "right",
  },
];

const TOUR_STORAGE_KEY = "govdecision_tour_completed";

export function ProductTour() {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isSandboxUser = user?.email?.endsWith("@sandbox.govdecision.com");

  // Auto-start for sandbox users on first visit
  useEffect(() => {
    if (!isSandboxUser) return;
    try {
      if (localStorage.getItem(TOUR_STORAGE_KEY) !== "true") {
        // Small delay to let the page render
        const timer = setTimeout(() => setActive(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* ignore */
    }
  }, [isSandboxUser]);

  // Listen for custom event to restart tour
  useEffect(() => {
    const handler = () => {
      setCurrentStep(0);
      setActive(true);
    };
    window.addEventListener("start-product-tour", handler);
    return () => window.removeEventListener("start-product-tour", handler);
  }, []);

  const findAndPositionTarget = useCallback(() => {
    if (!active) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      // Scroll into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Recalculate after scroll
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 300);
      }
    } else {
      // Skip this step if element not found
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        completeTour();
      }
    }
  }, [active, currentStep]);

  useEffect(() => {
    findAndPositionTarget();
    // Re-position on resize
    window.addEventListener("resize", findAndPositionTarget);
    return () => window.removeEventListener("resize", findAndPositionTarget);
  }, [findAndPositionTarget]);

  const completeTour = () => {
    setActive(false);
    setCurrentStep(0);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  if (!active || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];
  const padding = 8;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 320;
    const tooltipOffset = 12;

    switch (step.position) {
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + tooltipOffset,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - tooltipWidth - tooltipOffset,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: targetRect.bottom + tooltipOffset,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          top: targetRect.top - tooltipOffset,
          left: targetRect.left + targetRect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      default:
        return {
          top: targetRect.bottom + tooltipOffset,
          left: targetRect.left,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Product tour">
      {/* Backdrop with cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - padding}
              y={targetRect.top - padding}
              width={targetRect.width + padding * 2}
              height={targetRect.height + padding * 2}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={handleSkip}
        />
      </svg>

      {/* Highlight border around target */}
      <div
        className="absolute rounded-lg ring-2 ring-accent ring-offset-2 pointer-events-none"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[101] w-80 rounded-xl border border-border bg-white shadow-xl"
        style={getTooltipStyle()}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text">{step.title}</h3>
            <button
              onClick={handleSkip}
              className="text-text-muted hover:text-text transition-colors"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-light transition-colors"
              >
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </>
                ) : (
                  "Done"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1 pb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === currentStep ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Button that triggers the product tour. Place in dashboard header or wherever appropriate. */
export function TakeTourButton() {
  const { user } = useAuth();
  const isSandboxUser = user?.email?.endsWith("@sandbox.govdecision.com");

  if (!isSandboxUser) return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("start-product-tour"))}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:border-accent transition-colors"
    >
      Take Tour
    </button>
  );
}
