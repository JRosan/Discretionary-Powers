using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Infrastructure.Data;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/super-admin")]
[Authorize(Policy = "SuperAdmin")]
public class SuperAdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("tenants")]
    public async Task<IActionResult> ListTenants()
    {
        var orgs = await db.Organizations
            .AsNoTracking()
            .Select(o => new
            {
                o.Id,
                o.Name,
                o.Slug,
                o.Domain,
                o.LogoUrl,
                o.PrimaryColor,
                o.AccentColor,
                o.IsActive,
                o.CreatedAt,
                o.UpdatedAt,
                UserCount = db.Users.IgnoreQueryFilters().Count(u => u.OrganizationId == o.Id),
                DecisionCount = db.Decisions.IgnoreQueryFilters().Count(d => d.OrganizationId == o.Id),
            })
            .OrderBy(o => o.Name)
            .ToListAsync();

        return Ok(orgs);
    }

    [HttpGet("tenants/{id:guid}")]
    public async Task<IActionResult> GetTenant(Guid id)
    {
        var org = await db.Organizations
            .AsNoTracking()
            .Where(o => o.Id == id)
            .Select(o => new
            {
                o.Id,
                o.Name,
                o.Slug,
                o.Domain,
                o.LogoUrl,
                o.PrimaryColor,
                o.AccentColor,
                o.HeroImageUrl,
                o.IsActive,
                o.CreatedAt,
                o.UpdatedAt,
                UserCount = db.Users.IgnoreQueryFilters().Count(u => u.OrganizationId == o.Id),
                DecisionCount = db.Decisions.IgnoreQueryFilters().Count(d => d.OrganizationId == o.Id),
            })
            .FirstOrDefaultAsync();

        if (org is null) return NotFound();
        return Ok(org);
    }

    [HttpPost("tenants")]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Slug))
            return BadRequest(new { message = "Name and slug are required." });

        var slugExists = await db.Organizations.AnyAsync(o => o.Slug == request.Slug);
        if (slugExists)
            return Conflict(new { message = "An organization with this slug already exists." });

        var org = new Organization
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.Organizations.Add(org);

        // Default ministries
        var ministries = new List<Ministry>
        {
            new() { Id = Guid.NewGuid(), Name = "Office of the Premier", Code = "PMO", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Ministry of Finance", Code = "FIN", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Name = "Ministry of Justice", Code = "JUS", OrganizationId = org.Id, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
        };
        db.Ministries.AddRange(ministries);

        // Admin user
        if (!string.IsNullOrWhiteSpace(request.AdminEmail))
        {
            var emailExists = await db.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == request.AdminEmail);
            if (emailExists)
                return Conflict(new { message = "A user with this email already exists." });

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword ?? "password", 12);
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.AdminEmail,
                Name = request.AdminName ?? "Admin",
                Role = UserRole.PermanentSecretary,
                OrganizationId = org.Id,
                MinistryId = ministries[0].Id,
                PasswordHash = passwordHash,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Users.Add(adminUser);
        }

        // Default workflow template (BVI 10-step)
        var workflow = new WorkflowTemplate
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            Name = "Standard 10-Step Framework",
            IsDefault = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.WorkflowTemplates.Add(workflow);

        var steps = new (int Num, string Name, string Desc)[]
        {
            (1, "Confirm Authority", "Confirm the legal authority to make this decision"),
            (2, "Follow Procedures", "Follow all required procedures and protocols"),
            (3, "Gather Information", "Gather all relevant information and evidence"),
            (4, "Evaluate Evidence", "Evaluate the evidence objectively"),
            (5, "Standard of Proof", "Apply the appropriate standard of proof"),
            (6, "Fairness", "Ensure fairness in the decision-making process"),
            (7, "Procedural Fairness", "Ensure procedural fairness requirements are met"),
            (8, "Consider Merits", "Consider the merits of the case"),
            (9, "Communicate", "Communicate the decision appropriately"),
            (10, "Record", "Record the decision and reasoning"),
        };
        foreach (var (num, name, desc) in steps)
        {
            db.WorkflowStepTemplates.Add(new WorkflowStepTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowTemplateId = workflow.Id,
                StepNumber = num,
                Name = name,
                Description = desc,
                IsRequired = true,
            });
        }

        // Default decision types
        var decisionTypes = new (string Code, string Name, string Desc)[]
        {
            ("REG", "Regulatory Decision", "Decisions related to regulatory matters"),
            ("FIN", "Financial Decision", "Decisions involving financial matters"),
            ("ADM", "Administrative Decision", "General administrative decisions"),
            ("LIC", "Licensing Decision", "Decisions related to licensing and permits"),
        };
        foreach (var (code, name, desc) in decisionTypes)
        {
            db.DecisionTypeConfigs.Add(new DecisionTypeConfig
            {
                Id = Guid.NewGuid(),
                OrganizationId = org.Id,
                Code = code,
                Name = name,
                Description = desc,
                DefaultWorkflowId = workflow.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTenant), new { id = org.Id }, new
        {
            org.Id,
            org.Name,
            org.Slug,
            org.IsActive,
            org.CreatedAt,
        });
    }

    [HttpPut("tenants/{id:guid}")]
    public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] UpdateTenantRequest request)
    {
        var org = await db.Organizations.FindAsync(id);
        if (org is null) return NotFound();

        if (request.Name is not null) org.Name = request.Name;
        if (request.Slug is not null) org.Slug = request.Slug;
        if (request.Domain is not null) org.Domain = request.Domain;
        if (request.IsActive.HasValue) org.IsActive = request.IsActive.Value;
        if (request.PrimaryColor is not null) org.PrimaryColor = request.PrimaryColor;
        if (request.AccentColor is not null) org.AccentColor = request.AccentColor;
        org.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { org.Id, org.Name, org.Slug, org.Domain, org.IsActive, org.UpdatedAt });
    }

    [HttpGet("tenants/{id:guid}/stats")]
    public async Task<IActionResult> GetTenantStats(Guid id)
    {
        var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);
        if (org is null) return NotFound();

        var totalUsers = await db.Users.IgnoreQueryFilters().CountAsync(u => u.OrganizationId == id);
        var totalDecisions = await db.Decisions.IgnoreQueryFilters().CountAsync(d => d.OrganizationId == id);
        var totalPublished = await db.Decisions.IgnoreQueryFilters().CountAsync(d => d.OrganizationId == id && d.Status == DecisionStatus.Published);

        var byStatus = await db.Decisions.IgnoreQueryFilters()
            .Where(d => d.OrganizationId == id)
            .GroupBy(d => d.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var lastActivity = await db.Decisions.IgnoreQueryFilters()
            .Where(d => d.OrganizationId == id)
            .OrderByDescending(d => d.UpdatedAt)
            .Select(d => d.UpdatedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            totalUsers,
            totalDecisions,
            totalPublished,
            byStatus = byStatus.ToDictionary(x => EnumConverter.ToSnakeCase(x.Status), x => x.Count),
            createdAt = org.CreatedAt,
            lastActivity = lastActivity != default ? lastActivity : (DateTime?)null,
        });
    }
}

public class CreateTenantRequest
{
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? AdminEmail { get; set; }
    public string? AdminName { get; set; }
    public string? AdminPassword { get; set; }
}

public class UpdateTenantRequest
{
    public string? Name { get; set; }
    public string? Slug { get; set; }
    public string? Domain { get; set; }
    public bool? IsActive { get; set; }
    public string? PrimaryColor { get; set; }
    public string? AccentColor { get; set; }
}
