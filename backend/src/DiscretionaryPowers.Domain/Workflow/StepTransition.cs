namespace DiscretionaryPowers.Domain.Workflow;

public enum TransitionAction
{
    Start,
    Complete,
    Skip
}

public record StepTransition(
    int StepNumber,
    TransitionAction Action,
    string? SkipReason = null
);
