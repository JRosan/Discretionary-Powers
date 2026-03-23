using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DiscretionaryPowers.Infrastructure.Services;

public class UsageAlertService(
    AppDbContext db,
    INotificationService notificationService,
    IEmailService emailService,
    ILogger<UsageAlertService> logger)
{
    /// <summary>
    /// Check user count and storage against plan limits and create alerts as needed.
    /// </summary>
    public async Task CheckAndAlert(Guid orgId)
    {
        try
        {
            var sub = await db.Subscriptions
                .AsNoTracking()
                .Where(s => s.OrganizationId == orgId && (s.Status == "active" || s.Status == "trialing"))
                .FirstOrDefaultAsync();

            if (sub is null) return;

            var (userLimit, storageGbLimit) = GetPlanLimits(sub.Plan);

            // Check user limit
            if (userLimit > 0)
            {
                var userCount = await db.Users.CountAsync();
                var userPct = (double)userCount / userLimit * 100;

                var admin = await GetOrgAdmin(orgId);
                if (admin is null) return;

                if (userPct >= 100)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "User limit reached",
                        $"User limit of {userLimit} reached for your {sub.Plan} plan. Upgrade to add more users.");
                }
                else if (userPct >= 90)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "User limit warning",
                        $"You're using {userCount} of {userLimit} users (90%). Consider upgrading your plan.");

                    if (admin.Email is not null)
                    {
                        await emailService.SendEmail(
                            admin.Email,
                            "Usage Alert: User Limit at 90%",
                            $"Your organization is using {userCount} of {userLimit} users. Consider upgrading your plan to avoid disruption.");
                    }
                }
                else if (userPct >= 80)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "User limit notice",
                        $"You're using {userCount} of {userLimit} users (80%). Monitor your usage.");
                }
            }

            // Check storage limit
            if (storageGbLimit > 0)
            {
                var storageBytes = await db.Documents.SumAsync(d => (long)d.SizeBytes);
                var storageLimitBytes = (long)storageGbLimit * 1024 * 1024 * 1024;
                var storagePct = (double)storageBytes / storageLimitBytes * 100;

                var admin = await GetOrgAdmin(orgId);
                if (admin is null) return;

                if (storagePct >= 100)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "Storage limit reached",
                        $"Storage limit of {storageGbLimit}GB reached. Upgrade to add more storage.");
                }
                else if (storagePct >= 90)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "Storage limit warning",
                        $"You're using 90% of your {storageGbLimit}GB storage. Consider upgrading.");

                    if (admin.Email is not null)
                    {
                        await emailService.SendEmail(
                            admin.Email,
                            "Usage Alert: Storage at 90%",
                            $"Your organization is using 90% of its {storageGbLimit}GB storage limit. Consider upgrading your plan.");
                    }
                }
                else if (storagePct >= 80)
                {
                    await notificationService.Create(
                        admin.Id, null, NotificationType.StatusChange,
                        "Storage notice",
                        $"You're using 80% of your {storageGbLimit}GB storage. Monitor your usage.");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking usage alerts for org {OrgId}", orgId);
        }
    }

    /// <summary>
    /// Check if a trial is expiring within 3 days.
    /// </summary>
    public async Task CheckTrialExpiry(Guid orgId)
    {
        try
        {
            var sub = await db.Subscriptions
                .AsNoTracking()
                .Where(s => s.OrganizationId == orgId && s.Status == "trialing")
                .FirstOrDefaultAsync();

            if (sub is null) return;

            var daysRemaining = (sub.CurrentPeriodEnd - DateTime.UtcNow).TotalDays;
            if (daysRemaining is > 0 and <= 3)
            {
                var admin = await GetOrgAdmin(orgId);
                if (admin is null) return;

                await notificationService.Create(
                    admin.Id, null, NotificationType.StatusChange,
                    "Trial expiring soon",
                    $"Your free trial expires in {(int)daysRemaining} day(s). Subscribe to continue using GovDecision.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking trial expiry for org {OrgId}", orgId);
        }
    }

    /// <summary>
    /// Check if subscription renewal is within 7 days.
    /// </summary>
    public async Task CheckRenewalReminder(Guid orgId)
    {
        try
        {
            var sub = await db.Subscriptions
                .AsNoTracking()
                .Where(s => s.OrganizationId == orgId && s.Status == "active")
                .FirstOrDefaultAsync();

            if (sub is null) return;

            var daysUntilRenewal = (sub.CurrentPeriodEnd - DateTime.UtcNow).TotalDays;
            if (daysUntilRenewal is > 0 and <= 7)
            {
                var admin = await GetOrgAdmin(orgId);
                if (admin is null) return;

                await notificationService.Create(
                    admin.Id, null, NotificationType.StatusChange,
                    "Subscription renewal reminder",
                    $"Your subscription renews in {(int)daysUntilRenewal} day(s). Ensure your payment method is up to date.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking renewal reminder for org {OrgId}", orgId);
        }
    }

    private async Task<User?> GetOrgAdmin(Guid orgId)
    {
        return await db.Users
            .Where(u => u.OrganizationId == orgId && u.Role == UserRole.PermanentSecretary && u.Active)
            .FirstOrDefaultAsync();
    }

    private static (int UserLimit, int StorageGb) GetPlanLimits(string plan)
    {
        return plan switch
        {
            "starter" => (50, 5),
            "professional" => (200, 25),
            "enterprise" => (-1, 100),
            _ => (50, 5),
        };
    }
}
