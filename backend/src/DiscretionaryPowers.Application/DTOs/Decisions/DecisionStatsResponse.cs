namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class DecisionStatsResponse
{
    public int Total { get; set; }
    public Dictionary<string, int> ByStatus { get; set; } = new();
}
