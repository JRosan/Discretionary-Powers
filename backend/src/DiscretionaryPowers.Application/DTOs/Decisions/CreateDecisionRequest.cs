using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class CreateDecisionRequest
{
    [Required, MinLength(3), MaxLength(500)]
    public string Title { get; set; } = null!;

    [MaxLength(5000)]
    public string? Description { get; set; }

    [Required]
    public Guid MinistryId { get; set; }

    [Required]
    public string DecisionType { get; set; } = null!;

    public DateTime? Deadline { get; set; }

    public Guid? AssignedTo { get; set; }
}
