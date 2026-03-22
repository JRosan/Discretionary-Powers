using System.Text.Json;

namespace DiscretionaryPowers.Domain.Entities;

public class AuditEntry
{
    public long Id { get; set; }
    public Guid? DecisionId { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = null!;
    public int? StepNumber { get; set; }
    public JsonDocument? Detail { get; set; }
    public string? IpAddress { get; set; }
    public string? PreviousHash { get; set; }
    public string EntryHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Decision? Decision { get; set; }
    public User User { get; set; } = null!;
}
