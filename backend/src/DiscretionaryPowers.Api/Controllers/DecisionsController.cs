using System.Text.Json;
using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Decisions;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/decisions")]
[Authorize]
public class DecisionsController(
    DecisionService decisionService,
    ExportService exportService,
    IAuditService auditService,
    SubscriptionGuardService subscriptionGuard,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = PermissionPolicies.CanCreateDecision)]
    public async Task<IActionResult> Create([FromBody] CreateDecisionRequest request)
    {
        var result = await decisionService.Create(request, currentUser.UserId);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(result.Data!.Id, currentUser.UserId, "decision.created", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { request.Title, request.DecisionType })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet]
    public async Task<ActionResult<DecisionListResponse>> List([FromQuery] ListDecisionsQuery query)
    {
        var result = await decisionService.List(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await decisionService.GetById(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:guid}/advance-step")]
    public async Task<IActionResult> AdvanceStep(Guid id, [FromBody] AdvanceStepRequest request)
    {
        var result = await decisionService.AdvanceStep(id, request, currentUser.UserId);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(id, currentUser.UserId, $"step.{request.Action}", request.StepNumber,
            JsonDocument.Parse(JsonSerializer.Serialize(new { request.Action, request.StepNumber, request.SkipReason })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(result.Data);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = PermissionPolicies.CanApproveDecision)]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveDecisionRequest request)
    {
        var result = await decisionService.Approve(id, request.Notes);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(id, currentUser.UserId, "decision.approved", null,
            request.Notes is not null ? JsonDocument.Parse(JsonSerializer.Serialize(new { request.Notes })) : null,
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/publish")]
    [Authorize(Policy = PermissionPolicies.CanApproveDecision)]
    public async Task<IActionResult> Publish(Guid id)
    {
        var result = await decisionService.Publish(id);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(id, currentUser.UserId, "decision.published", null, null,
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/flag-for-review")]
    [Authorize(Policy = PermissionPolicies.CanFlagForReview)]
    public async Task<IActionResult> FlagForReview(Guid id, [FromBody] FlagForReviewRequest request)
    {
        var result = await decisionService.FlagForReview(id, request, currentUser.UserId);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(id, currentUser.UserId, "decision.flagged_for_review", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { request.Ground, request.Notes })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(result.Data);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DecisionStatsResponse>> GetStats()
    {
        var result = await decisionService.GetStats();
        return Ok(result);
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicList()
    {
        var result = await decisionService.GetPublicList();
        return Ok(result);
    }

    [HttpGet("public/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicById(Guid id)
    {
        var result = await decisionService.GetPublicById(id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id:guid}/export")]
    public async Task<IActionResult> Export(Guid id, [FromQuery] string format = "json")
    {
        var fmt = format.ToLowerInvariant();
        if (fmt == "csv" && !await subscriptionGuard.CanUseFeature("csv_export"))
            return StatusCode(403, new { message = "CSV export requires a Professional or Enterprise plan." });
        if (fmt == "html" && !await subscriptionGuard.CanUseFeature("html_export"))
            return StatusCode(403, new { message = "HTML export requires an Enterprise plan." });

        return fmt switch
        {
            "json" => File(await exportService.ExportAsJson(id), "application/json", $"decision-{id}.json"),
            "csv" => File(await exportService.ExportAsCsv(id), "text/csv", $"decision-{id}.csv"),
            "html" => File(await exportService.ExportAsHtml(id), "text/html", $"decision-{id}.html"),
            _ => BadRequest(new { message = "Unsupported format. Use json, csv, or html." }),
        };
    }
}
