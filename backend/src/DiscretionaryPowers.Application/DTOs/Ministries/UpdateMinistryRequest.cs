namespace DiscretionaryPowers.Application.DTOs.Ministries;

public class UpdateMinistryRequest
{
    public string? Name { get; set; }
    public string? Code { get; set; }
    public bool? Active { get; set; }
}
