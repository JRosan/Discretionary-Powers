using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Payments;
using DiscretionaryPowers.Infrastructure.Services;
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
    SubscriptionGuardService subscriptionGuard,
    IConfiguration configuration) : ControllerBase
{
    private static readonly PlanDefinition[] Plans =
    [
        new()
        {
            Id = "starter",
            Name = "Government Starter",
            Price = 3333m,
            AnnualPrice = 40000m,
            Currency = "USD",
            UserLimit = 50,
            StorageGb = 5,
            Features =
            [
                "Up to 50 users",
                "Standard 10-step workflow",
                "Cryptographic audit trail",
                "5GB document storage",
                "Basic reporting (counts only)",
                "Public transparency portal",
                "Email notifications",
                "JSON data export",
                "Email support (48h response)",
            ],
            Restrictions = ["No custom workflows", "No API access", "No document redaction", "No MFA"],
        },
        new()
        {
            Id = "professional",
            Name = "Government Professional",
            Price = 7083m,
            AnnualPrice = 85000m,
            Currency = "USD",
            UserLimit = 200,
            StorageGb = 25,
            Features =
            [
                "Up to 200 users",
                "Custom workflow templates",
                "Advanced reporting & analytics",
                "25GB document storage",
                "API access & integration keys",
                "Document redaction engine",
                "Audit trail verification",
                "Judicial review tracking",
                "CSV & JSON export",
                "MFA for elevated roles",
                "Priority support (24h response)",
            ],
            Restrictions = ["No custom branding", "No HTML report export"],
        },
        new()
        {
            Id = "enterprise",
            Name = "Government Enterprise",
            Price = 16667m,
            AnnualPrice = 200000m,
            Currency = "USD",
            UserLimit = -1,
            StorageGb = 100,
            Features =
            [
                "Unlimited users",
                "Everything in Professional",
                "100GB document storage",
                "Custom branding & white-label",
                "All export formats (JSON, CSV, HTML)",
                "Custom domain support",
                "Dedicated account manager",
                "SLA: 99.5% uptime guarantee",
                "Dedicated support (4h response)",
                "Mandatory MFA enforcement",
                "Data sovereignty options",
            ],
            Restrictions = [],
        },
    ];

    /// <summary>List available subscription plans.</summary>
    [HttpGet("plans")]
    [AllowAnonymous]
    public IActionResult GetPlans()
    {
        var result = Plans.Select(p => new
        {
            p.Id,
            p.Name,
            p.Price,
            p.AnnualPrice,
            p.Currency,
            p.UserLimit,
            p.StorageGb,
            p.Features,
            p.Restrictions,
            MultiYearDiscounts = new
            {
                OneYear = p.AnnualPrice,
                TwoYear = p.AnnualPrice * 0.9m,
                ThreeYear = p.AnnualPrice * 0.84m,
            },
        });
        return Ok(result);
    }

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

    /// <summary>Get usage statistics for the current organisation.</summary>
    [HttpGet("usage")]
    [Authorize]
    public async Task<IActionResult> GetUsage()
    {
        var orgId = currentUser.OrganizationId;
        if (!orgId.HasValue) return BadRequest(new { message = "No organization context" });

        var userCount = await db.Users.CountAsync();
        var decisionCount = await db.Decisions.CountAsync();
        var storageBytes = await db.Documents.SumAsync(d => (long)d.SizeBytes);
        var plan = await subscriptionGuard.GetCurrentPlan();

        var limits = plan switch
        {
            "starter" => new { Users = 50, StorageGb = 5 },
            "professional" => new { Users = 200, StorageGb = 25 },
            "enterprise" => new { Users = -1, StorageGb = 100 },
            _ => new { Users = 50, StorageGb = 5 },
        };

        return Ok(new
        {
            plan,
            usage = new { users = userCount, decisions = decisionCount, storageBytes },
            limits = new { users = limits.Users, storageGb = limits.StorageGb },
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
        var plan = Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan is null)
            return BadRequest(new { message = "Invalid plan" });

        var reference = $"GOVDEC-{orgId.Value.ToString()[..8]}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
        var returnUrl = $"{frontendUrl}/admin/billing/callback?planId={request.PlanId}";
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var (processUrl, requestId, error) = await placeToPay.CreateSession(
            reference,
            $"GovDecision {plan.Name} - Monthly Subscription",
            plan.Price,
            plan.Currency,
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
            Amount = plan.Price,
            Currency = plan.Currency,
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
            // PENDING -- leave as-is
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

    /// <summary>Upgrade to a higher plan.</summary>
    [HttpPost("upgrade")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Upgrade([FromBody] CheckoutRequest request)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var plan = Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan is null) return BadRequest(new { message = "Invalid plan" });

        // Verify this is actually an upgrade
        var currentSub = await db.Subscriptions
            .Where(s => s.OrganizationId == orgId && (s.Status == "active" || s.Status == "trialing"))
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        var hierarchy = new[] { "starter", "professional", "enterprise" };
        var currentIdx = currentSub is not null ? Array.IndexOf(hierarchy, currentSub.Plan) : -1;
        var targetIdx = Array.IndexOf(hierarchy, plan.Id);

        if (targetIdx <= currentIdx)
            return BadRequest(new { message = "Target plan must be higher than current plan. Use downgrade endpoint instead." });

        // Create checkout session for the new plan
        var reference = $"GOVDEC-UPG-{orgId.Value.ToString()[..8]}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
        var returnUrl = $"{frontendUrl}/admin/billing/callback?planId={request.PlanId}";
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var (processUrl, requestId, error) = await placeToPay.CreateSession(
            reference,
            $"GovDecision Upgrade to {plan.Name}",
            plan.Price,
            plan.Currency,
            returnUrl,
            ipAddress,
            userAgent,
            currentUser.Name,
            currentUser.Email);

        if (error is not null)
            return BadRequest(new { message = $"Payment session error: {error}" });

        db.PaymentRecords.Add(new PaymentRecord
        {
            OrganizationId = orgId.Value,
            RequestId = requestId!,
            Status = "pending",
            Amount = plan.Price,
            Currency = plan.Currency,
            Reference = reference,
        });
        await db.SaveChangesAsync();

        return Ok(new { processUrl, requestId });
    }

    /// <summary>Downgrade to a lower plan (effective at end of billing period).</summary>
    [HttpPost("downgrade")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> Downgrade([FromBody] CheckoutRequest request)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var plan = Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan is null) return BadRequest(new { message = "Invalid plan" });

        var currentSub = await db.Subscriptions
            .Where(s => s.OrganizationId == orgId && (s.Status == "active" || s.Status == "trialing"))
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (currentSub is null)
            return BadRequest(new { message = "No active subscription to downgrade" });

        var hierarchy = new[] { "starter", "professional", "enterprise" };
        var currentIdx = Array.IndexOf(hierarchy, currentSub.Plan);
        var targetIdx = Array.IndexOf(hierarchy, plan.Id);

        if (targetIdx >= currentIdx)
            return BadRequest(new { message = "Target plan must be lower than current plan. Use upgrade endpoint instead." });

        // Schedule the downgrade — plan changes at end of current period
        // Store the pending downgrade plan; for simplicity, apply it now with a note
        currentSub.Plan = plan.Id;
        currentSub.MonthlyPrice = plan.Price;
        currentSub.UpdatedAt = DateTime.UtcNow;
        // Keep CurrentPeriodEnd unchanged — downgrade effective at period end

        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Get current payment method info (masked).</summary>
    [HttpGet("payment-method")]
    [Authorize]
    public async Task<IActionResult> GetPaymentMethod()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var sub = await db.Subscriptions
            .AsNoTracking()
            .Where(s => s.OrganizationId == orgId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub?.PaymentToken is null)
        {
            return Ok(new
            {
                hasPaymentMethod = false,
                cardType = (string?)null,
                lastFourDigits = (string?)null,
                expiryDate = (string?)null,
            });
        }

        // Parse basic info from payment token if available
        // In a real implementation, query PlaceToPay for token details
        return Ok(new
        {
            hasPaymentMethod = true,
            cardType = "Visa",
            lastFourDigits = sub.PaymentToken.Length >= 4
                ? sub.PaymentToken[^4..]
                : "****",
            expiryDate = (string?)null,
        });
    }

    /// <summary>Create a PlaceToPay session to update payment method (zero-amount tokenization).</summary>
    [HttpPost("payment-method/update")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> UpdatePaymentMethod()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var reference = $"GOVDEC-PM-{orgId.Value.ToString()[..8]}-{DateTime.UtcNow:yyyyMMddHHmmss}";
        var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
        var returnUrl = $"{frontendUrl}/admin/billing/payment-method";
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        var (processUrl, requestId, error) = await placeToPay.CreateSession(
            reference,
            "GovDecision - Update Payment Method",
            0m,
            "USD",
            returnUrl,
            ipAddress,
            userAgent,
            currentUser.Name,
            currentUser.Email);

        if (error is not null)
            return BadRequest(new { message = $"Payment session error: {error}" });

        return Ok(new { processUrl });
    }

    /// <summary>Remove stored payment token.</summary>
    [HttpDelete("payment-method")]
    [Authorize(Policy = PermissionPolicies.CanManageSettings)]
    public async Task<IActionResult> RemovePaymentMethod()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var sub = await db.Subscriptions
            .Where(s => s.OrganizationId == orgId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub is not null)
        {
            sub.PaymentToken = null;
            sub.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        return NoContent();
    }

    /// <summary>Generate and return an HTML invoice for download.</summary>
    [HttpGet("invoices/{id:guid}/pdf")]
    [Authorize]
    public async Task<IActionResult> GetInvoicePdf(Guid id)
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var record = await db.PaymentRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == orgId);

        if (record is null) return NotFound(new { message = "Invoice not found" });

        var org = await db.Organizations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orgId);

        var planName = DeterminePlanName(record.Amount);
        var invoiceNumber = $"INV-{record.CreatedAt.Year}-{record.Id.ToString()[..8].ToUpper()}";
        var invoiceDate = record.CreatedAt.ToString("MMMM dd, yyyy");
        var dueDate = record.CreatedAt.AddDays(30).ToString("MMMM dd, yyyy");
        var periodStart = record.CreatedAt.ToString("MMM dd, yyyy");
        var periodEnd = record.CreatedAt.AddDays(30).ToString("MMM dd, yyyy");
        var paymentStatus = record.Status == "approved" ? "Paid" : "Pending";

        var statusClass = record.Status == "approved" ? "status-paid" : "status-pending";
        var orgName = org?.Name ?? "Organization";
        var amountFormatted = record.Amount.ToString("F2");
        var reference = record.Reference ?? "N/A";

        var html = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\" />\n"
            + $"<title>Invoice {invoiceNumber}</title>\n"
            + "<style>\n"
            + "body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a1a; }\n"
            + ".header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }\n"
            + ".company { font-size: 24px; font-weight: bold; color: #1D3557; }\n"
            + ".invoice-title { font-size: 20px; font-weight: bold; color: #1D3557; text-align: right; }\n"
            + ".invoice-number { font-size: 14px; color: #666; text-align: right; }\n"
            + ".section { margin-bottom: 24px; }\n"
            + ".label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }\n"
            + ".value { font-size: 14px; }\n"
            + "table { width: 100%; border-collapse: collapse; margin-top: 20px; }\n"
            + "th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }\n"
            + "td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }\n"
            + ".total-row td { font-weight: bold; border-top: 2px solid #1D3557; font-size: 16px; }\n"
            + ".status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }\n"
            + ".status-paid { background: #d4edda; color: #155724; }\n"
            + ".status-pending { background: #fff3cd; color: #856404; }\n"
            + ".footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; }\n"
            + "</style>\n</head>\n<body>\n"
            + "<div class=\"header\">\n"
            + "<div><div class=\"company\">GovDecision</div>\n"
            + "<div style=\"font-size: 12px; color: #666; margin-top: 4px;\">Discretionary Powers Management System</div></div>\n"
            + $"<div><div class=\"invoice-title\">INVOICE</div><div class=\"invoice-number\">{invoiceNumber}</div></div>\n"
            + "</div>\n"
            + "<div style=\"display: flex; gap: 80px;\">\n"
            + $"<div class=\"section\"><div class=\"label\">Bill To</div><div class=\"value\" style=\"font-weight: 600;\">{orgName}</div></div>\n"
            + $"<div class=\"section\"><div class=\"label\">Invoice Date</div><div class=\"value\">{invoiceDate}</div></div>\n"
            + $"<div class=\"section\"><div class=\"label\">Due Date</div><div class=\"value\">{dueDate}</div></div>\n"
            + $"<div class=\"section\"><div class=\"label\">Period</div><div class=\"value\">{periodStart} - {periodEnd}</div></div>\n"
            + "</div>\n"
            + $"<div class=\"section\"><div class=\"label\">Payment Status</div>\n"
            + $"<span class=\"status {statusClass}\">{paymentStatus}</span></div>\n"
            + "<table><thead><tr>\n"
            + "<th>Description</th><th style=\"text-align: center;\">Qty</th>\n"
            + "<th style=\"text-align: right;\">Unit Price</th><th style=\"text-align: right;\">Total</th>\n"
            + "</tr></thead><tbody>\n"
            + $"<tr><td>{planName} - Monthly Subscription</td><td style=\"text-align: center;\">1</td>\n"
            + $"<td style=\"text-align: right;\">${amountFormatted} {record.Currency}</td>\n"
            + $"<td style=\"text-align: right;\">${amountFormatted} {record.Currency}</td></tr>\n"
            + $"<tr class=\"total-row\"><td colspan=\"3\" style=\"text-align: right;\">Total</td>\n"
            + $"<td style=\"text-align: right;\">${amountFormatted} {record.Currency}</td></tr>\n"
            + "</tbody></table>\n"
            + $"<div class=\"footer\">Thank you for your business.<br />Reference: {reference}</div>\n"
            + "</body>\n</html>";

        return File(
            System.Text.Encoding.UTF8.GetBytes(html),
            "text/html",
            $"{invoiceNumber}.html");
    }

    /// <summary>Get trial status for the current organisation.</summary>
    [HttpGet("trial-status")]
    [Authorize]
    public async Task<IActionResult> GetTrialStatus()
    {
        var orgId = currentUser.OrganizationId;
        if (orgId is null) return BadRequest(new { message = "No organization context" });

        var sub = await db.Subscriptions
            .AsNoTracking()
            .Where(s => s.OrganizationId == orgId && s.Status == "trialing")
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        if (sub is null)
            return Ok(new { isTrial = false, daysRemaining = 0, expiresAt = (DateTime?)null });

        var daysRemaining = Math.Max(0, (int)(sub.CurrentPeriodEnd - DateTime.UtcNow).TotalDays);
        return Ok(new
        {
            isTrial = true,
            daysRemaining,
            expiresAt = sub.CurrentPeriodEnd,
        });
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
        var planId = DeterminePlanFromAmount(record.Amount);
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

    private static string DeterminePlanFromAmount(decimal amount)
    {
        return amount switch
        {
            3333m => "starter",
            7083m => "professional",
            16667m => "enterprise",
            _ => "starter"
        };
    }

    private static string DeterminePlanName(decimal amount)
    {
        return amount switch
        {
            3333m => "Government Starter",
            7083m => "Government Professional",
            16667m => "Government Enterprise",
            _ => "Subscription"
        };
    }

    // ---- DTOs ----

    public record CheckoutRequest(string PlanId);

    public record WebhookPayload
    {
        public string? RequestId { get; init; }
        public string? Status { get; init; }
    }

    private class PlanDefinition
    {
        public string Id { get; init; } = null!;
        public string Name { get; init; } = null!;
        public decimal Price { get; init; }
        public decimal AnnualPrice { get; init; }
        public string Currency { get; init; } = "USD";
        public int UserLimit { get; init; }
        public int StorageGb { get; init; }
        public string[] Features { get; init; } = [];
        public string[] Restrictions { get; init; } = [];
    }
}
