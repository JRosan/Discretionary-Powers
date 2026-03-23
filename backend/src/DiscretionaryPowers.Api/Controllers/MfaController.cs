using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Auth;
using DiscretionaryPowers.Application.DTOs.Users;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/auth/mfa")]
public class MfaController(AppDbContext db, MfaService mfaService, JwtTokenService jwtService, ICurrentUserService currentUser, SubscriptionGuardService subscriptionGuard) : ControllerBase
{
    [HttpPost("setup")]
    [Authorize]
    public async Task<IActionResult> Setup()
    {
        if (!await subscriptionGuard.CanUseFeature("mfa"))
            return StatusCode(403, new { message = "Multi-factor authentication requires a Professional or Enterprise plan." });

        var secret = mfaService.GenerateSecret();
        var qrCodeUri = mfaService.GetQrCodeUri(secret, currentUser.Email);
        return Ok(new { secret, qrCodeUri });
    }

    [HttpPost("enable")]
    [Authorize]
    public async Task<IActionResult> Enable([FromBody] MfaCodeRequest request)
    {
        if (!await subscriptionGuard.CanUseFeature("mfa"))
            return StatusCode(403, new { message = "Multi-factor authentication requires a Professional or Enterprise plan." });

        var user = await db.Users.FindAsync(currentUser.UserId);
        if (user is null) return NotFound();

        // The secret must be passed from the setup step — store temporarily in the request
        // We verify the code against the secret that was returned from setup
        if (string.IsNullOrEmpty(request.Secret))
            return BadRequest(new { message = "Secret is required to enable MFA." });

        if (!mfaService.VerifyCode(request.Secret, request.Code))
            return BadRequest(new { message = "Invalid verification code." });

        user.MfaSecret = request.Secret;
        user.MfaEnabled = true;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "MFA enabled successfully." });
    }

    [HttpPost("disable")]
    [Authorize]
    public async Task<IActionResult> Disable([FromBody] MfaCodeRequest request)
    {
        var user = await db.Users.FindAsync(currentUser.UserId);
        if (user is null) return NotFound();

        if (!user.MfaEnabled || user.MfaSecret is null)
            return BadRequest(new { message = "MFA is not enabled." });

        if (!mfaService.VerifyCode(user.MfaSecret, request.Code))
            return BadRequest(new { message = "Invalid verification code." });

        user.MfaSecret = null;
        user.MfaEnabled = false;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "MFA disabled successfully." });
    }

    [HttpPost("verify-login")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyLogin([FromBody] MfaVerifyLoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var userId = jwtService.ValidateMfaToken(request.MfaToken);
        if (userId is null)
            return Unauthorized(new { message = "Invalid or expired MFA token." });

        var user = await db.Users
            .Include(u => u.Ministry)
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user is null || !user.MfaEnabled || user.MfaSecret is null)
            return Unauthorized(new { message = "Invalid MFA session." });

        if (!mfaService.VerifyCode(user.MfaSecret, request.Code))
        {
            db.LoginEvents.Add(new LoginEvent
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Email = user.Email,
                OrganizationId = user.OrganizationId,
                Status = "failed",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                FailureReason = "Invalid MFA code",
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
            return Unauthorized(new { message = "Invalid verification code." });
        }

        db.LoginEvents.Add(new LoginEvent
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Email = user.Email,
            OrganizationId = user.OrganizationId,
            Status = "mfa_verified",
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

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
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
            },
        });
    }
}

public class MfaCodeRequest
{
    public string Code { get; set; } = null!;
    public string? Secret { get; set; }
}

public class MfaVerifyLoginRequest
{
    public string MfaToken { get; set; } = null!;
    public string Code { get; set; } = null!;
}
