using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/workflows")]
[Authorize]
public class WorkflowsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var workflows = await db.WorkflowTemplates
            .AsNoTracking()
            .Include(w => w.Steps.OrderBy(s => s.StepNumber))
            .Where(w => w.IsActive)
            .OrderByDescending(w => w.IsDefault)
            .ThenBy(w => w.Name)
            .ToListAsync();

        return Ok(workflows.Select(MapToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var workflow = await db.WorkflowTemplates
            .AsNoTracking()
            .Include(w => w.Steps.OrderBy(s => s.StepNumber))
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow is null) return NotFound();
        return Ok(MapToResponse(workflow));
    }

    [HttpPost]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Create([FromBody] CreateWorkflowRequest request)
    {
        var workflow = new WorkflowTemplate
        {
            Id = Guid.NewGuid(),
            OrganizationId = request.OrganizationId,
            Name = request.Name,
            IsDefault = request.IsDefault,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.WorkflowTemplates.Add(workflow);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = workflow.Id }, MapToResponse(workflow));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWorkflowRequest request)
    {
        var workflow = await db.WorkflowTemplates.FindAsync(id);
        if (workflow is null) return NotFound();

        if (request.Name is not null) workflow.Name = request.Name;
        if (request.IsDefault.HasValue) workflow.IsDefault = request.IsDefault.Value;
        workflow.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(MapToResponse(workflow));
    }

    [HttpPost("{id:guid}/steps")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> UpdateSteps(Guid id, [FromBody] List<WorkflowStepRequest> steps)
    {
        var workflow = await db.WorkflowTemplates
            .Include(w => w.Steps)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workflow is null) return NotFound();

        // Remove existing steps
        db.WorkflowStepTemplates.RemoveRange(workflow.Steps);

        // Add new steps
        for (var i = 0; i < steps.Count; i++)
        {
            var step = steps[i];
            workflow.Steps.Add(new WorkflowStepTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowTemplateId = id,
                StepNumber = i + 1,
                Name = step.Name,
                Description = step.Description,
                GuidanceTips = step.GuidanceTips,
                LegalReference = step.LegalReference,
                ChecklistItems = step.ChecklistItems,
                IsRequired = step.IsRequired,
            });
        }

        workflow.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(MapToResponse(workflow));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var workflow = await db.WorkflowTemplates.FindAsync(id);
        if (workflow is null) return NotFound();

        workflow.IsActive = false;
        workflow.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static object MapToResponse(WorkflowTemplate w) => new
    {
        w.Id,
        w.OrganizationId,
        w.Name,
        w.IsDefault,
        w.IsActive,
        w.CreatedAt,
        w.UpdatedAt,
        Steps = w.Steps.OrderBy(s => s.StepNumber).Select(s => new
        {
            s.Id,
            s.StepNumber,
            s.Name,
            s.Description,
            s.GuidanceTips,
            s.LegalReference,
            s.ChecklistItems,
            s.IsRequired,
        }),
    };
}

public class CreateWorkflowRequest
{
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsDefault { get; set; }
}

public class UpdateWorkflowRequest
{
    public string? Name { get; set; }
    public bool? IsDefault { get; set; }
}

public class WorkflowStepRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? GuidanceTips { get; set; }
    public string? LegalReference { get; set; }
    public string? ChecklistItems { get; set; }
    public bool IsRequired { get; set; } = true;
}
