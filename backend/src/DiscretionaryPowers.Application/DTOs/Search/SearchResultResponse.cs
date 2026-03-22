namespace DiscretionaryPowers.Application.DTOs.Search;

public class SearchResultResponse
{
    public List<SearchDecisionItem> Decisions { get; set; } = [];
    public List<SearchDocumentItem> Documents { get; set; } = [];
}

public class SearchDecisionItem
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
}

public class SearchDocumentItem
{
    public Guid Id { get; set; }
    public string Filename { get; set; } = null!;
    public string Classification { get; set; } = null!;
    public Guid DecisionId { get; set; }
}
