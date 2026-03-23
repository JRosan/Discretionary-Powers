using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/judicial-reviews")]
[Authorize]
public class JudicialReviewsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var reviews = await db.JudicialReviews
            .AsNoTracking()
            .Include(r => r.Decision)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews.Select(r => new
        {
            r.Id,
            r.DecisionId,
            DecisionTitle = r.Decision?.Title,
            DecisionReference = r.Decision?.ReferenceNumber,
            Ground = r.Ground.ToString().ToLowerInvariant(),
            r.Status,
            FiledDate = r.FiledDate.ToString("yyyy-MM-dd"),
            r.CourtReference,
            r.Outcome,
            r.Notes,
            r.CreatedAt,
        }));
    }
}
