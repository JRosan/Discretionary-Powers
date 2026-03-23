namespace DiscretionaryPowers.Domain.Entities;

public class PlatformAnnouncement
{
    public Guid Id { get; set; }
    public string Message { get; set; } = null!;
    public string Type { get; set; } = "info"; // info, warning, maintenance
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
