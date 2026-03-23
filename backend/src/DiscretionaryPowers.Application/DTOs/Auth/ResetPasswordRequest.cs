using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Auth;

public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = null!;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = null!;
}
