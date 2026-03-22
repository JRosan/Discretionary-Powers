using System.Text.Json;
using DiscretionaryPowers.Infrastructure.Crypto;
using FluentAssertions;

namespace DiscretionaryPowers.Application.Tests;

public class AuditHashServiceTests
{
    private static readonly Guid TestDecisionId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    private static readonly Guid TestUserId = Guid.Parse("11111111-2222-3333-4444-555555555555");
    private static readonly DateTime TestDate = new(2026, 1, 15, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ComputeHash_ReturnsNonEmptyString()
    {
        var hash = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, null, TestDate);

        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void ComputeHash_ReturnsConsistentResults_ForSameInput()
    {
        var hash1 = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, "prevhash", TestDate);
        var hash2 = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, "prevhash", TestDate);

        hash1.Should().Be(hash2);
    }

    [Fact]
    public void ComputeHash_ReturnsDifferentResults_ForDifferentInputs()
    {
        var hash1 = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, null, TestDate);
        var hash2 = AuditHashService.ComputeAuditHash(
            2, TestDecisionId, TestUserId, "update", null, null, TestDate);

        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void ComputeHash_UsesGenesis_ForNullPreviousHash()
    {
        var hashWithNull = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, null, TestDate);
        var hashWithGenesis = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, "GENESIS", TestDate);

        hashWithNull.Should().Be(hashWithGenesis);
    }

    [Fact]
    public void VerifyHash_CorrectlyValidatesKnownHash()
    {
        var hash = AuditHashService.ComputeAuditHash(
            1, TestDecisionId, TestUserId, "create", null, null, TestDate);

        var isValid = AuditHashService.VerifyAuditHash(
            1, TestDecisionId, TestUserId, "create", null, null, hash, TestDate);

        isValid.Should().BeTrue();
    }
}
