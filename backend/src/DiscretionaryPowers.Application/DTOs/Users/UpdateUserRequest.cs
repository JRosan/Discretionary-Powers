namespace DiscretionaryPowers.Application.DTOs.Users;

public class UpdateUserRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public Guid? MinistryId { get; set; }
    public bool? Active { get; set; }
}
