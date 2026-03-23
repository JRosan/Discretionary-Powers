using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/decision-types")]
[Authorize]
public class DecisionTypesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var types = await db.DecisionTypeConfigs
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(types.Select(MapToResponse));
    }

    [HttpPost]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Create([FromBody] CreateDecisionTypeRequest request)
    {
        var config = new DecisionTypeConfig
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            PublicationDeadlineDays = request.PublicationDeadlineDays,
            DefaultWorkflowId = request.DefaultWorkflowId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.DecisionTypeConfigs.Add(config);
        await db.SaveChangesAsync();

        return CreatedAtAction(null, new { id = config.Id }, MapToResponse(config));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDecisionTypeRequest request)
    {
        var config = await db.DecisionTypeConfigs.FindAsync(id);
        if (config is null) return NotFound();

        if (request.Name is not null) config.Name = request.Name;
        if (request.Code is not null) config.Code = request.Code;
        if (request.Description is not null) config.Description = request.Description;
        if (request.PublicationDeadlineDays.HasValue) config.PublicationDeadlineDays = request.PublicationDeadlineDays.Value;
        if (request.DefaultWorkflowId.HasValue) config.DefaultWorkflowId = request.DefaultWorkflowId.Value;

        await db.SaveChangesAsync();
        return Ok(MapToResponse(config));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var config = await db.DecisionTypeConfigs.FindAsync(id);
        if (config is null) return NotFound();

        config.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static object MapToResponse(DecisionTypeConfig t) => new
    {
        t.Id,
        t.OrganizationId,
        t.Code,
        t.Name,
        t.Description,
        t.PublicationDeadlineDays,
        t.DefaultWorkflowId,
        t.IsActive,
        t.CreatedAt,
    };
}

public class CreateDecisionTypeRequest
{
    public Guid OrganizationId { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int PublicationDeadlineDays { get; set; } = 30;
    public Guid? DefaultWorkflowId { get; set; }
}

public class UpdateDecisionTypeRequest
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? PublicationDeadlineDays { get; set; }
    public Guid? DefaultWorkflowId { get; set; }
}
