using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Auth;

public class ForgotPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = null!;
}
