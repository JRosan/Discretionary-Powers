using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Policy = PermissionPolicies.CanManageSettings)]
public class SettingsController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    private static readonly Dictionary<string, string> Defaults = new()
    {
        ["emailNotifications"] = "true",
        ["auditRetentionDays"] = "2555",
        ["systemName"] = "DPMS",
    };

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await db.SystemSettings
            .AsNoTracking()
            .ToDictionaryAsync(s => s.Key, s => s.Value);

        // Fill in defaults for any missing keys
        foreach (var (key, value) in Defaults)
        {
            settings.TryAdd(key, value);
        }

        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] Dictionary<string, string> data)
    {
        var now = DateTime.UtcNow;

        foreach (var (key, value) in data)
        {
            var existing = await db.SystemSettings.FindAsync(key);
            if (existing != null)
            {
                existing.Value = value;
                existing.UpdatedAt = now;
            }
            else
            {
                db.SystemSettings.Add(new SystemSetting
                {
                    Key = key,
                    Value = value,
                    OrganizationId = currentUser.OrganizationId ?? Guid.Empty,
                    UpdatedAt = now,
                });
            }
        }

        await db.SaveChangesAsync();
        return NoContent();
    }
}
