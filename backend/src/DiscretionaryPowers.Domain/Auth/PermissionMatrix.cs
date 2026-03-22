using DiscretionaryPowers.Domain.Enums;

namespace DiscretionaryPowers.Domain.Auth;

public static class PermissionMatrix
{
    private static readonly Dictionary<UserRole, Permission[]> Matrix = new()
    {
        [UserRole.Minister] =
        [
            new("decision", "create"),
            new("decision", "read"),
            new("decision", "update"),
            new("decision", "approve"),
            new("decision", "publish"),
            new("report", "read"),
            new("notification", "read"),
        ],
        [UserRole.PermanentSecretary] =
        [
            new("decision", "create"),
            new("decision", "read"),
            new("decision", "update"),
            new("audit_trail", "read"),
            new("user", "create"),
            new("user", "read"),
            new("user", "update"),
            new("user", "delete"),
            new("report", "read"),
            new("notification", "read"),
        ],
        [UserRole.LegalAdvisor] =
        [
            new("decision", "read"),
            new("decision", "provide_opinion"),
            new("audit_trail", "read"),
            new("judicial_review", "flag_review"),
            new("report", "read"),
        ],
        [UserRole.Auditor] =
        [
            new("decision", "read"),
            new("audit_trail", "read"),
            new("audit_trail", "export"),
            new("judicial_review", "flag_review"),
            new("report", "read"),
            new("report", "export"),
        ],
        [UserRole.Public] =
        [
            new("decision", "read"),
        ],
    };

    public static bool HasPermission(UserRole role, string resource, string action)
    {
        if (!Matrix.TryGetValue(role, out var permissions))
            return false;
        return permissions.Any(p => p.Resource == resource && p.Action == action);
    }

    public static bool CanAccessMinistry(UserRole role, Guid userMinistryId, Guid targetMinistryId)
    {
        if (role is UserRole.LegalAdvisor or UserRole.Auditor)
            return true;
        if (role is UserRole.Minister or UserRole.PermanentSecretary)
            return userMinistryId == targetMinistryId;
        return false;
    }

    public static Permission[] GetPermissions(UserRole role) =>
        Matrix.TryGetValue(role, out var permissions) ? [.. permissions] : [];
}
