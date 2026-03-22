namespace DiscretionaryPowers.Application.DTOs.Comments;

public class CommentResponse
{
    public Guid Id { get; set; }
    public Guid DecisionId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = null!;
    public bool IsInternal { get; set; }
    public string UserName { get; set; } = null!;
    public string UserRole { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
