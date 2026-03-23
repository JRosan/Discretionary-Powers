namespace DiscretionaryPowers.Domain.Entities;

public class WorkflowTemplate
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<WorkflowStepTemplate> Steps { get; set; } = new List<WorkflowStepTemplate>();
}
