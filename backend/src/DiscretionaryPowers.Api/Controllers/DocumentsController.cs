using System.Text.Json;
using DiscretionaryPowers.Application.DTOs.Documents;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController(
    DocumentService documentService,
    IAuditService auditService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("upload-url")]
    public async Task<IActionResult> GetUploadUrl([FromBody] GetUploadUrlRequest request)
    {
        var result = await documentService.GetUploadUrl(
            request.DecisionId, request.Filename, request.ContentType,
            request.Classification, currentUser.UserId);

        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(request.DecisionId, currentUser.UserId, "document.upload_initiated", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { request.Filename, request.Classification, result.Data!.DocumentId })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(result.Data);
    }

    [HttpPost("{documentId:guid}/confirm-upload")]
    public async Task<IActionResult> ConfirmUpload(Guid documentId, [FromBody] ConfirmUploadRequest request)
    {
        var result = await documentService.ConfirmUpload(documentId, request.SizeBytes);
        if (!result.Success) return BadRequest(new { message = result.Error });

        await auditService.Log(result.Data!.DecisionId, currentUser.UserId, "document.upload_confirmed", null,
            JsonDocument.Parse(JsonSerializer.Serialize(new { documentId, request.SizeBytes })),
            HttpContext.Connection.RemoteIpAddress?.ToString());

        return Ok(result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid decisionId)
    {
        var docs = await documentService.GetByDecision(decisionId);
        return Ok(docs);
    }

    [HttpGet("{documentId:guid}/download-url")]
    public async Task<IActionResult> GetDownloadUrl(Guid documentId)
    {
        var result = await documentService.GetDownloadUrl(documentId);
        if (!result.Success) return NotFound(new { message = result.Error });
        return Ok(result.Data);
    }

    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> Delete(Guid documentId)
    {
        var result = await documentService.Delete(documentId);
        if (!result.Success) return NotFound(new { message = result.Error });
        return Ok(new { success = true });
    }
}
