using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/tenant")]
public class TenantController(AppDbContext db) : ControllerBase
{
    [HttpGet("branding")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranding()
    {
        var org = await db.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.IsActive);

        if (org == null)
        {
            return Ok(new
            {
                name = "Government",
                slug = "default",
                logoUrl = (string?)null,
                primaryColor = (string?)null,
                accentColor = (string?)null,
                heroImageUrl = (string?)null,
            });
        }

        return Ok(new
        {
            org.Name,
            org.Slug,
            org.LogoUrl,
            org.PrimaryColor,
            org.AccentColor,
            org.HeroImageUrl,
        });
    }

    [HttpPut("branding")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> UpdateBranding([FromBody] UpdateBrandingRequest request)
    {
        var org = await db.Organizations.FirstOrDefaultAsync(o => o.IsActive);
        if (org == null) return NotFound();

        if (request.Name != null) org.Name = request.Name;
        if (request.LogoUrl != null) org.LogoUrl = request.LogoUrl;
        if (request.PrimaryColor != null) org.PrimaryColor = request.PrimaryColor;
        if (request.AccentColor != null) org.AccentColor = request.AccentColor;
        if (request.HeroImageUrl != null) org.HeroImageUrl = request.HeroImageUrl;
        org.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok();
    }
}

public class UpdateBrandingRequest
{
    public string? Name { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? AccentColor { get; set; }
    public string? HeroImageUrl { get; set; }
}
