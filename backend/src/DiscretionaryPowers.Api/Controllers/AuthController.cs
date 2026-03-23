using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Auth;
using DiscretionaryPowers.Application.DTOs.Users;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtTokenService jwtService, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await db.Users
            .Include(u => u.Ministry)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || user.PasswordHash is null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.Active)
            return Unauthorized(new { message = "Account is deactivated." });

        if (user.MfaEnabled && user.MfaSecret is not null)
        {
            var mfaToken = jwtService.GenerateMfaToken(user);
            return Ok(new LoginResponse
            {
                MfaRequired = true,
                MfaToken = mfaToken,
            });
        }

        var token = jwtService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role.ToString().ToLowerInvariant(),
                MinistryId = user.MinistryId,
                Active = user.Active,
                MinistryName = user.Ministry?.Name,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
            },
        });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        return Ok(new CurrentUserResponse
        {
            Id = currentUser.UserId,
            Email = currentUser.Email,
            Name = currentUser.Name,
            Role = currentUser.Role.ToString().ToLowerInvariant(),
            MinistryId = currentUser.MinistryId,
        });
    }
}
