namespace DiscretionaryPowers.Domain.Entities;

public class LoginEvent
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Email { get; set; } = null!;
    public Guid? OrganizationId { get; set; }
    public string Status { get; set; } = null!; // "success", "failed", "mfa_required", "mfa_verified"
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? FailureReason { get; set; }
    public DateTime CreatedAt { get; set; }
}
