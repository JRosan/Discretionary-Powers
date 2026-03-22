using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Interfaces;

public interface INotificationService
{
    Task<Notification> Create(Guid userId, Guid? decisionId, NotificationType type, string title, string message);
    Task<IReadOnlyList<Notification>> GetByUser(Guid userId, int limit = 50, int offset = 0);
    Task<int> GetUnreadCount(Guid userId);
    Task MarkRead(Guid id);
    Task MarkAllRead(Guid userId);
    Task Delete(Guid id);
}
