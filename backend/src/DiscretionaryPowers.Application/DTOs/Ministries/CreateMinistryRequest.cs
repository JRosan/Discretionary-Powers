using System.ComponentModel.DataAnnotations;

namespace DiscretionaryPowers.Application.DTOs.Ministries;

public class CreateMinistryRequest
{
    [Required, MinLength(1)]
    public string Name { get; set; } = null!;

    [Required, MinLength(1)]
    public string Code { get; set; } = null!;
}
