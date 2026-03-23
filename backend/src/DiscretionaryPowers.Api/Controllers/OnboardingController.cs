using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController(
    AppDbContext db,
    ICurrentUserService currentUser,
    IEmailService emailService,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("ministries")]
    public async Task<IActionResult> UpdateMinistries([FromBody] List<MinistryInput> ministries)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "Organization not found." });

        var now = DateTime.UtcNow;

        // Remove existing ministries that aren't in the new list
        var existingMinistries = await db.Ministries
            .Where(m => m.OrganizationId == orgId.Value)
            .ToListAsync();

        db.Ministries.RemoveRange(existingMinistries);

        // Add all ministries from the request
        foreach (var m in ministries)
        {
            db.Ministries.Add(new Ministry
            {
                Id = Guid.NewGuid(),
                Name = m.Name,
                Code = m.Code,
                OrganizationId = orgId.Value,
                Active = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        await db.SaveChangesAsync();

        return Ok(new { message = $"{ministries.Count} ministries configured." });
    }

    [HttpPost("invite")]
    public async Task<IActionResult> InviteUsers([FromBody] List<InviteInput> users)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "Organization not found." });

        var org = await db.Organizations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Id == orgId.Value);
        if (org is null) return BadRequest(new { message = "Organization not found." });

        var now = DateTime.UtcNow;
        var frontendUrl = configuration["Frontend:Url"] ?? "http://localhost:3000";
        var invited = 0;

        foreach (var input in users)
        {
            // Skip if email already exists
            var exists = await db.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == input.Email);
            if (exists) continue;

            if (!Enum.TryParse<UserRole>(ToPascalCase(input.Role), out var role))
                continue;

            var tempPassword = Guid.NewGuid().ToString()[..12];
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = input.Email,
                Name = input.Name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword),
                Role = role,
                OrganizationId = orgId.Value,
                Active = true,
                EmailVerified = true,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.Users.Add(user);
            invited++;

            // Send invite email
            try
            {
                await emailService.SendEmail(
                    input.Email,
                    $"You've been invited to GovDecision — {org.Name}",
                    $"<h2>Welcome to GovDecision</h2><p>Hi {input.Name},</p><p>You've been invited to join <strong>{org.Name}</strong> on GovDecision as a <strong>{input.Role}</strong>.</p><p>Sign in at: <a href=\"{frontendUrl}/login\">{frontendUrl}/login</a></p><p>Your temporary password: <code>{tempPassword}</code></p><p>Please change your password after your first login.</p>");
            }
            catch
            {
                // Best effort — don't fail the whole operation
            }
        }

        await db.SaveChangesAsync();

        return Ok(new { message = $"{invited} user(s) invited successfully." });
    }

    [HttpPost("complete")]
    public async Task<IActionResult> Complete()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "Organization not found." });

        var org = await db.Organizations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Id == orgId.Value);
        if (org is null) return BadRequest(new { message = "Organization not found." });

        org.OnboardingCompleted = true;
        org.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Onboarding completed successfully." });
    }
}

public class MinistryInput
{
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
}

public class InviteInput
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
}
