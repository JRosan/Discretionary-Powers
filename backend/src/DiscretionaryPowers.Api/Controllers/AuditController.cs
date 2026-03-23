using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController(AuditService auditService, AppDbContext db) : ControllerBase
{
    [HttpGet("decisions/{decisionId:guid}")]
    [Authorize(Policy = PermissionPolicies.CanViewAuditTrail)]
    public async Task<IActionResult> GetByDecision(Guid decisionId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        var entries = await auditService.GetAll(limit, offset);
        var filtered = entries.Where(e => e.DecisionId == decisionId).ToList();
        return Ok(filtered);
    }

    [HttpGet]
    [Authorize(Policy = PermissionPolicies.CanViewAllAudit)]
    public async Task<IActionResult> GetAll([FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        var entries = await auditService.GetAll(limit, offset);
        return Ok(entries);
    }

    [HttpGet("conflicts")]
    [Authorize(Policy = PermissionPolicies.CanViewAllAudit)]
    public async Task<IActionResult> GetConflictDeclarations()
    {
        var step6Data = await db.DecisionSteps
            .AsNoTracking()
            .Where(s => s.StepNumber == 6 && s.Status == Domain.Enums.StepStatus.Completed && s.Data != null)
            .Include(s => s.Decision)
            .OrderByDescending(s => s.CompletedAt)
            .Select(s => new
            {
                DecisionId = s.DecisionId,
                DecisionTitle = s.Decision != null ? s.Decision.Title : null,
                DecisionReference = s.Decision != null ? s.Decision.ReferenceNumber : null,
                CompletedAt = s.CompletedAt,
                CompletedBy = s.CompletedBy,
                StepData = s.Data
            })
            .ToListAsync();

        return Ok(step6Data);
    }

    [HttpPost("verify-chain")]
    [Authorize(Policy = PermissionPolicies.CanViewAllAudit)]
    public async Task<IActionResult> VerifyChain()
    {
        var (valid, checkedCount, firstInvalidId) = await auditService.VerifyChain();
        return Ok(new { valid, checkedCount, firstInvalidId });
    }
}
