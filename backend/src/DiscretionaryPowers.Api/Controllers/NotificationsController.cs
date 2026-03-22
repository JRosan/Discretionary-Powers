using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(
    NotificationService notificationService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int limit = 20, [FromQuery] int offset = 0)
    {
        var notifications = await notificationService.GetByUser(currentUser.UserId, limit, offset);
        return Ok(notifications.Select(NotificationService.MapToResponse));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await notificationService.GetUnreadCount(currentUser.UserId);
        return Ok(new { count });
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        await notificationService.MarkRead(id);
        return Ok(new { success = true });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await notificationService.MarkAllRead(currentUser.UserId);
        return Ok(new { success = true });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await notificationService.Delete(id);
        return Ok(new { success = true });
    }
}
