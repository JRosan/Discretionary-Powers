namespace DiscretionaryPowers.Domain.Entities;

public class DecisionTypeConfig
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int PublicationDeadlineDays { get; set; } = 30;
    public Guid? DefaultWorkflowId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}
