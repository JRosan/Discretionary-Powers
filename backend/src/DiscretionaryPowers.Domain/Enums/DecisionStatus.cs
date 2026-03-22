namespace DiscretionaryPowers.Domain.Enums;

/// <summary>
/// Maps to PostgreSQL enum "decision_status"
/// </summary>
public enum DecisionStatus
{
    // draft
    Draft,
    // in_progress
    InProgress,
    // under_review
    UnderReview,
    // approved
    Approved,
    // published
    Published,
    // challenged
    Challenged,
    // withdrawn
    Withdrawn
}
