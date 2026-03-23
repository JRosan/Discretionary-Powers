namespace DiscretionaryPowers.Domain.Entities;

public class Ministry
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Code { get; set; } = null!;
    public bool Active { get; set; } = true;
    public Guid OrganizationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public ICollection<Decision> Decisions { get; set; } = [];
    public ICollection<User> Users { get; set; } = [];
}
