using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Auth;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Email { get; }
    string Name { get; }
    UserRole Role { get; }
    Guid? MinistryId { get; }
}
