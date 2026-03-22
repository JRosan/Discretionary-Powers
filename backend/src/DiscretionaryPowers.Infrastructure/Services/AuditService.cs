using System.Text.Json;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Crypto;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class AuditService(AppDbContext db) : IAuditService
{
    public async Task<AuditEntry> Log(Guid? decisionId, Guid userId, string action, int? stepNumber, JsonDocument? detail, string? ipAddress)
    {
        var lastHash = await db.AuditEntries
            .OrderByDescending(a => a.Id)
            .Select(a => a.EntryHash)
            .FirstOrDefaultAsync();

        var entry = new AuditEntry
        {
            DecisionId = decisionId,
            UserId = userId,
            Action = action,
            StepNumber = stepNumber,
            Detail = detail,
            IpAddress = ipAddress,
            PreviousHash = lastHash,
            CreatedAt = DateTime.UtcNow,
        };

        db.AuditEntries.Add(entry);
        await db.SaveChangesAsync();

        entry.EntryHash = AuditHashService.ComputeAuditHash(
            entry.Id, entry.DecisionId, entry.UserId,
            entry.Action, entry.Detail, entry.PreviousHash, entry.CreatedAt);

        await db.SaveChangesAsync();

        return entry;
    }

    public async Task<IReadOnlyList<AuditEntry>> GetByDecision(Guid decisionId)
    {
        return await db.AuditEntries
            .AsNoTracking()
            .Where(a => a.DecisionId == decisionId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<AuditEntry>> GetByUser(Guid userId)
    {
        return await db.AuditEntries
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<AuditEntry>> GetAll(int limit = 100, int offset = 0)
    {
        return await db.AuditEntries
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<(bool Valid, int CheckedCount, string? FirstInvalidId)> VerifyChain()
    {
        var entries = await db.AuditEntries
            .AsNoTracking()
            .OrderBy(a => a.Id)
            .ToListAsync();

        string? previousHash = null;
        for (var i = 0; i < entries.Count; i++)
        {
            var entry = entries[i];

            if (entry.PreviousHash != previousHash)
                return (false, i, entry.Id.ToString());

            var valid = AuditHashService.VerifyAuditHash(
                entry.Id, entry.DecisionId, entry.UserId,
                entry.Action, entry.Detail, entry.PreviousHash,
                entry.EntryHash, entry.CreatedAt);

            if (!valid)
                return (false, i, entry.Id.ToString());

            previousHash = entry.EntryHash;
        }

        return (true, entries.Count, null);
    }
}
