namespace DiscretionaryPowers.Application.DTOs.Documents;

public class DocumentResponse
{
    public Guid Id { get; set; }
    public Guid DecisionId { get; set; }
    public string Filename { get; set; } = null!;
    public string OriginalFilename { get; set; } = null!;
    public string MimeType { get; set; } = null!;
    public int SizeBytes { get; set; }
    public string StorageKey { get; set; } = null!;
    public string Classification { get; set; } = null!;
    public Guid UploadedBy { get; set; }
    public int Version { get; set; }
    public bool IsRedacted { get; set; }
    public DateTime CreatedAt { get; set; }
}
