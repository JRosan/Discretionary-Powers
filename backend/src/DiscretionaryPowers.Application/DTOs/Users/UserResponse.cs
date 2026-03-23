namespace DiscretionaryPowers.Application.DTOs.Users;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Role { get; set; } = null!;
    public Guid? MinistryId { get; set; }
    public Guid OrganizationId { get; set; }
    public bool Active { get; set; }
    public string? MinistryName { get; set; }
    public string? OrganizationName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
