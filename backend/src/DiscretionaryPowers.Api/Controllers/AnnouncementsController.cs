using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/announcements")]
public class AnnouncementsController(AppDbContext db) : ControllerBase
{
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveAnnouncements()
    {
        var now = DateTime.UtcNow;
        var announcements = await db.PlatformAnnouncements
            .AsNoTracking()
            .Where(a => a.IsActive && (a.ExpiresAt == null || a.ExpiresAt > now))
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Message,
                a.Type,
                a.ExpiresAt,
                a.CreatedAt,
            })
            .ToListAsync();

        return Ok(announcements);
    }
}
