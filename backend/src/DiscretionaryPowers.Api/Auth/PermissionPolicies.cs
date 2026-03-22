namespace DiscretionaryPowers.Api.Auth;

public static class PermissionPolicies
{
    public const string CanCreateDecision = nameof(CanCreateDecision);
    public const string CanApproveDecision = nameof(CanApproveDecision);
    public const string CanFlagForReview = nameof(CanFlagForReview);
    public const string CanManageUsers = nameof(CanManageUsers);
    public const string CanViewAuditTrail = nameof(CanViewAuditTrail);
    public const string CanViewAllAudit = nameof(CanViewAllAudit);
}
