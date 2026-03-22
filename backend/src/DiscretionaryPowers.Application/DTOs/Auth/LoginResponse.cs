using DiscretionaryPowers.Application.DTOs.Users;

namespace DiscretionaryPowers.Application.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public UserResponse User { get; set; } = null!;
}
