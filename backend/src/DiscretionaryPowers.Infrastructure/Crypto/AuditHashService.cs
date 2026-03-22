using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace DiscretionaryPowers.Infrastructure.Crypto;

public static class AuditHashService
{
    public static string ComputeAuditHash(
        long id,
        Guid? decisionId,
        Guid userId,
        string action,
        JsonDocument? detail,
        string? previousHash,
        DateTime createdAt)
    {
        var detailJson = detail != null
            ? detail.RootElement.GetRawText()
            : "{}";

        var payload = string.Join("|",
            id.ToString(),
            decisionId?.ToString() ?? "",
            userId.ToString(),
            action,
            detailJson,
            previousHash ?? "GENESIS",
            createdAt.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));

        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexStringLower(hashBytes);
    }

    public static bool VerifyAuditHash(
        long id,
        Guid? decisionId,
        Guid userId,
        string action,
        JsonDocument? detail,
        string? previousHash,
        string entryHash,
        DateTime createdAt)
    {
        var computed = ComputeAuditHash(id, decisionId, userId, action, detail, previousHash, createdAt);
        return computed == entryHash;
    }
}
