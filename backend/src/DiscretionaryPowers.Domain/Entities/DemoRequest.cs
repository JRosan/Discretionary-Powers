namespace DiscretionaryPowers.Domain.Entities;

public class DemoRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Organization { get; set; } = null!;
    public string JobTitle { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string? UserRange { get; set; }
    public string? Message { get; set; }
    public string? PreferredDate { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
}
