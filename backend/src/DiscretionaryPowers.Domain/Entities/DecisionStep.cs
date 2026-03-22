using System.Text.Json;
using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class DecisionStep
{
    public Guid Id { get; set; }
    public Guid DecisionId { get; set; }
    public int StepNumber { get; set; }
    public StepStatus Status { get; set; } = StepStatus.NotStarted;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
    public JsonDocument? Data { get; set; }
    public string? Notes { get; set; }
    public JsonDocument? Evidence { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Decision Decision { get; set; } = null!;
}
