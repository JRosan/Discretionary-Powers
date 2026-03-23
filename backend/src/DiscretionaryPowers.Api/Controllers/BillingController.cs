using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController(
    AppDbContext db,
    ICurrentUserService currentUser,
    PlaceToPayService placeToPay,
    IConfiguration configuration) : ControllerBase
{
    private static readonly object[] Plans =
    [
        new
        {
            id = "starter",
            name = "Government Starter",
            price = 399m,
            currency = "USD",
            features = new[]
            {
                "Up to 50 users", "10-step workflow", "5GB document storage", "Email support"
            }
        },
        new
        {
            id = "professional",
            name = "Government Professional",
            price = 799m,
            currency = "USD",
            features = new[]
            {
                "Up to 200 users", "Custom workflows", "25GB storage", "Priority support",
                "API access"
            }
        },
        new
        {
            id = "enterprise",
            name = "Government Enterprise",
            price = 1499m,
            currency = "USD",
            features = new[]
            {
                "Unlimited users", "Custom workflows", "100GB storage", "Dedicated support",
                "API access", "Custom branding", "SLA guarantee"
            }
        }
    ];

    /// <summary>List available subscription plans.</summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    public IActionResult GetPlans() => Ok(Plans);

    /// <summary>Get the current organisation's subscription.</summary>
    [HttpGet("subscription")]
    [Authorize]
    public async Task<IActionResult> GetSubscription()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var sub = await db.Subscriptions
            .AsNoTracking()
            .Where(s => s.OrganizationId == orgId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub is null)
            return Ok(new { plan = (string?)null, status = "none" });

        return Ok(new
        {
            id = sub.Id,
            plan = sub.Plan,
            status = sub.Status,
            monthlyPrice = sub.MonthlyPrice,
            currency = sub.Currency,
            currentPeriodStart = sub.CurrentPeriodStart,
            currentPeriodEnd = sub.CurrentPeriodEnd,
            cancelledAt = sub.CancelledAt,
            createdAt = sub.CreatedAt,
        });
    }

    /// <summary>Create a PlaceToPay checkout session for a plan.</summary>
    [HttpPost("checkout")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        // Find plan
        var plan = Plans.Cast<dynamic>().FirstOrDefault(p => (string)p.id == request.PlanId);
        if (plan is null)
            return BadRequest(new { message = "Invalid plan" });

        var reference = $"GOVDEC-{orgId.Value.ToString()[..8]}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
        var returnUrl = $"{frontendUrl}/admin/billing/callback?planId={request.PlanId}";
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var (processUrl, requestId, error) = await placeToPay.CreateSession(
            reference,
            $"GovDecision {plan.name} - Monthly Subscription",
            (decimal)plan.price,
            (string)plan.currency,
            returnUrl,
            ipAddress,
            userAgent,
            currentUser.Name,
            currentUser.Email);

        if (error is not null)
            return BadRequest(new { message = $"Payment session error: {error}" });

        // Persist payment record
        db.PaymentRecords.Add(new PaymentRecord
        {
            OrganizationId = orgId.Value,
            RequestId = requestId!,
            Status = "pending",
            Amount = (decimal)plan.price,
            Currency = (string)plan.currency,
            Reference = reference,
        });
        await db.SaveChangesAsync();

        return Ok(new { processUrl, requestId });
    }

    /// <summary>Check payment status from PlaceToPay and update records.</summary>
    [HttpGet("checkout/{requestId}/status")]
    [Authorize]
    public async Task<IActionResult> CheckStatus(string requestId)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var record = await db.PaymentRecords
            .FirstOrDefaultAsync(p => p.RequestId == requestId && p.OrganizationId == orgId);

        if (record is null)
            return NotFound(new { message = "Payment record not found" });

        // If already finalised, return cached status
        if (record.Status is "approved" or "rejected" or "expired")
        {
            return Ok(new { status = record.Status, placeToPayStatus = record.PlaceToPayStatus });
        }

        // Query PlaceToPay for live status
        var result = await placeToPay.GetSessionStatus(requestId);
        record.PlaceToPayStatus = result.Status;

        switch (result.Status)
        {
            case "APPROVED":
                record.Status = "approved";
                record.PaidAt = DateTime.UtcNow;
                await ActivateSubscription(record);
                break;
            case "REJECTED":
                record.Status = "rejected";
                break;
            case "EXPIRED":
                record.Status = "expired";
                break;
            // PENDING — leave as-is
        }

        await db.SaveChangesAsync();
        return Ok(new { status = record.Status, placeToPayStatus = record.PlaceToPayStatus });
    }

    /// <summary>PlaceToPay webhook notification endpoint.</summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook([FromBody] WebhookPayload payload)
    {
        if (string.IsNullOrEmpty(payload.RequestId))
            return BadRequest();

        var record = await db.PaymentRecords
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.RequestId == payload.RequestId);

        if (record is null)
            return NotFound();

        if (record.Status is "approved" or "rejected" or "expired")
            return Ok();

        var result = await placeToPay.GetSessionStatus(payload.RequestId);
        record.PlaceToPayStatus = result.Status;

        switch (result.Status)
        {
            case "APPROVED":
                record.Status = "approved";
                record.PaidAt = DateTime.UtcNow;
                await ActivateSubscription(record);
                break;
            case "REJECTED":
                record.Status = "rejected";
                break;
            case "EXPIRED":
                record.Status = "expired";
                break;
        }

        await db.SaveChangesAsync();
        return Ok();
    }

    /// <summary>List payment history / invoices.</summary>
    [HttpGet("invoices")]
    [Authorize]
    public async Task<IActionResult> GetInvoices()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var records = await db.PaymentRecords
            .AsNoTracking()
            .Where(p => p.OrganizationId == orgId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .Select(p => new
            {
                p.Id,
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

        return Ok(records);
    }

    /// <summary>Cancel the current subscription.</summary>
    [HttpPost("cancel")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Cancel()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var sub = await db.Subscriptions
            .Where(s => s.OrganizationId == orgId && s.Status == "active")
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub is null)
            return BadRequest(new { message = "No active subscription to cancel" });

        sub.Status = "cancelled";
        sub.CancelledAt = DateTime.UtcNow;
        sub.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---- helpers ----

    private async Task ActivateSubscription(PaymentRecord record)
    {
        // Find plan info from the reference
        var planId = await DeterminePlanFromAmount(record.Amount);
        var now = DateTime.UtcNow;

        // Check for existing active subscription
        var existing = await db.Subscriptions
            .Where(s => s.OrganizationId == record.OrganizationId && s.Status == "active")
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            // Upgrade existing subscription
            existing.Plan = planId;
            existing.MonthlyPrice = record.Amount;
            existing.Currency = record.Currency;
            existing.CurrentPeriodStart = now;
            existing.CurrentPeriodEnd = now.AddDays(30);
            existing.UpdatedAt = now;
            record.SubscriptionId = existing.Id;
        }
        else
        {
            // Create new subscription
            var sub = new Subscription
            {
                OrganizationId = record.OrganizationId,
                Plan = planId,
                Status = "active",
                MonthlyPrice = record.Amount,
                Currency = record.Currency,
                CurrentPeriodStart = now,
                CurrentPeriodEnd = now.AddDays(30),
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.Subscriptions.Add(sub);
            // Save to get the ID before assigning it
            await db.SaveChangesAsync();
            record.SubscriptionId = sub.Id;
        }
    }

    private static Task<string> DeterminePlanFromAmount(decimal amount)
    {
        return Task.FromResult(amount switch
        {
            399m => "starter",
            799m => "professional",
            1499m => "enterprise",
            _ => "starter"
        });
    }

    // ---- DTOs ----

    public record CheckoutRequest(string PlanId);

    public record WebhookPayload
    {
        public string? RequestId { get; init; }
        public string? Status { get; init; }
    }
}
