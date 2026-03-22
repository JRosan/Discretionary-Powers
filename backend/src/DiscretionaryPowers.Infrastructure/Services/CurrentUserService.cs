using System.Security.Claims;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace DiscretionaryPowers.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal User => httpContextAccessor.HttpContext?.User
        ?? throw new InvalidOperationException("No authenticated user.");

    public Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("User ID claim not found."));

    public string Email => User.FindFirstValue(ClaimTypes.Email)
        ?? throw new InvalidOperationException("Email claim not found.");

    public string Name => User.FindFirstValue("name")
        ?? throw new InvalidOperationException("Name claim not found.");

    public UserRole Role => Enum.Parse<UserRole>(User.FindFirstValue(ClaimTypes.Role)
        ?? throw new InvalidOperationException("Role claim not found."), ignoreCase: true);

    public Guid? MinistryId
    {
        get
        {
            var value = User.FindFirstValue("ministry_id");
            return value is not null ? Guid.Parse(value) : null;
        }
    }
}
