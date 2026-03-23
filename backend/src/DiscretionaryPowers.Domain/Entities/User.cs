using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public Guid? MinistryId { get; set; }
    public Guid OrganizationId { get; set; }
    public bool MfaEnabled { get; set; }
    public string? MfaSecret { get; set; }
    public bool Active { get; set; } = true;
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetExpiry { get; set; }
    public string? EmailVerificationToken { get; set; }
    public bool EmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public Ministry? Ministry { get; set; }
}
