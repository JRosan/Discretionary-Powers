using System.Text.Json;
using DiscretionaryPowers.Application.DTOs.Comments;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentsController(
    CommentService commentService,
    IAuditService auditService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCommentRequest request)
    {
        var comment = await commentService.Create(
            request.DecisionId, currentUser.UserId, request.Content, request.IsInternal);

        await auditService.Log(request.DecisionId, currentUser.UserId, "comment.created", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { commentId = comment.Id, request.IsInternal })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(CommentService.MapToResponse(comment));
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid decisionId)
    {
        var includeInternal = currentUser.Role != UserRole.Public;
        var comments = await commentService.GetByDecision(decisionId, includeInternal);
        return Ok(comments.Select(CommentService.MapToResponse));
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count([FromQuery] Guid decisionId)
    {
        var count = await commentService.Count(decisionId);
        return Ok(new { count });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var comment = await commentService.GetById(id);
        if (comment is null) return NotFound();

        if (comment.UserId != currentUser.UserId && currentUser.Role != UserRole.PermanentSecretary)
            return Forbid();

        await commentService.Delete(id);

        await auditService.Log(comment.DecisionId, currentUser.UserId, "comment.deleted", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { commentId = id })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(new { success = true });
    }
}
