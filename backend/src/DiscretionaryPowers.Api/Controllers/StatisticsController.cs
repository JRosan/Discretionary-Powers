using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/statistics")]
public class StatisticsController(DecisionService decisionService) : ControllerBase
{
    [HttpGet("public")]
    public async Task<IActionResult> GetPublicStats()
    {
        var stats = await decisionService.GetStats();
        return Ok(stats);
    }
}
