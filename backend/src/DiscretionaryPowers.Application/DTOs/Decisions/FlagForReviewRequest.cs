using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class FlagForReviewRequest
{
    [Required]
    public string Ground { get; set; } = null!;

    [MaxLength(5000)]
    public string? Notes { get; set; }
}
