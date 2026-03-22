namespace DiscretionaryPowers.Application.DTOs.Documents;

public class UploadUrlResponse
{
    public string UploadUrl { get; set; } = null!;
    public string StorageKey { get; set; } = null!;
    public Guid DocumentId { get; set; }
}
