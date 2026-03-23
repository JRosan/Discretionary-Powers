namespace DiscretionaryPowers.Application.DTOs.Auth;

public class CurrentUserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Role { get; set; } = null!;
    public Guid? MinistryId { get; set; }
    public Guid? OrganizationId { get; set; }
}
