using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController(AuditService auditService) : ControllerBase
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

    [HttpPost("verify-chain")]
    [Authorize(Policy = PermissionPolicies.CanViewAllAudit)]
    public async Task<IActionResult> VerifyChain()
    {
        var (valid, checkedCount, firstInvalidId) = await auditService.VerifyChain();
        return Ok(new { valid, checkedCount, firstInvalidId });
    }
}
