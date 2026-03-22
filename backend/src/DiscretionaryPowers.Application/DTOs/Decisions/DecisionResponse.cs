namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class DecisionResponse
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public Guid MinistryId { get; set; }
    public string DecisionType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int CurrentStep { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? AssignedTo { get; set; }
    public bool IsPublic { get; set; }
    public bool JudicialReviewFlag { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<DecisionStepResponse> Steps { get; set; } = [];
}

public class DecisionStepResponse
{
    public Guid Id { get; set; }
    public int StepNumber { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
    public object? Data { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
