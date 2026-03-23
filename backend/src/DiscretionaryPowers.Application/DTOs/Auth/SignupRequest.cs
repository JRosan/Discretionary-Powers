using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Auth;

public class SignupRequest
{
    [Required]
    public string OrganizationName { get; set; } = null!;

    [Required]
    public string Slug { get; set; } = null!;

    public string? Country { get; set; }

    [Required]
    public string AdminName { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(8)]
    public string Password { get; set; } = null!;

    public string? Plan { get; set; }
}
