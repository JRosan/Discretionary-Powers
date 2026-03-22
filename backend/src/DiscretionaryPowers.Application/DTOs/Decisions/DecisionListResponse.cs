namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class DecisionListResponse
{
    public List<DecisionResponse> Items { get; set; } = [];
    public bool HasMore { get; set; }
    public string? NextCursor { get; set; }
}
