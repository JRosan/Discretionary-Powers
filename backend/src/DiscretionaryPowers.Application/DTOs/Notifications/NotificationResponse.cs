namespace DiscretionaryPowers.Application.DTOs.Notifications;

public class NotificationResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? DecisionId { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool Read { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
}
