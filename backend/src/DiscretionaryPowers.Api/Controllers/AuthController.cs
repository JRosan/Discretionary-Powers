using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Auth;
using DiscretionaryPowers.Application.DTOs.Users;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Infrastructure.Data;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
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
                Role = ToSnakeCase(user.Role.ToString()),
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
            Role = ToSnakeCase(currentUser.Role.ToString()),
            MinistryId = currentUser.MinistryId,
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is not null)
        {
            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
            await db.SaveChangesAsync();

            // In production, send email with the reset link containing the token.
            // For now, log it for development purposes.
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<AuthController>>();
            logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, user.PasswordResetToken);
        }

        // Always return 200 to avoid revealing whether the email exists
        return Ok(new { message = "If an account exists with that email, you will receive a password reset link." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == request.Token &&
            u.PasswordResetExpiry > DateTime.UtcNow);

        if (user is null)
            return BadRequest(new { message = "Invalid or expired reset link." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var user = await db.Users.FindAsync(currentUser.UserId);

        if (user is null || user.PasswordHash is null)
            return BadRequest(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }
}
