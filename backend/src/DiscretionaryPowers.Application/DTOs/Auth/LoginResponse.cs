using DiscretionaryPowers.Application.DTOs.Users;

namespace DiscretionaryPowers.Application.DTOs.Auth;

public class LoginResponse
{
    public string? Token { get; set; }
    public UserResponse? User { get; set; }
    public bool MfaRequired { get; set; }
    public string? MfaToken { get; set; }
}
