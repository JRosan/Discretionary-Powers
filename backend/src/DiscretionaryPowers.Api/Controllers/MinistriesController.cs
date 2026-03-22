using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Ministries;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/ministries")]
[Authorize]
public class MinistriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var ministries = await db.Ministries
            .AsNoTracking()
            .Where(m => m.Active)
            .OrderBy(m => m.Name)
            .ToListAsync();

        return Ok(ministries.Select(MapToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var ministry = await db.Ministries.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (ministry is null) return NotFound();
        return Ok(MapToResponse(ministry));
    }

    [HttpPost]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> Create([FromBody] CreateMinistryRequest request)
    {
        var ministry = new Ministry
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Ministries.Add(ministry);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ministry.Id }, MapToResponse(ministry));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMinistryRequest request)
    {
        var ministry = await db.Ministries.FindAsync(id);
        if (ministry is null) return NotFound();

        if (request.Name is not null) ministry.Name = request.Name;
        if (request.Code is not null) ministry.Code = request.Code;
        if (request.Active.HasValue) ministry.Active = request.Active.Value;
        ministry.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(MapToResponse(ministry));
    }

    private static MinistryResponse MapToResponse(Ministry m) => new()
    {
        Id = m.Id,
        Name = m.Name,
        Code = m.Code,
        Active = m.Active,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt,
    };
}
