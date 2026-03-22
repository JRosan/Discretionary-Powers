using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Users;

public class CreateUserRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(1)]
    public string Name { get; set; } = null!;

    [Required]
    public string Role { get; set; } = null!;

    [Required]
    public Guid MinistryId { get; set; }

    [MinLength(8)]
    public string? Password { get; set; }
}
