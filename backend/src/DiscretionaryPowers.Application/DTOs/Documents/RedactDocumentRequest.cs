namespace DiscretionaryPowers.Application.DTOs.Documents;

public class RedactDocumentRequest
{
    public bool IsRedacted { get; set; }
    public string? RedactionNotes { get; set; }
}
