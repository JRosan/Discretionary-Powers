using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Workflow;

public record WorkflowState(
    int CurrentStep,
    DecisionStatus DecisionStatus,
    Dictionary<int, StepStatus> StepStatuses
);
