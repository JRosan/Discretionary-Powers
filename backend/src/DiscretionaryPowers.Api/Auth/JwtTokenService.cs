using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DiscretionaryPowers.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DiscretionaryPowers.Api.Auth;

public class JwtTokenService(IConfiguration configuration)
{
    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT key not configured.")));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var m) ? m : 480;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.Name),
            new(ClaimTypes.Role, user.Role.ToString()),
        };

        if (user.MinistryId.HasValue)
            claims.Add(new Claim("ministry_id", user.MinistryId.Value.ToString()));

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"] ?? "DiscretionaryPowers",
            audience: configuration["Jwt:Audience"] ?? "DiscretionaryPowers",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
