using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Comments;

public class CreateCommentRequest
{
    [Required]
    public Guid DecisionId { get; set; }

    [Required, MinLength(1), MaxLength(5000)]
    public string Content { get; set; } = null!;

    public bool IsInternal { get; set; }
}
