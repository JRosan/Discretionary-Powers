using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class Document
{
    public Guid Id { get; set; }
    public Guid DecisionId { get; set; }
    public string Filename { get; set; } = null!;
    public string OriginalFilename { get; set; } = null!;
    public string MimeType { get; set; } = null!;
    public int SizeBytes { get; set; }
    public string StorageKey { get; set; } = null!;
    public DocumentClassification Classification { get; set; }
    public Guid UploadedBy { get; set; }
    public int Version { get; set; } = 1;
    public bool IsRedacted { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Decision Decision { get; set; } = null!;
    public User Uploader { get; set; } = null!;
}
