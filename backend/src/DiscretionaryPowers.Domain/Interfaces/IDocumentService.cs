using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Interfaces;

public interface IDocumentService
{
    Task<Document> Create(Guid decisionId, string filename, string originalFilename, string mimeType, int sizeBytes, string storageKey, DocumentClassification classification, Guid uploadedBy);
    Task<IReadOnlyList<Document>> GetByDecision(Guid decisionId);
    Task<Document?> GetById(Guid id);
    Task Delete(Guid id);
    Task<string> GetUploadUrl(string key, string contentType);
    Task ConfirmUpload(Guid documentId);
}
