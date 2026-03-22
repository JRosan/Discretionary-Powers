namespace DiscretionaryPowers.Domain.Enums;

/// <summary>
/// Maps to PostgreSQL enum "notification_type"
/// </summary>
public enum NotificationType
{
    // assignment
    Assignment,
    // approval_needed
    ApprovalNeeded,
    // overdue
    Overdue,
    // status_change
    StatusChange,
    // comment
    Comment,
    // judicial_review
    JudicialReview
}
