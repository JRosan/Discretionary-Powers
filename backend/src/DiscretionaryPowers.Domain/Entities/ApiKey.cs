namespace DiscretionaryPowers.Domain.Entities;

public class ApiKey
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = null!;
    public string KeyHash { get; set; } = null!;
    public string KeyPrefix { get; set; } = null!;
    public string[] Scopes { get; set; } = [];
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
}
