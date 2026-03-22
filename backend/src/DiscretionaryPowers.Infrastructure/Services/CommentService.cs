using DiscretionaryPowers.Application.DTOs.Comments;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Services;

public class CommentService(AppDbContext db) : ICommentService
{
    public async Task<Comment> Create(Guid decisionId, Guid userId, string content, bool isInternal)
    {
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            DecisionId = decisionId,
            UserId = userId,
            Content = content,
            IsInternal = isInternal,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        return comment;
    }

    public async Task<IReadOnlyList<Comment>> GetByDecision(Guid decisionId, bool includeInternal = false)
    {
        var q = db.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .Where(c => c.DecisionId == decisionId);

        if (!includeInternal)
            q = q.Where(c => !c.IsInternal);

        return await q
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task Delete(Guid id)
    {
        var comment = await db.Comments.FindAsync(id);
        if (comment is not null)
        {
            db.Comments.Remove(comment);
            await db.SaveChangesAsync();
        }
    }

    public async Task<int> Count(Guid decisionId)
    {
        return await db.Comments.CountAsync(c => c.DecisionId == decisionId);
    }

    public async Task<Comment?> GetById(Guid id)
    {
        return await db.Comments
            .AsNoTracking()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public static CommentResponse MapToResponse(Comment c) => new()
    {
        Id = c.Id,
        DecisionId = c.DecisionId,
        UserId = c.UserId,
        Content = c.Content,
        IsInternal = c.IsInternal,
        UserName = c.User?.Name ?? "Unknown",
        UserRole = c.User?.Role.ToString().ToLowerInvariant() ?? "unknown",
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt,
    };
}
