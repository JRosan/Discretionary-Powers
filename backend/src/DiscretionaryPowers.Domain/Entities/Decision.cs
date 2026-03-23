using System.Text.Json;
using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class Decision
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public Guid MinistryId { get; set; }
    public DecisionType DecisionType { get; set; }
    public DecisionStatus Status { get; set; } = DecisionStatus.Draft;
    public int CurrentStep { get; set; } = 1;
    public Guid CreatedBy { get; set; }
    public Guid? AssignedTo { get; set; }
    public bool IsPublic { get; set; }
    public bool JudicialReviewFlag { get; set; }
    public DateTime? Deadline { get; set; }
    public JsonDocument? Metadata { get; set; }
    public DateTime? PublicationDeadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Ministry Ministry { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public User? Assignee { get; set; }
    public ICollection<DecisionStep> Steps { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
