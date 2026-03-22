using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace DiscretionaryPowers.Application.DTOs.Decisions;

public class AdvanceStepRequest
{
    [Required]
    public int StepNumber { get; set; }

    [Required]
    public string Action { get; set; } = null!;

    [MaxLength(2000)]
    public string? SkipReason { get; set; }

    public JsonElement? Data { get; set; }

    [MaxLength(5000)]
    public string? Notes { get; set; }
}
