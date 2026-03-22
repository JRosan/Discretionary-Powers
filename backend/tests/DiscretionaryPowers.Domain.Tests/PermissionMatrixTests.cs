using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Enums;
using FluentAssertions;

namespace DiscretionaryPowers.Domain.Tests;

public class PermissionMatrixTests
{
    [Fact]
    public void Minister_CanCreateDecisions()
    {
        PermissionMatrix.HasPermission(UserRole.Minister, "decision", "create")
            .Should().BeTrue();
    }

    [Fact]
    public void Auditor_CannotCreateDecisions()
    {
        PermissionMatrix.HasPermission(UserRole.Auditor, "decision", "create")
            .Should().BeFalse();
    }

    [Fact]
    public void Public_CannotCreateDecisions()
    {
        PermissionMatrix.HasPermission(UserRole.Public, "decision", "create")
            .Should().BeFalse();
    }

    [Fact]
    public void LegalAdvisor_CanProvideOpinions()
    {
        PermissionMatrix.HasPermission(UserRole.LegalAdvisor, "decision", "provide_opinion")
            .Should().BeTrue();
    }

    [Fact]
    public void Auditor_CanExportAuditData()
    {
        PermissionMatrix.HasPermission(UserRole.Auditor, "audit_trail", "export")
            .Should().BeTrue();
    }

    [Fact]
    public void PermanentSecretary_CanManageUsers()
    {
        PermissionMatrix.HasPermission(UserRole.PermanentSecretary, "user", "create").Should().BeTrue();
        PermissionMatrix.HasPermission(UserRole.PermanentSecretary, "user", "read").Should().BeTrue();
        PermissionMatrix.HasPermission(UserRole.PermanentSecretary, "user", "update").Should().BeTrue();
        PermissionMatrix.HasPermission(UserRole.PermanentSecretary, "user", "delete").Should().BeTrue();
    }

    [Fact]
    public void Minister_CanApproveDecisions()
    {
        PermissionMatrix.HasPermission(UserRole.Minister, "decision", "approve")
            .Should().BeTrue();
    }

    [Fact]
    public void CanAccessMinistry_ReturnsTrueForOwnMinistry_Minister()
    {
        var ministryId = Guid.NewGuid();

        PermissionMatrix.CanAccessMinistry(UserRole.Minister, ministryId, ministryId)
            .Should().BeTrue();
    }

    [Fact]
    public void CanAccessMinistry_ReturnsTrueForAllMinistries_Auditor()
    {
        var userMinistry = Guid.NewGuid();
        var otherMinistry = Guid.NewGuid();

        PermissionMatrix.CanAccessMinistry(UserRole.Auditor, userMinistry, otherMinistry)
            .Should().BeTrue();
    }

    [Fact]
    public void CanAccessMinistry_ReturnsFalseForOtherMinistry_Minister()
    {
        var userMinistry = Guid.NewGuid();
        var otherMinistry = Guid.NewGuid();

        PermissionMatrix.CanAccessMinistry(UserRole.Minister, userMinistry, otherMinistry)
            .Should().BeFalse();
    }
}
