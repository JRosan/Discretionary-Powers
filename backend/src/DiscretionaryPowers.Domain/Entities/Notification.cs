using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? DecisionId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool Read { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Decision? Decision { get; set; }
}
