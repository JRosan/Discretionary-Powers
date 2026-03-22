using DiscretionaryPowers.Application.DTOs.Notifications;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class NotificationService(AppDbContext db) : INotificationService
{
    public async Task<Notification> Create(Guid userId, Guid? decisionId, NotificationType type, string title, string message)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DecisionId = decisionId,
            Type = type,
            Title = title,
            Message = message,
            SentAt = DateTime.UtcNow,
        };

        db.Notifications.Add(notification);
        await db.SaveChangesAsync();

        return notification;
    }

    public async Task<IReadOnlyList<Notification>> GetByUser(Guid userId, int limit = 50, int offset = 0)
    {
        return await db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.SentAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCount(Guid userId)
    {
        return await db.Notifications
            .CountAsync(n => n.UserId == userId && !n.Read);
    }

    public async Task MarkRead(Guid id)
    {
        var notification = await db.Notifications.FindAsync(id);
        if (notification is not null)
        {
            notification.Read = true;
            notification.ReadAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    public async Task MarkAllRead(Guid userId)
    {
        await db.Notifications
            .Where(n => n.UserId == userId && !n.Read)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Read, true)
                .SetProperty(n => n.ReadAt, DateTime.UtcNow));
    }

    public async Task Delete(Guid id)
    {
        var notification = await db.Notifications.FindAsync(id);
        if (notification is not null)
        {
            db.Notifications.Remove(notification);
            await db.SaveChangesAsync();
        }
    }

    public List<NotificationResponse> MapToResponses(IReadOnlyList<Notification> notifications) =>
        notifications.Select(MapToResponse).ToList();

    public static NotificationResponse MapToResponse(Notification n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        DecisionId = n.DecisionId,
        Type = n.Type.ToString().ToLowerInvariant(),
        Title = n.Title,
        Message = n.Message,
        Read = n.Read,
        SentAt = n.SentAt,
        ReadAt = n.ReadAt,
    };
}
