namespace DiscretionaryPowers.Domain.Entities;

public class WorkflowStepTemplate
{
    public Guid Id { get; set; }
    public Guid WorkflowTemplateId { get; set; }
    public int StepNumber { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? GuidanceTips { get; set; }
    public string? LegalReference { get; set; }
    public string? ChecklistItems { get; set; }
    public bool IsRequired { get; set; } = true;
    public WorkflowTemplate Template { get; set; } = null!;
}
