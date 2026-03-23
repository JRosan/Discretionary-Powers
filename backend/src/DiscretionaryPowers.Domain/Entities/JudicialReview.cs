using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class JudicialReview
{
    public Guid Id { get; set; }
    public Guid DecisionId { get; set; }
    public Guid OrganizationId { get; set; }
    public JudicialReviewGround Ground { get; set; }
    public string Status { get; set; } = "filed";
    public DateOnly FiledDate { get; set; }
    public string? CourtReference { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Decision Decision { get; set; } = null!;
}
