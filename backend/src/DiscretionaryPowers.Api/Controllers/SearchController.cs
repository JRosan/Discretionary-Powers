using DiscretionaryPowers.Application.DTOs.Search;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public class SearchController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SearchResultResponse>> Search(
        [FromQuery] string? q,
        [FromQuery] string? type,
        [FromQuery] int limit = 20)
    {
        var result = new SearchResultResponse();

        if (string.IsNullOrWhiteSpace(q))
            return Ok(result);

        var searchTerm = q.Trim();
        var searchType = type?.ToLowerInvariant() ?? "all";
        var take = Math.Clamp(limit, 1, 50);

        if (searchType is "all" or "decisions")
        {
            result.Decisions = await db.Decisions
                .AsNoTracking()
                .Where(d =>
                    EF.Functions.ILike(d.Title, $"%{searchTerm}%") ||
                    (d.Description != null && EF.Functions.ILike(d.Description, $"%{searchTerm}%")) ||
                    EF.Functions.ILike(d.ReferenceNumber, $"%{searchTerm}%"))
                .OrderByDescending(d => d.UpdatedAt)
                .Take(take)
                .Select(d => new SearchDecisionItem
                {
                    Id = d.Id,
                    ReferenceNumber = d.ReferenceNumber,
                    Title = d.Title,
                    Status = d.Status.ToString().ToLower(),
                })
                .ToListAsync();
        }

        if (searchType is "all" or "documents")
        {
            result.Documents = await db.Documents
                .AsNoTracking()
                .Where(d =>
                    EF.Functions.ILike(d.Filename, $"%{searchTerm}%") ||
                    EF.Functions.ILike(d.OriginalFilename, $"%{searchTerm}%"))
                .OrderByDescending(d => d.CreatedAt)
                .Take(take)
                .Select(d => new SearchDocumentItem
                {
                    Id = d.Id,
                    Filename = d.OriginalFilename,
                    Classification = d.Classification.ToString().ToLower(),
                    DecisionId = d.DecisionId,
                })
                .ToListAsync();
        }

        return Ok(result);
    }
}
