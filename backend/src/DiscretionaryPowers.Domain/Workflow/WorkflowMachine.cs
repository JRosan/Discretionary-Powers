using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Workflow;

public static class WorkflowMachine
{
    public static WorkflowState CreateInitialState()
    {
        var stepStatuses = new Dictionary<int, StepStatus>();
        for (var i = 1; i <= 10; i++)
            stepStatuses[i] = StepStatus.NotStarted;

        return new WorkflowState(1, DecisionStatus.Draft, stepStatuses);
    }

    public static (bool Allowed, string? Reason) CanTransition(WorkflowState state, StepTransition transition)
    {
        var stepNumber = transition.StepNumber;
        var action = transition.Action;

        if (stepNumber < 1 || stepNumber > 10)
            return (false, "Step number must be between 1 and 10.");

        if (state.DecisionStatus is DecisionStatus.Published or DecisionStatus.Withdrawn)
            return (false, $"Cannot modify steps when decision is {state.DecisionStatus}.");

        var currentStatus = state.StepStatuses[stepNumber];

        if (action == TransitionAction.Start)
        {
            if (currentStatus != StepStatus.NotStarted)
                return (false, $"Step {stepNumber} is already {currentStatus}.");

            for (var i = 1; i < stepNumber; i++)
            {
                var prevStatus = state.StepStatuses[i];
                if (prevStatus is not (StepStatus.Completed or StepStatus.SkippedWithReason))
                    return (false, $"Step {i} must be completed before starting step {stepNumber}.");
            }
            return (true, null);
        }

        if (action == TransitionAction.Complete)
        {
            if (currentStatus != StepStatus.InProgress)
                return (false, $"Step {stepNumber} must be in progress to complete it. Current status: {currentStatus}.");
            return (true, null);
        }

        if (action == TransitionAction.Skip)
        {
            if (string.IsNullOrWhiteSpace(transition.SkipReason))
                return (false, "A reason must be provided when skipping a step.");

            if (currentStatus == StepStatus.Completed)
                return (false, $"Step {stepNumber} is already completed and cannot be skipped.");

            for (var i = 1; i < stepNumber; i++)
            {
                var prevStatus = state.StepStatuses[i];
                if (prevStatus is not (StepStatus.Completed or StepStatus.SkippedWithReason))
                    return (false, $"Step {i} must be completed before skipping step {stepNumber}.");
            }
            return (true, null);
        }

        return (false, "Unknown action.");
    }

    public static WorkflowState ApplyTransition(WorkflowState state, StepTransition transition)
    {
        var (allowed, reason) = CanTransition(state, transition);
        if (!allowed)
            throw new InvalidOperationException(reason);

        var newStatuses = new Dictionary<int, StepStatus>(state.StepStatuses);
        var currentStep = state.CurrentStep;
        var decisionStatus = state.DecisionStatus;

        switch (transition.Action)
        {
            case TransitionAction.Start:
                newStatuses[transition.StepNumber] = StepStatus.InProgress;
                currentStep = transition.StepNumber;
                if (decisionStatus == DecisionStatus.Draft)
                    decisionStatus = DecisionStatus.InProgress;
                break;

            case TransitionAction.Complete:
                newStatuses[transition.StepNumber] = StepStatus.Completed;
                var next = GetNextStep(new WorkflowState(currentStep, decisionStatus, newStatuses));
                if (next.HasValue)
                    currentStep = next.Value;
                else
                    decisionStatus = DecisionStatus.UnderReview;
                break;

            case TransitionAction.Skip:
                newStatuses[transition.StepNumber] = StepStatus.SkippedWithReason;
                var nextAfterSkip = GetNextStep(new WorkflowState(currentStep, decisionStatus, newStatuses));
                if (nextAfterSkip.HasValue)
                    currentStep = nextAfterSkip.Value;
                else
                    decisionStatus = DecisionStatus.UnderReview;
                break;
        }

        return new WorkflowState(currentStep, decisionStatus, newStatuses);
    }

    public static int? GetNextStep(WorkflowState state)
    {
        for (var i = 1; i <= 10; i++)
        {
            var status = state.StepStatuses[i];
            if (status is StepStatus.NotStarted or StepStatus.InProgress)
                return i;
        }
        return null;
    }

    public static bool CanApprove(WorkflowState state) =>
        state.DecisionStatus == DecisionStatus.UnderReview;

    public static bool CanPublish(WorkflowState state) =>
        state.DecisionStatus == DecisionStatus.Approved;

    public static WorkflowState Approve(WorkflowState state)
    {
        if (!CanApprove(state))
            throw new InvalidOperationException("Decision must be under review to approve.");
        return state with { DecisionStatus = DecisionStatus.Approved };
    }

    public static WorkflowState Publish(WorkflowState state)
    {
        if (!CanPublish(state))
            throw new InvalidOperationException("Decision must be approved before publishing.");
        return state with { DecisionStatus = DecisionStatus.Published };
    }

    public static WorkflowState Withdraw(WorkflowState state)
    {
        if (state.DecisionStatus == DecisionStatus.Published)
            throw new InvalidOperationException("Published decisions cannot be withdrawn.");
        return state with { DecisionStatus = DecisionStatus.Withdrawn };
    }

    public static int GetProgress(WorkflowState state)
    {
        var completed = 0;
        for (var i = 1; i <= 10; i++)
        {
            if (state.StepStatuses[i] is StepStatus.Completed or StepStatus.SkippedWithReason)
                completed++;
        }
        return (int)Math.Round((double)completed / 10 * 100);
    }
}
