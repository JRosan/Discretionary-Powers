namespace DiscretionaryPowers.Domain.Entities;

public class SystemSetting
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public Guid OrganizationId { get; set; }
    public DateTime UpdatedAt { get; set; }
}
