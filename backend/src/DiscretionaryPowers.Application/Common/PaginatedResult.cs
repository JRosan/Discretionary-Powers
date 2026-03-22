namespace DiscretionaryPowers.Application.Common;

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = [];
    public bool HasMore { get; set; }
    public string? NextCursor { get; set; }
}
