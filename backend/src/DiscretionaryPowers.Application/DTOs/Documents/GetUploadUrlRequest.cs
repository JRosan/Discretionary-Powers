using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Documents;

public class GetUploadUrlRequest
{
    [Required]
    public Guid DecisionId { get; set; }

    [Required, MinLength(1)]
    public string Filename { get; set; } = null!;

    [Required, MinLength(1)]
    public string ContentType { get; set; } = null!;

    [Required]
    public string Classification { get; set; } = null!;
}
