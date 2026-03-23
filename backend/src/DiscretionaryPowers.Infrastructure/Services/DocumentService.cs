using DiscretionaryPowers.Application.Common;
using DiscretionaryPowers.Application.DTOs.Documents;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class DocumentService(AppDbContext db, IStorageAdapter storage, ITenantService tenantService) : IDocumentService
{
    public async Task<ServiceResult<UploadUrlResponse>> GetUploadUrl(
        Guid decisionId, string filename, string contentType, string classification, Guid uploadedBy)
    {
        if (!Enum.TryParse<DocumentClassification>(classification, true, out var cls))
            return ServiceResult<UploadUrlResponse>.Fail("Invalid document classification.");

        var storageKey = $"decisions/{decisionId}/{Guid.NewGuid()}/{filename}";

        var document = new Document
        {
            Id = Guid.NewGuid(),
            DecisionId = decisionId,
            OrganizationId = tenantService.CurrentTenantId ?? Guid.Empty,
            Filename = filename,
            OriginalFilename = filename,
            MimeType = contentType,
            SizeBytes = 0,
            StorageKey = storageKey,
            Classification = cls,
            UploadedBy = uploadedBy,
            CreatedAt = DateTime.UtcNow,
        };

        db.Documents.Add(document);
        await db.SaveChangesAsync();

        var uploadUrl = await storage.GetUploadUrl(storageKey, contentType);

        return ServiceResult<UploadUrlResponse>.Ok(new UploadUrlResponse
        {
            UploadUrl = uploadUrl,
            StorageKey = storageKey,
            DocumentId = document.Id,
        });
    }

    public async Task<ServiceResult<DocumentResponse>> ConfirmUpload(Guid documentId, int sizeBytes)
    {
        var doc = await db.Documents.FindAsync(documentId);
        if (doc is null)
            return ServiceResult<DocumentResponse>.Fail("Document not found.");

        doc.SizeBytes = sizeBytes;
        await db.SaveChangesAsync();

        return ServiceResult<DocumentResponse>.Ok(MapToResponse(doc));
    }

    public async Task<List<DocumentResponse>> GetByDecision(Guid decisionId)
    {
        var docs = await db.Documents
            .AsNoTracking()
            .Where(d => d.DecisionId == decisionId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return docs.Select(MapToResponse).ToList();
    }

    public async Task<ServiceResult<object>> GetDownloadUrl(Guid documentId)
    {
        var doc = await db.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == documentId);
        if (doc is null)
            return ServiceResult<object>.Fail("Document not found.");

        var url = await storage.GetDownloadUrl(doc.StorageKey);
        return ServiceResult<object>.Ok(new { url, filename = doc.OriginalFilename });
    }

    public async Task<ServiceResult<bool>> Delete(Guid documentId)
    {
        var doc = await db.Documents.FindAsync(documentId);
        if (doc is null)
            return ServiceResult<bool>.Fail("Document not found.");

        await storage.DeleteObject(doc.StorageKey);
        db.Documents.Remove(doc);
        await db.SaveChangesAsync();

        return ServiceResult<bool>.Ok(true);
    }

    // IDocumentService interface methods
    async Task<Document> IDocumentService.Create(Guid decisionId, string filename, string originalFilename, string mimeType, int sizeBytes, string storageKey, DocumentClassification classification, Guid uploadedBy)
    {
        var doc = new Document
        {
            Id = Guid.NewGuid(),
            DecisionId = decisionId,
            OrganizationId = tenantService.CurrentTenantId ?? Guid.Empty,
            Filename = filename,
            OriginalFilename = originalFilename,
            MimeType = mimeType,
            SizeBytes = sizeBytes,
            StorageKey = storageKey,
            Classification = classification,
            UploadedBy = uploadedBy,
            CreatedAt = DateTime.UtcNow,
        };
        db.Documents.Add(doc);
        await db.SaveChangesAsync();
        return doc;
    }

    async Task<IReadOnlyList<Document>> IDocumentService.GetByDecision(Guid decisionId) =>
        await db.Documents.AsNoTracking().Where(d => d.DecisionId == decisionId).ToListAsync();

    async Task<Document?> IDocumentService.GetById(Guid id) =>
        await db.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);

    async Task IDocumentService.Delete(Guid id)
    {
        var doc = await db.Documents.FindAsync(id);
        if (doc is not null)
        {
            db.Documents.Remove(doc);
            await db.SaveChangesAsync();
        }
    }

    async Task<string> IDocumentService.GetUploadUrl(string key, string contentType) =>
        await storage.GetUploadUrl(key, contentType);

    async Task IDocumentService.ConfirmUpload(Guid documentId)
    {
        var doc = await db.Documents.FindAsync(documentId);
        if (doc is not null)
            await db.SaveChangesAsync();
    }

    private static DocumentResponse MapToResponse(Document d) => new()
    {
        Id = d.Id,
        DecisionId = d.DecisionId,
        Filename = d.Filename,
        OriginalFilename = d.OriginalFilename,
        MimeType = d.MimeType,
        SizeBytes = d.SizeBytes,
        StorageKey = d.StorageKey,
        Classification = d.Classification.ToString().ToLowerInvariant(),
        UploadedBy = d.UploadedBy,
        Version = d.Version,
        IsRedacted = d.IsRedacted,
        RedactionNotes = d.RedactionNotes,
        CreatedAt = d.CreatedAt,
    };
}
