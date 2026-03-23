using System.Diagnostics;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Payments;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/super-admin")]
[Authorize(Policy = "SuperAdmin")]
public class SuperAdminController(
    AppDbContext db,
    IConfiguration configuration,
    ICurrentUserService currentUser,
    IEmailService emailService,
    PlaceToPayService placeToPayService) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalTenants = await db.Organizations.CountAsync();
        var activeTenants = await db.Organizations.CountAsync(o => o.IsActive);
        var totalUsers = await db.Users.IgnoreQueryFilters().CountAsync();
        var totalDecisions = await db.Decisions.IgnoreQueryFilters().CountAsync();

        var activeSubscriptions = await db.Subscriptions.IgnoreQueryFilters()
            .Where(s => s.Status == "active")
            .ToListAsync();

        var mrr = activeSubscriptions.Sum(s => s.MonthlyPrice);
        var arr = mrr * 12;

        var byPlan = activeSubscriptions
            .GroupBy(s => s.Plan)
            .ToDictionary(g => g.Key, g => g.Count());

        var recentTenants = await db.Organizations
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                o.Name,
                o.Slug,
                o.IsActive,
                o.CreatedAt,
                UserCount = db.Users.IgnoreQueryFilters().Count(u => u.OrganizationId == o.Id),
            })
            .ToListAsync();

        return Ok(new
        {
            totalTenants,
            activeTenants,
            totalUsers,
            totalDecisions,
            mrr,
            arr,
            recentTenants,
            subscriptionsByPlan = byPlan,
        });
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue()
    {
        var activeSubscriptions = await db.Subscriptions.IgnoreQueryFilters()
            .Where(s => s.Status == "active")
            .ToListAsync();

        var mrr = activeSubscriptions.Sum(s => s.MonthlyPrice);
        var arr = mrr * 12;

        var byPlan = activeSubscriptions
            .GroupBy(s => s.Plan)
            .ToDictionary(g => g.Key, g => g.Count());

        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var cancelledThisMonth = await db.Subscriptions.IgnoreQueryFilters()
            .CountAsync(s => s.Status == "cancelled" && s.CancelledAt != null && s.CancelledAt >= startOfMonth);

        var recentPayments = await db.PaymentRecords.IgnoreQueryFilters()
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Take(20)
            .Select(p => new
            {
                p.Id,
                p.OrganizationId,
                TenantName = db.Organizations.Where(o => o.Id == p.OrganizationId).Select(o => o.Name).FirstOrDefault(),
                p.Reference,
                p.Status,
                p.Amount,
                p.Currency,
                p.PaymentMethod,
                p.ReceiptNumber,
                p.CreatedAt,
                p.PaidAt,
            })
            .ToListAsync();

        return Ok(new
        {
            mrr,
            arr,
            activeSubscriptions = activeSubscriptions.Count,
            byPlan,
            recentPayments,
            cancelledThisMonth,
        });
    }

    [HttpGet("audit")]
    public async Task<IActionResult> GetAuditLog(
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        [FromQuery] Guid? organizationId = null,
        [FromQuery] string? action = null)
    {
        var query = db.AuditEntries.IgnoreQueryFilters().AsNoTracking().AsQueryable();

        if (organizationId.HasValue)
            query = query.Where(a => a.OrganizationId == organizationId.Value);
        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        var total = await query.CountAsync();

        var entries = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(a => new
            {
                a.Id,
                a.DecisionId,
                a.Action,
                a.StepNumber,
                a.OrganizationId,
                OrganizationName = db.Organizations.Where(o => o.Id == a.OrganizationId).Select(o => o.Name).FirstOrDefault(),
                a.UserId,
                UserName = db.Users.IgnoreQueryFilters().Where(u => u.Id == a.UserId).Select(u => u.Name).FirstOrDefault(),
                DecisionReference = a.DecisionId != null
                    ? db.Decisions.IgnoreQueryFilters().Where(d => d.Id == a.DecisionId).Select(d => d.ReferenceNumber).FirstOrDefault()
                    : null,
                a.IpAddress,
                a.EntryHash,
                a.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { items = entries, total, hasMore = offset + limit < total });
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var configs = await db.PlatformConfigs
            .AsNoTracking()
            .OrderBy(c => c.Category)
            .ThenBy(c => c.Key)
            .ToListAsync();

        var grouped = configs
            .GroupBy(c => c.Category)
            .Select(g => new
            {
                name = g.Key,
                settings = g.Select(c => new
                {
                    key = c.Key,
                    value = c.IsSecret
                        ? (string.IsNullOrEmpty(c.Value) ? "" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022")
                        : c.Value,
                    isSecret = c.IsSecret,
                    description = c.Description ?? "",
                }).ToList(),
            })
            .ToList();

        return Ok(new { categories = grouped });
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] List<UpdatePlatformConfigRequest> settings)
    {
        const string maskedValue = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
        var updatedKeys = new List<string>();

        foreach (var item in settings)
        {
            // Skip secrets that weren't actually changed (still masked)
            if (item.Value == maskedValue)
                continue;

            var config = await db.PlatformConfigs.FindAsync(item.Key);
            if (config is null)
            {
                // Create new config entry if it doesn't exist
                config = new PlatformConfig
                {
                    Key = item.Key,
                    Value = item.Value,
                    IsSecret = false,
                    Category = item.Key.Contains(':') ? item.Key.Split(':')[0] : "general",
                    UpdatedAt = DateTime.UtcNow,
                };
                db.PlatformConfigs.Add(config);
            }
            else
            {
                config.Value = item.Value;
                config.UpdatedAt = DateTime.UtcNow;
            }
            updatedKeys.Add(item.Key);
        }

        if (updatedKeys.Count > 0)
            await db.SaveChangesAsync();

        return Ok(new { updated = updatedKeys.Count, keys = updatedKeys });
    }

    [HttpPost("settings/test-payment")]
    public async Task<IActionResult> TestPaymentConnection()
    {
        var (success, message) = await placeToPayService.TestConnection();
        return Ok(new { success, message });
    }

    [HttpPost("settings/test-email")]
    public async Task<IActionResult> TestEmailConnection()
    {
        try
        {
            var toEmail = currentUser.Email;
            await emailService.SendEmail(
                toEmail,
                "GovDecision — Test Email",
                "<h2>Email Configuration Test</h2><p>If you received this email, your email settings are configured correctly.</p><p>Sent at: " + DateTime.UtcNow.ToString("o") + "</p>");
            return Ok(new { success = true, message = $"Test email sent to {toEmail}" });
        }
        catch (Exception ex)
        {
            return Ok(new { success = false, message = $"Email test failed: {ex.Message}" });
        }
    }

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

        // Trial subscription
        var trialSub = new Subscription
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            Plan = "starter",
            Status = "trialing",
            MonthlyPrice = 0,
            Currency = "USD",
            CurrentPeriodStart = DateTime.UtcNow,
            CurrentPeriodEnd = DateTime.UtcNow.AddDays(14),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.Subscriptions.Add(trialSub);

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

    // ── Login Activity ──────────────────────────────────────────────────

    [HttpGet("login-activity")]
    public async Task<IActionResult> GetLoginActivity(
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        [FromQuery] string? status = null,
        [FromQuery] string? email = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var query = db.LoginEvents.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(e => e.Status == status);
        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(e => e.Email.Contains(email));
        if (from.HasValue)
            query = query.Where(e => e.CreatedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(e => e.CreatedAt <= to.Value);

        var total = await query.CountAsync();

        var today = DateTime.UtcNow.Date;
        var loginsToday = await db.LoginEvents.CountAsync(e => e.Status == "success" && e.CreatedAt >= today);
        var failedToday = await db.LoginEvents.CountAsync(e => e.Status == "failed" && e.CreatedAt >= today);
        var mfaToday = await db.LoginEvents.CountAsync(e => (e.Status == "mfa_required" || e.Status == "mfa_verified") && e.CreatedAt >= today);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(e => new
            {
                e.Id,
                e.Email,
                e.UserId,
                e.OrganizationId,
                OrganizationName = e.OrganizationId != null
                    ? db.Organizations.Where(o => o.Id == e.OrganizationId).Select(o => o.Name).FirstOrDefault()
                    : null,
                e.Status,
                e.IpAddress,
                e.UserAgent,
                e.FailureReason,
                e.CreatedAt,
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            total,
            hasMore = offset + limit < total,
            stats = new { loginsToday, failedToday, mfaToday },
        });
    }

    // ── Active Sessions ─────────────────────────────────────────────────

    [HttpGet("sessions")]
    public async Task<IActionResult> GetActiveSessions()
    {
        var recentLogins = await db.LoginEvents
            .AsNoTracking()
            .Where(e => e.Status == "success" && e.CreatedAt > DateTime.UtcNow.AddHours(-24))
            .OrderByDescending(e => e.CreatedAt)
            .Take(200)
            .ToListAsync();

        var sessions = recentLogins
            .GroupBy(e => e.Email)
            .Select(g => g.First())
            .Select(s => new
            {
                s.Email,
                s.UserId,
                s.OrganizationId,
                OrganizationName = (string?)null,
                s.IpAddress,
                s.UserAgent,
                LastSeen = s.CreatedAt,
            })
            .ToList();

        // Resolve org names
        var orgIds = sessions.Where(s => s.OrganizationId.HasValue).Select(s => s.OrganizationId!.Value).Distinct().ToList();
        var orgNames = await db.Organizations.Where(o => orgIds.Contains(o.Id)).ToDictionaryAsync(o => o.Id, o => o.Name);

        var result = sessions.Select(s => new
        {
            s.Email,
            s.UserId,
            s.OrganizationId,
            OrganizationName = s.OrganizationId.HasValue && orgNames.TryGetValue(s.OrganizationId.Value, out var name) ? name : null,
            s.IpAddress,
            s.UserAgent,
            s.LastSeen,
        });

        return Ok(new { count = sessions.Count, items = result });
    }

    // ── Tenant Data Export (GDPR) ───────────────────────────────────────

    [HttpPost("tenants/{id:guid}/export")]
    public async Task<IActionResult> ExportTenantData(Guid id)
    {
        var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);
        if (org is null) return NotFound();

        var users = await db.Users.IgnoreQueryFilters().Where(u => u.OrganizationId == id).AsNoTracking().ToListAsync();
        var decisions = await db.Decisions.IgnoreQueryFilters().Where(d => d.OrganizationId == id).AsNoTracking().ToListAsync();
        var decisionIds = decisions.Select(d => d.Id).ToList();
        var steps = await db.DecisionSteps.IgnoreQueryFilters().Where(s => decisionIds.Contains(s.DecisionId)).AsNoTracking().ToListAsync();
        var documents = await db.Documents.IgnoreQueryFilters().Where(d => d.OrganizationId == id).AsNoTracking().ToListAsync();
        var auditEntries = await db.AuditEntries.IgnoreQueryFilters().Where(a => a.OrganizationId == id).AsNoTracking().ToListAsync();
        var comments = await db.Comments.IgnoreQueryFilters().Where(c => c.OrganizationId == id).AsNoTracking().ToListAsync();
        var notifications = await db.Notifications.IgnoreQueryFilters().Where(n => n.OrganizationId == id).AsNoTracking().ToListAsync();
        var ministries = await db.Ministries.IgnoreQueryFilters().Where(m => m.OrganizationId == id).AsNoTracking().ToListAsync();
        var settings = await db.SystemSettings.IgnoreQueryFilters().Where(s => s.OrganizationId == id).AsNoTracking().ToListAsync();
        var subscriptions = await db.Subscriptions.IgnoreQueryFilters().Where(s => s.OrganizationId == id).AsNoTracking().ToListAsync();
        var payments = await db.PaymentRecords.IgnoreQueryFilters().Where(p => p.OrganizationId == id).AsNoTracking().ToListAsync();
        var apiKeys = await db.ApiKeys.IgnoreQueryFilters().Where(k => k.OrganizationId == id).AsNoTracking().ToListAsync();
        var loginEvents = await db.LoginEvents.Where(e => e.OrganizationId == id).AsNoTracking().ToListAsync();
        var judicialReviews = await db.JudicialReviews.IgnoreQueryFilters().Where(j => j.OrganizationId == id).AsNoTracking().ToListAsync();

        var exportData = new
        {
            exportedAt = DateTime.UtcNow,
            organization = org,
            users,
            ministries,
            decisions,
            decisionSteps = steps,
            documents,
            auditEntries,
            comments,
            notifications,
            settings,
            subscriptions,
            payments,
            apiKeys = apiKeys.Select(k => new { k.Id, k.Name, k.KeyPrefix, k.Scopes, k.IsActive, k.CreatedAt }),
            loginEvents,
            judicialReviews,
        };

        return Ok(exportData);
    }

    // ── Tenant Data Deletion (GDPR) ────────────────────────────────────

    [HttpPost("tenants/{id:guid}/delete")]
    public async Task<IActionResult> DeleteTenantData(Guid id, [FromBody] DeleteTenantRequest request)
    {
        var org = await db.Organizations.FirstOrDefaultAsync(o => o.Id == id);
        if (org is null) return NotFound();

        if (request.ConfirmSlug != org.Slug)
            return BadRequest(new { message = "Confirmation slug does not match the organization slug." });

        // Delete in dependency order
        var decisionIds = await db.Decisions.IgnoreQueryFilters().Where(d => d.OrganizationId == id).Select(d => d.Id).ToListAsync();

        await db.AuditEntries.IgnoreQueryFilters().Where(a => a.OrganizationId == id).ExecuteDeleteAsync();
        await db.Comments.IgnoreQueryFilters().Where(c => c.OrganizationId == id).ExecuteDeleteAsync();
        await db.Notifications.IgnoreQueryFilters().Where(n => n.OrganizationId == id).ExecuteDeleteAsync();
        await db.Documents.IgnoreQueryFilters().Where(d => d.OrganizationId == id).ExecuteDeleteAsync();
        await db.DecisionSteps.IgnoreQueryFilters().Where(s => decisionIds.Contains(s.DecisionId)).ExecuteDeleteAsync();
        await db.JudicialReviews.IgnoreQueryFilters().Where(j => j.OrganizationId == id).ExecuteDeleteAsync();
        await db.Decisions.IgnoreQueryFilters().Where(d => d.OrganizationId == id).ExecuteDeleteAsync();
        await db.Users.IgnoreQueryFilters().Where(u => u.OrganizationId == id).ExecuteDeleteAsync();
        await db.Ministries.IgnoreQueryFilters().Where(m => m.OrganizationId == id).ExecuteDeleteAsync();
        await db.SystemSettings.IgnoreQueryFilters().Where(s => s.OrganizationId == id).ExecuteDeleteAsync();
        await db.Subscriptions.IgnoreQueryFilters().Where(s => s.OrganizationId == id).ExecuteDeleteAsync();
        await db.PaymentRecords.IgnoreQueryFilters().Where(p => p.OrganizationId == id).ExecuteDeleteAsync();
        await db.ApiKeys.IgnoreQueryFilters().Where(k => k.OrganizationId == id).ExecuteDeleteAsync();
        await db.LoginEvents.Where(e => e.OrganizationId == id).ExecuteDeleteAsync();
        await db.DecisionTypeConfigs.IgnoreQueryFilters().Where(t => t.OrganizationId == id).ExecuteDeleteAsync();
        await db.WorkflowStepTemplates.IgnoreQueryFilters()
            .Where(s => db.WorkflowTemplates.IgnoreQueryFilters().Where(w => w.OrganizationId == id).Select(w => w.Id).Contains(s.WorkflowTemplateId))
            .ExecuteDeleteAsync();
        await db.WorkflowTemplates.IgnoreQueryFilters().Where(w => w.OrganizationId == id).ExecuteDeleteAsync();

        db.Organizations.Remove(org);
        await db.SaveChangesAsync();

        return Ok(new { message = $"Organization '{org.Name}' and all associated data have been permanently deleted." });
    }

    // ── System Health ───────────────────────────────────────────────────

    [HttpGet("health-detailed")]
    public async Task<IActionResult> GetDetailedHealth()
    {
        // Database check
        var dbStatus = "connected";
        long dbResponseMs = 0;
        int tableCount = 0;
        try
        {
            var sw = Stopwatch.StartNew();
            await db.Database.ExecuteSqlRawAsync("SELECT 1");
            sw.Stop();
            dbResponseMs = sw.ElapsedMilliseconds;

            tableCount = await db.Database.SqlQueryRaw<int>(
                "SELECT COUNT(*)::int AS \"Value\" FROM information_schema.tables WHERE table_schema = 'public'"
            ).FirstOrDefaultAsync();
        }
        catch
        {
            dbStatus = "disconnected";
        }

        // Storage check
        var s3Endpoint = configuration["S3:Endpoint"] ?? "";
        var s3Configured = !string.IsNullOrEmpty(s3Endpoint);

        // Email check
        var smtpHost = configuration["Smtp:Host"] ?? "";
        var emailConfigured = !string.IsNullOrEmpty(smtpHost);

        // Payment check
        var paymentConfigured = !string.IsNullOrEmpty(configuration["PlaceToPay:Login"]);

        // Metrics
        var today = DateTime.UtcNow.Date;
        var activeUsers24h = await db.LoginEvents
            .Where(e => e.Status == "success" && e.CreatedAt > DateTime.UtcNow.AddHours(-24))
            .Select(e => e.Email)
            .Distinct()
            .CountAsync();

        var loginsToday = await db.LoginEvents.CountAsync(e => e.CreatedAt >= today);
        var failedToday = await db.LoginEvents.CountAsync(e => e.Status == "failed" && e.CreatedAt >= today);

        // Uptime — use process start time
        var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
        var uptimeStr = $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m";

        return Ok(new
        {
            status = dbStatus == "connected" ? "healthy" : "degraded",
            uptime = uptimeStr,
            database = new
            {
                status = dbStatus,
                responseMs = dbResponseMs,
                tableCount,
            },
            storage = new
            {
                status = s3Configured ? "configured" : "not_configured",
                endpoint = s3Endpoint,
            },
            email = new
            {
                provider = "SMTP",
                configured = emailConfigured,
            },
            payments = new
            {
                provider = "PlaceToPay",
                configured = paymentConfigured,
            },
            metrics = new
            {
                apiRequestsToday = loginsToday, // Approximate via login events
                errorRate = loginsToday > 0 ? Math.Round((double)failedToday / loginsToday * 100, 1) : 0,
                activeUsers24h,
            },
        });
    }

    // ── Sandbox ───────────────────────────────────────────────────────

    [HttpPost("create-sandbox")]
    public async Task<IActionResult> CreateSandbox()
    {
        var existing = await db.Organizations.FirstOrDefaultAsync(o => o.Slug == "sandbox");
        if (existing is not null)
            return Conflict(new { message = "Sandbox organization already exists.", id = existing.Id });

        var now = DateTime.UtcNow;
        var orgId = Guid.NewGuid();

        // Create sandbox organization
        var org = new Organization
        {
            Id = orgId,
            Name = "Sandbox Government (Demo)",
            Slug = "sandbox",
            IsActive = true,
            OnboardingCompleted = true,
            PrimaryColor = "#1D3557",
            AccentColor = "#2A9D8F",
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Organizations.Add(org);

        // Create 5 ministries
        var ministries = new[]
        {
            (Id: Guid.NewGuid(), Name: "Ministry of Finance", Code: "FIN"),
            (Id: Guid.NewGuid(), Name: "Ministry of Education", Code: "EDU"),
            (Id: Guid.NewGuid(), Name: "Ministry of Health", Code: "HLT"),
            (Id: Guid.NewGuid(), Name: "Ministry of Natural Resources", Code: "NTR"),
            (Id: Guid.NewGuid(), Name: "Ministry of Justice", Code: "JUS"),
        };
        foreach (var m in ministries)
        {
            db.Ministries.Add(new Ministry
            {
                Id = m.Id,
                Name = m.Name,
                Code = m.Code,
                OrganizationId = orgId,
                Active = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        // Create 4 demo users
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("demo", 12);
        var demoUsers = new[]
        {
            (Id: Guid.NewGuid(), Email: "demo-minister@sandbox.govdecision.com", Name: "Sarah Mitchell", Role: UserRole.Minister, MinistryId: ministries[0].Id),
            (Id: Guid.NewGuid(), Email: "demo-secretary@sandbox.govdecision.com", Name: "James Rodriguez", Role: UserRole.PermanentSecretary, MinistryId: ministries[0].Id),
            (Id: Guid.NewGuid(), Email: "demo-legal@sandbox.govdecision.com", Name: "Emily Chen", Role: UserRole.LegalAdvisor, MinistryId: ministries[4].Id),
            (Id: Guid.NewGuid(), Email: "demo-auditor@sandbox.govdecision.com", Name: "Robert Williams", Role: UserRole.Auditor, MinistryId: ministries[0].Id),
        };
        foreach (var u in demoUsers)
        {
            db.Users.Add(new User
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Role = u.Role,
                OrganizationId = orgId,
                MinistryId = u.MinistryId,
                PasswordHash = passwordHash,
                Active = true,
                EmailVerified = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        // Create workflow template
        var workflowId = Guid.NewGuid();
        db.WorkflowTemplates.Add(new WorkflowTemplate
        {
            Id = workflowId,
            OrganizationId = orgId,
            Name = "Standard 10-Step Framework",
            IsDefault = true,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        });

        var stepDefs = new (int Num, string Name, string Desc)[]
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
        foreach (var (num, name, desc) in stepDefs)
        {
            db.WorkflowStepTemplates.Add(new WorkflowStepTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowTemplateId = workflowId,
                StepNumber = num,
                Name = name,
                Description = desc,
                IsRequired = true,
            });
        }

        // Create 8 decision types
        var decisionTypes = new (string Code, string TypeName, string Desc)[]
        {
            ("REG", "Regulatory Decision", "Decisions related to regulatory matters"),
            ("FIN", "Financial Decision", "Decisions involving financial matters"),
            ("ADM", "Administrative Decision", "General administrative decisions"),
            ("LIC", "Licensing Decision", "Decisions related to licensing and permits"),
            ("POL", "Policy Decision", "Decisions related to policy changes"),
            ("PLN", "Planning Decision", "Decisions related to development planning"),
            ("ENF", "Enforcement Decision", "Enforcement and compliance decisions"),
            ("ENV", "Environmental Decision", "Environmental impact decisions"),
        };
        foreach (var (code, typeName, desc) in decisionTypes)
        {
            db.DecisionTypeConfigs.Add(new DecisionTypeConfig
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgId,
                Code = code,
                Name = typeName,
                Description = desc,
                DefaultWorkflowId = workflowId,
                IsActive = true,
                CreatedAt = now,
            });
        }

        // Create 6 sample decisions in various states
        var minister = demoUsers[0];
        var secretary = demoUsers[1];
        var legalAdvisor = demoUsers[2];

        var sampleDecisions = new[]
        {
            new { Title = "Trade License Renewal — Island Water Sports Ltd", Type = DecisionType.TradeLicense, Status = DecisionStatus.Draft, CurrentStep = 1, Ministry = ministries[0], CreatedBy = secretary.Id, AssignedTo = (Guid?)null },
            new { Title = "Crown Land Lease Application — Nanny Cay Expansion", Type = DecisionType.CrownLand, Status = DecisionStatus.InProgress, CurrentStep = 4, Ministry = ministries[3], CreatedBy = secretary.Id, AssignedTo = (Guid?)minister.Id },
            new { Title = "Work Permit Appeal — Construction Sector Review", Type = DecisionType.WorkPermit, Status = DecisionStatus.UnderReview, CurrentStep = 8, Ministry = ministries[1], CreatedBy = secretary.Id, AssignedTo = (Guid?)legalAdvisor.Id },
            new { Title = "Financial Aid Grant — Hurricane Recovery Fund", Type = DecisionType.Financial, Status = DecisionStatus.Approved, CurrentStep = 10, Ministry = ministries[0], CreatedBy = minister.Id, AssignedTo = (Guid?)secretary.Id },
            new { Title = "Environmental Impact Assessment — Marina Development", Type = DecisionType.Environmental, Status = DecisionStatus.Published, CurrentStep = 10, Ministry = ministries[3], CreatedBy = secretary.Id, AssignedTo = (Guid?)null },
            new { Title = "Customs Exemption — Medical Equipment Import", Type = DecisionType.CustomsExemption, Status = DecisionStatus.Challenged, CurrentStep = 10, Ministry = ministries[0], CreatedBy = minister.Id, AssignedTo = (Guid?)legalAdvisor.Id },
        };

        var refCounter = 1;
        foreach (var sd in sampleDecisions)
        {
            var decisionId = Guid.NewGuid();
            var refNum = $"DEMO-{now.Year}-{refCounter:D4}";
            refCounter++;

            var isPublic = sd.Status is DecisionStatus.Published or DecisionStatus.Challenged;

            db.Decisions.Add(new Decision
            {
                Id = decisionId,
                ReferenceNumber = refNum,
                Title = sd.Title,
                Description = $"Sample decision for demonstration purposes: {sd.Title}",
                MinistryId = sd.Ministry.Id,
                OrganizationId = orgId,
                DecisionType = sd.Type,
                Status = sd.Status,
                CurrentStep = sd.CurrentStep,
                CreatedBy = sd.CreatedBy,
                AssignedTo = sd.AssignedTo,
                IsPublic = isPublic,
                Deadline = now.AddDays(30),
                CreatedAt = now.AddDays(-15 + refCounter),
                UpdatedAt = now,
            });

            // Create completed steps
            for (int s = 1; s <= sd.CurrentStep; s++)
            {
                var stepStatus = s < sd.CurrentStep
                    ? Domain.Enums.StepStatus.Completed
                    : (sd.Status == DecisionStatus.Draft ? Domain.Enums.StepStatus.NotStarted : Domain.Enums.StepStatus.InProgress);

                if (s < sd.CurrentStep || sd.Status is DecisionStatus.Approved or DecisionStatus.Published or DecisionStatus.Challenged)
                    stepStatus = Domain.Enums.StepStatus.Completed;

                db.DecisionSteps.Add(new DecisionStep
                {
                    Id = Guid.NewGuid(),
                    DecisionId = decisionId,
                    StepNumber = s,
                    Status = stepStatus,
                    StartedAt = now.AddDays(-14 + s),
                    CompletedAt = stepStatus == Domain.Enums.StepStatus.Completed ? now.AddDays(-14 + s + 1) : null,
                    CompletedBy = stepStatus == Domain.Enums.StepStatus.Completed ? secretary.Id : null,
                    Notes = stepStatus == Domain.Enums.StepStatus.Completed ? $"Step {s} completed with all requirements satisfied." : null,
                    CreatedAt = now.AddDays(-14 + s),
                    UpdatedAt = now,
                });
            }

            // Create remaining steps as not started
            for (int s = sd.CurrentStep + 1; s <= 10; s++)
            {
                db.DecisionSteps.Add(new DecisionStep
                {
                    Id = Guid.NewGuid(),
                    DecisionId = decisionId,
                    StepNumber = s,
                    Status = Domain.Enums.StepStatus.NotStarted,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }

            // Add sample comments
            if (sd.CurrentStep >= 3)
            {
                db.Comments.Add(new Comment
                {
                    Id = Guid.NewGuid(),
                    DecisionId = decisionId,
                    UserId = secretary.Id,
                    OrganizationId = orgId,
                    Content = "All supporting documentation has been gathered and verified.",
                    IsInternal = true,
                    CreatedAt = now.AddDays(-10),
                    UpdatedAt = now.AddDays(-10),
                });
            }

            if (sd.CurrentStep >= 6)
            {
                db.Comments.Add(new Comment
                {
                    Id = Guid.NewGuid(),
                    DecisionId = decisionId,
                    UserId = legalAdvisor.Id,
                    OrganizationId = orgId,
                    Content = "Legal review completed. All procedural requirements have been met.",
                    IsInternal = true,
                    CreatedAt = now.AddDays(-5),
                    UpdatedAt = now.AddDays(-5),
                });
            }

            // Add audit entries
            db.AuditEntries.Add(new AuditEntry
            {
                DecisionId = decisionId,
                UserId = sd.CreatedBy,
                OrganizationId = orgId,
                Action = "decision_created",
                IpAddress = "127.0.0.1",
                EntryHash = Guid.NewGuid().ToString("N"),
                CreatedAt = now.AddDays(-15 + refCounter),
            });
        }

        // Create trial subscription
        db.Subscriptions.Add(new Subscription
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Plan = "professional",
            Status = "active",
            MonthlyPrice = 0m,
            Currency = "USD",
            CurrentPeriodStart = now,
            CurrentPeriodEnd = now.AddYears(1),
            CreatedAt = now,
            UpdatedAt = now,
        });

        await db.SaveChangesAsync();

        return Ok(new
        {
            message = "Sandbox environment created successfully.",
            organizationId = orgId,
            slug = "sandbox",
            users = demoUsers.Select(u => new { u.Email, Role = u.Role.ToString() }),
        });
    }

    [HttpPost("reset-sandbox")]
    public async Task<IActionResult> ResetSandbox()
    {
        var org = await db.Organizations.FirstOrDefaultAsync(o => o.Slug == "sandbox");
        if (org is null)
            return NotFound(new { message = "Sandbox organization not found." });

        var orgId = org.Id;

        // Get sandbox user emails to preserve
        var sandboxEmails = new[]
        {
            "demo-minister@sandbox.govdecision.com",
            "demo-secretary@sandbox.govdecision.com",
            "demo-legal@sandbox.govdecision.com",
            "demo-auditor@sandbox.govdecision.com",
        };

        // Delete all data except the demo users
        var decisionIds = await db.Decisions.IgnoreQueryFilters().Where(d => d.OrganizationId == orgId).Select(d => d.Id).ToListAsync();

        await db.AuditEntries.IgnoreQueryFilters().Where(a => a.OrganizationId == orgId).ExecuteDeleteAsync();
        await db.Comments.IgnoreQueryFilters().Where(c => c.OrganizationId == orgId).ExecuteDeleteAsync();
        await db.Notifications.IgnoreQueryFilters().Where(n => n.OrganizationId == orgId).ExecuteDeleteAsync();
        await db.Documents.IgnoreQueryFilters().Where(d => d.OrganizationId == orgId).ExecuteDeleteAsync();
        await db.DecisionSteps.IgnoreQueryFilters().Where(s => decisionIds.Contains(s.DecisionId)).ExecuteDeleteAsync();
        await db.JudicialReviews.IgnoreQueryFilters().Where(j => j.OrganizationId == orgId).ExecuteDeleteAsync();
        await db.Decisions.IgnoreQueryFilters().Where(d => d.OrganizationId == orgId).ExecuteDeleteAsync();

        // Delete non-demo users only
        await db.Users.IgnoreQueryFilters()
            .Where(u => u.OrganizationId == orgId && !sandboxEmails.Contains(u.Email))
            .ExecuteDeleteAsync();

        return Ok(new { message = "Sandbox data reset successfully. Demo users preserved." });
    }

    [HttpGet("sandbox-status")]
    public async Task<IActionResult> GetSandboxStatus()
    {
        var org = await db.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.Slug == "sandbox");
        if (org is null)
            return Ok(new { exists = false });

        var userCount = await db.Users.IgnoreQueryFilters().CountAsync(u => u.OrganizationId == org.Id);
        var decisionCount = await db.Decisions.IgnoreQueryFilters().CountAsync(d => d.OrganizationId == org.Id);

        return Ok(new
        {
            exists = true,
            organizationId = org.Id,
            isActive = org.IsActive,
            userCount,
            decisionCount,
        });
    }

    // ── Demo Requests ────────────────────────────────────────────────────

    [HttpGet("demo-requests")]
    public async Task<IActionResult> GetDemoRequests(
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        [FromQuery] string? status = null)
    {
        var query = db.DemoRequests.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(d => d.Status == status);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Email,
                d.Organization,
                d.JobTitle,
                d.Country,
                d.UserRange,
                d.Message,
                d.PreferredDate,
                d.Status,
                d.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, hasMore = offset + limit < total });
    }

    [HttpPut("demo-requests/{id:guid}/status")]
    public async Task<IActionResult> UpdateDemoRequestStatus(Guid id, [FromBody] UpdateDemoRequestStatusDto request)
    {
        var demoRequest = await db.DemoRequests.FindAsync(id);
        if (demoRequest is null) return NotFound();

        demoRequest.Status = request.Status;
        await db.SaveChangesAsync();

        return Ok(new { demoRequest.Id, demoRequest.Status });
    }

    // ── Announcements ───────────────────────────────────────────────────

    [HttpPost("announcements")]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message is required." });

        var announcement = new PlatformAnnouncement
        {
            Id = Guid.NewGuid(),
            Message = request.Message,
            Type = request.Type ?? "info",
            IsActive = true,
            ExpiresAt = request.ExpiresAt,
            CreatedAt = DateTime.UtcNow,
        };
        db.PlatformAnnouncements.Add(announcement);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAnnouncements), new { }, new
        {
            announcement.Id,
            announcement.Message,
            announcement.Type,
            announcement.IsActive,
            announcement.ExpiresAt,
            announcement.CreatedAt,
        });
    }

    [HttpGet("announcements")]
    public async Task<IActionResult> GetAnnouncements()
    {
        var announcements = await db.PlatformAnnouncements
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(announcements.Select(a => new
        {
            a.Id,
            a.Message,
            a.Type,
            a.IsActive,
            a.ExpiresAt,
            a.CreatedAt,
        }));
    }

    [HttpDelete("announcements/{announcementId:guid}")]
    public async Task<IActionResult> DeleteAnnouncement(Guid announcementId)
    {
        var announcement = await db.PlatformAnnouncements.FindAsync(announcementId);
        if (announcement is null) return NotFound();

        db.PlatformAnnouncements.Remove(announcement);
        await db.SaveChangesAsync();

        return NoContent();
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

public class DeleteTenantRequest
{
    public string ConfirmSlug { get; set; } = null!;
}

public class CreateAnnouncementRequest
{
    public string Message { get; set; } = null!;
    public string? Type { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdatePlatformConfigRequest
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public class UpdateDemoRequestStatusDto
{
    public string Status { get; set; } = null!;
}
