using System.Text.Json;
using DiscretionaryPowers.Application.Common;
using DiscretionaryPowers.Application.DTOs.Decisions;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Domain.Workflow;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DiscretionaryPowers.Infrastructure.Services;

public class DecisionService(
    AppDbContext db,
    INotificationService notificationService,
    IEmailService emailService,
    ILogger<DecisionService> logger)
{
    private static string GenerateReferenceNumber(string ministryCode)
    {
        var year = DateTime.UtcNow.Year;
        var seq = Random.Shared.Next(1000, 9999);
        return $"DP-{ministryCode}-{year}-{seq}";
    }

    public async Task<ServiceResult<DecisionResponse>> Create(CreateDecisionRequest request, Guid userId)
    {
        if (!Enum.TryParse<DecisionType>(request.DecisionType, true, out var decisionType))
            return ServiceResult<DecisionResponse>.Fail("Invalid decision type.");

        var ministry = await db.Ministries.FindAsync(request.MinistryId);
        if (ministry is null)
            return ServiceResult<DecisionResponse>.Fail("Ministry not found.");

        var referenceNumber = GenerateReferenceNumber(ministry.Code);

        var decision = new Decision
        {
            Id = Guid.NewGuid(),
            ReferenceNumber = referenceNumber,
            Title = request.Title,
            Description = request.Description,
            MinistryId = request.MinistryId,
            DecisionType = decisionType,
            Status = DecisionStatus.Draft,
            CurrentStep = 1,
            CreatedBy = userId,
            AssignedTo = request.AssignedTo,
            Deadline = request.Deadline,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Decisions.Add(decision);

        for (var i = 1; i <= 10; i++)
        {
            db.DecisionSteps.Add(new DecisionStep
            {
                Id = Guid.NewGuid(),
                DecisionId = decision.Id,
                StepNumber = i,
                Status = StepStatus.NotStarted,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync();

        // Notify assigned user
        if (decision.AssignedTo.HasValue)
        {
            try
            {
                await notificationService.Create(
                    decision.AssignedTo.Value, decision.Id,
                    NotificationType.Assignment,
                    $"Decision Assigned: {referenceNumber}",
                    $"You have been assigned to decision {referenceNumber}: {decision.Title}.");

                var assignee = await db.Users.FindAsync(decision.AssignedTo.Value);
                if (assignee is not null)
                    await emailService.SendDecisionAssigned(assignee.Email, decision.Title, referenceNumber);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send assignment notification for decision {DecisionId}", decision.Id);
            }
        }

        return ServiceResult<DecisionResponse>.Ok(MapToResponse(decision, []));
    }

    public async Task<DecisionResponse?> GetById(Guid id)
    {
        var decision = await db.Decisions
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);

        if (decision is null) return null;

        var steps = await db.DecisionSteps
            .AsNoTracking()
            .Where(s => s.DecisionId == id)
            .OrderBy(s => s.StepNumber)
            .ToListAsync();

        return MapToResponse(decision, steps);
    }

    public async Task<DecisionListResponse> List(ListDecisionsQuery query)
    {
        var q = db.Decisions.AsNoTracking().AsQueryable();

        if (query.MinistryId.HasValue)
            q = q.Where(d => d.MinistryId == query.MinistryId.Value);

        if (!string.IsNullOrEmpty(query.Status) && Enum.TryParse<DecisionStatus>(query.Status, true, out var status))
            q = q.Where(d => d.Status == status);

        if (!string.IsNullOrEmpty(query.DecisionType) && Enum.TryParse<DecisionType>(query.DecisionType, true, out var dtype))
            q = q.Where(d => d.DecisionType == dtype);

        if (query.AssignedTo.HasValue)
            q = q.Where(d => d.AssignedTo == query.AssignedTo.Value);

        if (!string.IsNullOrEmpty(query.Search))
            q = q.Where(d => EF.Functions.ILike(d.Title, $"%{query.Search}%"));

        var limit = Math.Clamp(query.Limit, 1, 100);

        var items = await q
            .OrderByDescending(d => d.CreatedAt)
            .Take(limit + 1)
            .ToListAsync();

        var hasMore = items.Count > limit;
        if (hasMore) items.RemoveAt(items.Count - 1);

        return new DecisionListResponse
        {
            Items = items.Select(d => MapToResponse(d, [])).ToList(),
            HasMore = hasMore,
            NextCursor = hasMore && items.Count > 0 ? items[^1].Id.ToString() : null,
        };
    }

    public async Task<ServiceResult<DecisionResponse>> AdvanceStep(Guid decisionId, AdvanceStepRequest request, Guid userId)
    {
        var decision = await db.Decisions.FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null)
            return ServiceResult<DecisionResponse>.Fail("Decision not found.");

        var steps = await db.DecisionSteps
            .Where(s => s.DecisionId == decisionId)
            .OrderBy(s => s.StepNumber)
            .ToListAsync();

        var stepStatuses = steps.ToDictionary(s => s.StepNumber, s => s.Status);
        var currentState = new WorkflowState(decision.CurrentStep, decision.Status, stepStatuses);

        if (!Enum.TryParse<TransitionAction>(request.Action, true, out var action))
            return ServiceResult<DecisionResponse>.Fail("Invalid action. Must be start, complete, or skip.");

        var transition = new StepTransition(request.StepNumber, action, request.SkipReason);

        var (allowed, reason) = WorkflowMachine.CanTransition(currentState, transition);
        if (!allowed)
            return ServiceResult<DecisionResponse>.Fail(reason!);

        var newState = WorkflowMachine.ApplyTransition(currentState, transition);

        var step = steps.First(s => s.StepNumber == request.StepNumber);
        var now = DateTime.UtcNow;
        step.Status = newState.StepStatuses[request.StepNumber];
        step.UpdatedAt = now;

        if (action == TransitionAction.Start)
            step.StartedAt = now;

        if (action == TransitionAction.Complete)
        {
            step.CompletedAt = now;
            step.CompletedBy = userId;
            if (request.Data.HasValue)
                step.Data = JsonDocument.Parse(request.Data.Value.GetRawText());
        }

        if (request.Notes is not null)
            step.Notes = request.Notes;

        decision.CurrentStep = newState.CurrentStep;
        decision.Status = newState.DecisionStatus;
        decision.UpdatedAt = now;

        await db.SaveChangesAsync();

        // Notify decision creator on step completion
        if (action == TransitionAction.Complete)
        {
            try
            {
                await notificationService.Create(
                    decision.CreatedBy, decision.Id,
                    NotificationType.StatusChange,
                    $"Step {request.StepNumber} Completed",
                    $"Step {request.StepNumber} has been completed for decision {decision.ReferenceNumber}: {decision.Title}.");

                var creator = await db.Users.FindAsync(decision.CreatedBy);
                if (creator is not null)
                    await emailService.SendStepCompleted(creator.Email, decision.Title, request.StepNumber, $"Step {request.StepNumber}");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send step completion notification for decision {DecisionId}", decision.Id);
            }
        }

        return ServiceResult<DecisionResponse>.Ok(MapToResponse(decision, steps));
    }

    public async Task<ServiceResult<bool>> Approve(Guid decisionId, string? notes)
    {
        var decision = await db.Decisions.FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null)
            return ServiceResult<bool>.Fail("Decision not found.");

        if (decision.Status != DecisionStatus.UnderReview)
            return ServiceResult<bool>.Fail("Only decisions under review can be approved.");

        decision.Status = DecisionStatus.Approved;
        decision.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Notify decision creator of approval
        try
        {
            await notificationService.Create(
                decision.CreatedBy, decision.Id,
                NotificationType.StatusChange,
                $"Decision Approved: {decision.ReferenceNumber}",
                $"Decision {decision.ReferenceNumber}: {decision.Title} has been approved.");

            var creator = await db.Users.FindAsync(decision.CreatedBy);
            if (creator is not null)
                await emailService.SendApprovalNeeded(creator.Email, decision.Title, decision.ReferenceNumber);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send approval notification for decision {DecisionId}", decision.Id);
        }

        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<bool>> Publish(Guid decisionId)
    {
        var decision = await db.Decisions.FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null)
            return ServiceResult<bool>.Fail("Decision not found.");

        if (decision.Status != DecisionStatus.Approved)
            return ServiceResult<bool>.Fail("Only approved decisions can be published.");

        decision.Status = DecisionStatus.Published;
        decision.IsPublic = true;
        decision.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Notify decision creator of publication
        try
        {
            await notificationService.Create(
                decision.CreatedBy, decision.Id,
                NotificationType.StatusChange,
                $"Decision Published: {decision.ReferenceNumber}",
                $"Decision {decision.ReferenceNumber}: {decision.Title} has been published to the public portal.");

            var creator = await db.Users.FindAsync(decision.CreatedBy);
            if (creator is not null)
                await emailService.SendDecisionPublished(creator.Email, decision.Title, decision.ReferenceNumber);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send publish notification for decision {DecisionId}", decision.Id);
        }

        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<object>> FlagForReview(Guid decisionId, FlagForReviewRequest request, Guid userId)
    {
        var decision = await db.Decisions.FirstOrDefaultAsync(d => d.Id == decisionId);
        if (decision is null)
            return ServiceResult<object>.Fail("Decision not found.");

        if (!Enum.TryParse<JudicialReviewGround>(request.Ground, true, out var ground))
            return ServiceResult<object>.Fail("Invalid review ground.");

        var review = new JudicialReview
        {
            Id = Guid.NewGuid(),
            DecisionId = decisionId,
            Ground = ground,
            Status = "filed",
            FiledDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Notes = request.Notes,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.JudicialReviews.Add(review);

        decision.JudicialReviewFlag = true;
        decision.Status = DecisionStatus.Challenged;
        decision.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { review.Id, review.Ground, review.Status });
    }

    public async Task<DecisionStatsResponse> GetStats()
    {
        var results = await db.Decisions
            .AsNoTracking()
            .GroupBy(d => d.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var total = results.Sum(r => r.Count);

        return new DecisionStatsResponse
        {
            Total = total,
            ByStatus = results.ToDictionary(
                r => r.Status.ToString().ToLowerInvariant(),
                r => r.Count
            ),
        };
    }

    public async Task<List<DecisionResponse>> GetPublicList()
    {
        var items = await db.Decisions
            .AsNoTracking()
            .Where(d => d.IsPublic)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return items.Select(d => MapToResponse(d, [])).ToList();
    }

    public async Task<DecisionResponse?> GetPublicById(Guid id)
    {
        var decision = await db.Decisions
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id && d.IsPublic);

        if (decision is null) return null;

        var steps = await db.DecisionSteps
            .AsNoTracking()
            .Where(s => s.DecisionId == id)
            .OrderBy(s => s.StepNumber)
            .ToListAsync();

        return MapToResponse(decision, steps);
    }

    private static DecisionResponse MapToResponse(Decision d, List<DecisionStep> steps)
    {
        return new DecisionResponse
        {
            Id = d.Id,
            ReferenceNumber = d.ReferenceNumber,
            Title = d.Title,
            Description = d.Description,
            MinistryId = d.MinistryId,
            DecisionType = d.DecisionType.ToString().ToLowerInvariant(),
            Status = d.Status.ToString().ToLowerInvariant(),
            CurrentStep = d.CurrentStep,
            CreatedBy = d.CreatedBy,
            AssignedTo = d.AssignedTo,
            IsPublic = d.IsPublic,
            JudicialReviewFlag = d.JudicialReviewFlag,
            Deadline = d.Deadline,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
            Steps = steps.Select(s => new DecisionStepResponse
            {
                Id = s.Id,
                StepNumber = s.StepNumber,
                Status = s.Status.ToString().ToLowerInvariant(),
                StartedAt = s.StartedAt,
                CompletedAt = s.CompletedAt,
                CompletedBy = s.CompletedBy,
                Data = s.Data is not null ? JsonSerializer.Deserialize<object>(s.Data.RootElement.GetRawText()) : null,
                Notes = s.Notes,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
            }).ToList(),
        };
    }
}
