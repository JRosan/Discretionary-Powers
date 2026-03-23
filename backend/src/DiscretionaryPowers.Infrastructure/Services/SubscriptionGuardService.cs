using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class SubscriptionGuardService(AppDbContext db, ITenantService tenantService)
{
    public async Task<string> GetCurrentPlan()
    {
        var orgId = tenantService.CurrentTenantId;
        if (!orgId.HasValue) return "starter";

        var sub = await db.Subscriptions
            .Where(s => s.OrganizationId == orgId.Value && s.Status == "active")
            .FirstOrDefaultAsync();

        return sub?.Plan ?? "starter"; // Default to starter if no subscription
    }

    public async Task<bool> IsPlanAtLeast(string minimumPlan)
    {
        var current = await GetCurrentPlan();
        var hierarchy = new[] { "starter", "professional", "enterprise" };
        var currentIndex = Array.IndexOf(hierarchy, current);
        var requiredIndex = Array.IndexOf(hierarchy, minimumPlan);
        return currentIndex >= requiredIndex;
    }

    public async Task<(bool Allowed, string? Error)> CheckUserLimit()
    {
        var plan = await GetCurrentPlan();
        var limit = plan switch
        {
            "starter" => 50,
            "professional" => 200,
            "enterprise" => int.MaxValue,
            _ => 50,
        };

        var orgId = tenantService.CurrentTenantId;
        if (!orgId.HasValue) return (false, "No organization context");

        var count = await db.Users.CountAsync();
        if (count >= limit)
            return (false, $"User limit of {limit} reached for your {plan} plan. Please upgrade.");

        return (true, null);
    }

    public async Task<(bool Allowed, string? Error)> CheckStorageLimit(long additionalBytes)
    {
        var plan = await GetCurrentPlan();
        var limitGb = plan switch
        {
            "starter" => 5L,
            "professional" => 25L,
            "enterprise" => 100L,
            _ => 5L,
        };

        var limitBytes = limitGb * 1024 * 1024 * 1024;
        var orgId = tenantService.CurrentTenantId;
        if (!orgId.HasValue) return (false, "No organization context");

        var usedBytes = await db.Documents.SumAsync(d => (long)d.SizeBytes);
        if (usedBytes + additionalBytes > limitBytes)
            return (false, $"Storage limit of {limitGb}GB reached for your {plan} plan. Please upgrade.");

        return (true, null);
    }

    public async Task<bool> CanUseFeature(string feature)
    {
        var plan = await GetCurrentPlan();
        return feature switch
        {
            "custom_workflows" => plan is "professional" or "enterprise",
            "api_keys" => plan is "professional" or "enterprise",
            "document_redaction" => plan is "professional" or "enterprise",
            "audit_verification" => plan is "professional" or "enterprise",
            "judicial_review" => plan is "professional" or "enterprise",
            "advanced_reports" => plan is "professional" or "enterprise",
            "mfa" => plan is "professional" or "enterprise",
            "csv_export" => plan is "professional" or "enterprise",
            "html_export" => plan == "enterprise",
            "custom_branding" => plan == "enterprise",
            "custom_domain" => plan == "enterprise",
            _ => true, // Unknown features default to allowed
        };
    }
}
