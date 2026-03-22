namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class ListDecisionsQuery
{
    public Guid? MinistryId { get; set; }
    public string? Status { get; set; }
    public string? DecisionType { get; set; }
    public Guid? AssignedTo { get; set; }
    public string? Search { get; set; }
    public string? Cursor { get; set; }
    public int Limit { get; set; } = 20;
}
