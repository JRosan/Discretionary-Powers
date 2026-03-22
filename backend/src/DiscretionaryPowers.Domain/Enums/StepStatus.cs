namespace DiscretionaryPowers.Domain.Enums;

/// <summary>
/// Maps to PostgreSQL enum "step_status"
/// </summary>
public enum StepStatus
{
    // not_started
    NotStarted,
    // in_progress
    InProgress,
    // completed
    Completed,
    // skipped_with_reason
    SkippedWithReason
}
