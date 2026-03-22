import { DECISION_STEPS, DECISION_STATUSES } from "@/lib/constants";

export type StepStatus = "not_started" | "in_progress" | "completed" | "skipped_with_reason";
export type DecisionStatus = (typeof DECISION_STATUSES)[keyof typeof DECISION_STATUSES];

export interface WorkflowState {
  currentStep: number;
  decisionStatus: DecisionStatus;
  stepStatuses: Record<number, StepStatus>;
}

export interface StepTransition {
  stepNumber: number;
  action: "start" | "complete" | "skip";
  skipReason?: string;
}

/**
 * 10-step workflow state machine for the BVI discretionary powers framework.
 *
 * Rules:
 * - Steps must be completed in order (1 through 10)
 * - A step cannot be started until the previous step is completed
 * - Steps can be skipped only with a documented reason
 * - The decision moves to "under_review" when all steps are completed
 * - The decision must be explicitly approved and published
 */
export const workflowMachine = {
  /**
   * Initialize a new workflow state for a freshly created decision.
   */
  createInitialState(): WorkflowState {
    const stepStatuses: Record<number, StepStatus> = {};
    for (const step of DECISION_STEPS) {
      stepStatuses[step.number] = "not_started";
    }
    return {
      currentStep: 1,
      decisionStatus: "draft",
      stepStatuses,
    };
  },

  /**
   * Validate whether a step transition is allowed.
   */
  canTransition(state: WorkflowState, transition: StepTransition): { allowed: boolean; reason?: string } {
    const { stepNumber, action } = transition;

    // Validate step number
    if (stepNumber < 1 || stepNumber > 10) {
      return { allowed: false, reason: "Step number must be between 1 and 10." };
    }

    // Cannot modify steps if decision is already published or withdrawn
    if (state.decisionStatus === "published" || state.decisionStatus === "withdrawn") {
      return { allowed: false, reason: `Cannot modify steps when decision is ${state.decisionStatus}.` };
    }

    const currentStatus = state.stepStatuses[stepNumber];

    if (action === "start") {
      if (currentStatus !== "not_started") {
        return { allowed: false, reason: `Step ${stepNumber} is already ${currentStatus}.` };
      }
      // Check that all previous steps are completed or skipped
      for (let i = 1; i < stepNumber; i++) {
        const prevStatus = state.stepStatuses[i];
        if (prevStatus !== "completed" && prevStatus !== "skipped_with_reason") {
          return { allowed: false, reason: `Step ${i} must be completed before starting step ${stepNumber}.` };
        }
      }
      return { allowed: true };
    }

    if (action === "complete") {
      if (currentStatus !== "in_progress") {
        return { allowed: false, reason: `Step ${stepNumber} must be in progress to complete it. Current status: ${currentStatus}.` };
      }
      return { allowed: true };
    }

    if (action === "skip") {
      if (!transition.skipReason?.trim()) {
        return { allowed: false, reason: "A reason must be provided when skipping a step." };
      }
      if (currentStatus === "completed") {
        return { allowed: false, reason: `Step ${stepNumber} is already completed and cannot be skipped.` };
      }
      // Check that all previous steps are completed or skipped
      for (let i = 1; i < stepNumber; i++) {
        const prevStatus = state.stepStatuses[i];
        if (prevStatus !== "completed" && prevStatus !== "skipped_with_reason") {
          return { allowed: false, reason: `Step ${i} must be completed before skipping step ${stepNumber}.` };
        }
      }
      return { allowed: true };
    }

    return { allowed: false, reason: "Unknown action." };
  },

  /**
   * Apply a step transition and return the new state.
   */
  applyTransition(state: WorkflowState, transition: StepTransition): WorkflowState {
    const validation = this.canTransition(state, transition);
    if (!validation.allowed) {
      throw new Error(validation.reason);
    }

    const newState = {
      ...state,
      stepStatuses: { ...state.stepStatuses },
    };

    const { stepNumber, action } = transition;

    if (action === "start") {
      newState.stepStatuses[stepNumber] = "in_progress";
      newState.currentStep = stepNumber;
      if (newState.decisionStatus === "draft") {
        newState.decisionStatus = "in_progress";
      }
    }

    if (action === "complete") {
      newState.stepStatuses[stepNumber] = "completed";
      // Advance currentStep to the next incomplete step
      const nextStep = this.getNextStep(newState);
      if (nextStep) {
        newState.currentStep = nextStep;
      } else {
        // All steps complete — move to under_review
        newState.decisionStatus = "under_review";
      }
    }

    if (action === "skip") {
      newState.stepStatuses[stepNumber] = "skipped_with_reason";
      const nextStep = this.getNextStep(newState);
      if (nextStep) {
        newState.currentStep = nextStep;
      } else {
        newState.decisionStatus = "under_review";
      }
    }

    return newState;
  },

  /**
   * Find the next step that needs action.
   */
  getNextStep(state: WorkflowState): number | null {
    for (let i = 1; i <= 10; i++) {
      const status = state.stepStatuses[i];
      if (status === "not_started" || status === "in_progress") {
        return i;
      }
    }
    return null; // All steps complete
  },

  /**
   * Check if the decision can be approved (all steps done, status is under_review).
   */
  canApprove(state: WorkflowState): boolean {
    return state.decisionStatus === "under_review";
  },

  /**
   * Check if the decision can be published (must be approved first).
   */
  canPublish(state: WorkflowState): boolean {
    return state.decisionStatus === "approved";
  },

  /**
   * Approve a decision.
   */
  approve(state: WorkflowState): WorkflowState {
    if (!this.canApprove(state)) {
      throw new Error("Decision must be under review to approve.");
    }
    return { ...state, decisionStatus: "approved" };
  },

  /**
   * Publish a decision (makes it visible on the public portal).
   */
  publish(state: WorkflowState): WorkflowState {
    if (!this.canPublish(state)) {
      throw new Error("Decision must be approved before publishing.");
    }
    return { ...state, decisionStatus: "published" };
  },

  /**
   * Withdraw a decision.
   */
  withdraw(state: WorkflowState): WorkflowState {
    if (state.decisionStatus === "published") {
      throw new Error("Published decisions cannot be withdrawn.");
    }
    return { ...state, decisionStatus: "withdrawn" };
  },

  /**
   * Get the completion percentage of the workflow.
   */
  getProgress(state: WorkflowState): number {
    let completed = 0;
    for (let i = 1; i <= 10; i++) {
      if (state.stepStatuses[i] === "completed" || state.stepStatuses[i] === "skipped_with_reason") {
        completed++;
      }
    }
    return Math.round((completed / 10) * 100);
  },
};
