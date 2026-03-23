using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var byStatus = await db.Decisions
            .AsNoTracking()
            .GroupBy(d => d.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var byMinistry = await db.Decisions
            .AsNoTracking()
            .Include(d => d.Ministry)
            .GroupBy(d => d.Ministry!.Name)
            .Select(g => new { Ministry = g.Key, Count = g.Count() })
            .ToListAsync();

        var overTime = await db.Decisions
            .AsNoTracking()
            .GroupBy(d => new { d.CreatedAt.Year, d.CreatedAt.Month })
            .Select(g => new
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Count = g.Count()
            })
            .OrderBy(x => x.Month)
            .ToListAsync();

        // Step completion times — fetch completed steps and compute averages in memory
        // because TimeSpan arithmetic doesn't translate to SQL in Npgsql
        var completedSteps = await db.DecisionSteps
            .AsNoTracking()
            .Where(s => s.CompletedAt != null && s.StartedAt != null)
            .Select(s => new { s.StepNumber, s.StartedAt, s.CompletedAt })
            .ToListAsync();

        var stepTimes = completedSteps
            .GroupBy(s => s.StepNumber)
            .Select(g => new
            {
                Step = g.Key,
                AvgDays = Math.Round(g.Average(s => (s.CompletedAt!.Value - s.StartedAt!.Value).TotalDays), 1)
            })
            .OrderBy(x => x.Step)
            .ToList();

        var total = await db.Decisions.CountAsync();

        return Ok(new
        {
            total,
            byStatus = byStatus.ToDictionary(x => x.Status.ToString(), x => x.Count),
            byMinistry = byMinistry.Select(x => new { name = x.Ministry, count = x.Count }),
            overTime = overTime.Select(x => new { month = x.Month, count = x.Count }),
            stepTimes = stepTimes.Select(x => new { step = x.Step, avgDays = x.AvgDays })
        });
    }
}
