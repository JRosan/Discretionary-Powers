using System.Text.Json;
using DiscretionaryPowers.Domain.Entities;

namespace DiscretionaryPowers.Domain.Interfaces;

public interface IAuditService
{
    Task<AuditEntry> Log(Guid? decisionId, Guid userId, string action, int? stepNumber, JsonDocument? detail, string? ipAddress);
    Task<IReadOnlyList<AuditEntry>> GetByDecision(Guid decisionId);
    Task<IReadOnlyList<AuditEntry>> GetByUser(Guid userId);
    Task<IReadOnlyList<AuditEntry>> GetAll(int limit = 100, int offset = 0);
}
