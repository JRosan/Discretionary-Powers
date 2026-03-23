namespace DiscretionaryPowers.Domain.Entities;

public class PlatformConfig
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool IsSecret { get; set; }
    public string? Description { get; set; }
    public string Category { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}
