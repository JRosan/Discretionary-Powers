using DiscretionaryPowers.Domain.Entities;

namespace DiscretionaryPowers.Domain.Interfaces;

public interface ICommentService
{
    Task<Comment> Create(Guid decisionId, Guid userId, string content, bool isInternal);
    Task<IReadOnlyList<Comment>> GetByDecision(Guid decisionId, bool includeInternal = false);
    Task Delete(Guid id);
    Task<int> Count(Guid decisionId);
}
