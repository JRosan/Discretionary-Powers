using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Workflow;
using FluentAssertions;

namespace DiscretionaryPowers.Domain.Tests;

public class WorkflowMachineTests
{
    [Fact]
    public void CreateInitialState_ReturnsCorrectDefaults()
    {
        var state = WorkflowMachine.CreateInitialState();

        state.CurrentStep.Should().Be(1);
        state.DecisionStatus.Should().Be(DecisionStatus.Draft);
        state.StepStatuses.Should().HaveCount(10);
        state.StepStatuses.Values.Should().AllSatisfy(s => s.Should().Be(StepStatus.NotStarted));
    }

    [Fact]
    public void CanTransition_AllowsStartingStep1()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Start);

        var (allowed, reason) = WorkflowMachine.CanTransition(state, transition);

        allowed.Should().BeTrue();
        reason.Should().BeNull();
    }

    [Fact]
    public void CanTransition_BlocksStartingStep2_BeforeStep1Completed()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(2, TransitionAction.Start);

        var (allowed, reason) = WorkflowMachine.CanTransition(state, transition);

        allowed.Should().BeFalse();
        reason.Should().Contain("Step 1 must be completed");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    [InlineData(-1)]
    public void CanTransition_BlocksInvalidStepNumber(int stepNumber)
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(stepNumber, TransitionAction.Start);

        var (allowed, reason) = WorkflowMachine.CanTransition(state, transition);

        allowed.Should().BeFalse();
        reason.Should().Contain("between 1 and 10");
    }

    [Theory]
    [InlineData(DecisionStatus.Published)]
    [InlineData(DecisionStatus.Withdrawn)]
    public void CanTransition_BlocksModifications_WhenPublishedOrWithdrawn(DecisionStatus status)
    {
        var state = WorkflowMachine.CreateInitialState() with { DecisionStatus = status };
        var transition = new StepTransition(1, TransitionAction.Start);

        var (allowed, reason) = WorkflowMachine.CanTransition(state, transition);

        allowed.Should().BeFalse();
        reason.Should().Contain("Cannot modify steps");
    }

    [Fact]
    public void ApplyTransition_StartingStep1_ChangesToInProgress()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Start);

        var newState = WorkflowMachine.ApplyTransition(state, transition);

        newState.StepStatuses[1].Should().Be(StepStatus.InProgress);
    }

    [Fact]
    public void ApplyTransition_StartingStep1_ChangesDecisionStatusFromDraftToInProgress()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Start);

        var newState = WorkflowMachine.ApplyTransition(state, transition);

        newState.DecisionStatus.Should().Be(DecisionStatus.InProgress);
    }

    [Fact]
    public void ApplyTransition_CompletingStep_AdvancesCurrentStep()
    {
        var state = WorkflowMachine.CreateInitialState();
        state = WorkflowMachine.ApplyTransition(state, new StepTransition(1, TransitionAction.Start));
        state = WorkflowMachine.ApplyTransition(state, new StepTransition(1, TransitionAction.Complete));

        state.StepStatuses[1].Should().Be(StepStatus.Completed);
        state.CurrentStep.Should().Be(2);
    }

    [Fact]
    public void ApplyTransition_CompletingAllSteps_ChangesStatusToUnderReview()
    {
        var state = WorkflowMachine.CreateInitialState();
        for (var i = 1; i <= 10; i++)
        {
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Start));
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Complete));
        }

        state.DecisionStatus.Should().Be(DecisionStatus.UnderReview);
    }

    [Fact]
    public void ApplyTransition_SkipWithReason_Succeeds()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Skip, "Not applicable");

        var newState = WorkflowMachine.ApplyTransition(state, transition);

        newState.StepStatuses[1].Should().Be(StepStatus.SkippedWithReason);
    }

    [Fact]
    public void CanTransition_SkipWithoutReason_ReturnsFalse()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Skip);

        var (allowed, reason) = WorkflowMachine.CanTransition(state, transition);

        allowed.Should().BeFalse();
        reason.Should().Contain("reason must be provided");
    }

    [Fact]
    public void ApplyTransition_SkipWithoutReason_Throws()
    {
        var state = WorkflowMachine.CreateInitialState();
        var transition = new StepTransition(1, TransitionAction.Skip);

        var act = () => WorkflowMachine.ApplyTransition(state, transition);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void CanApprove_ReturnsTrueOnlyWhenUnderReview()
    {
        var underReview = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.UnderReview };
        var draft = WorkflowMachine.CreateInitialState();

        WorkflowMachine.CanApprove(underReview).Should().BeTrue();
        WorkflowMachine.CanApprove(draft).Should().BeFalse();
    }

    [Fact]
    public void CanPublish_ReturnsTrueOnlyWhenApproved()
    {
        var approved = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.Approved };
        var draft = WorkflowMachine.CreateInitialState();

        WorkflowMachine.CanPublish(approved).Should().BeTrue();
        WorkflowMachine.CanPublish(draft).Should().BeFalse();
    }

    [Fact]
    public void Approve_ChangesStatusToApproved()
    {
        var state = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.UnderReview };

        var result = WorkflowMachine.Approve(state);

        result.DecisionStatus.Should().Be(DecisionStatus.Approved);
    }

    [Fact]
    public void Approve_ThrowsWhenNotUnderReview()
    {
        var state = WorkflowMachine.CreateInitialState();

        var act = () => WorkflowMachine.Approve(state);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*under review*");
    }

    [Fact]
    public void Publish_ChangesStatusToPublished()
    {
        var state = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.Approved };

        var result = WorkflowMachine.Publish(state);

        result.DecisionStatus.Should().Be(DecisionStatus.Published);
    }

    [Fact]
    public void Publish_ThrowsWhenNotApproved()
    {
        var state = WorkflowMachine.CreateInitialState();

        var act = () => WorkflowMachine.Publish(state);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*approved*");
    }

    [Fact]
    public void Withdraw_WorksForNonPublishedDecisions()
    {
        var state = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.InProgress };

        var result = WorkflowMachine.Withdraw(state);

        result.DecisionStatus.Should().Be(DecisionStatus.Withdrawn);
    }

    [Fact]
    public void Withdraw_ThrowsForPublishedDecisions()
    {
        var state = WorkflowMachine.CreateInitialState() with { DecisionStatus = DecisionStatus.Published };

        var act = () => WorkflowMachine.Withdraw(state);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Published*");
    }

    [Fact]
    public void GetProgress_ReturnsCorrectPercentage()
    {
        var state = WorkflowMachine.CreateInitialState();
        WorkflowMachine.GetProgress(state).Should().Be(0);

        // Complete 3 steps
        for (var i = 1; i <= 3; i++)
        {
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Start));
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Complete));
        }

        WorkflowMachine.GetProgress(state).Should().Be(30);
    }

    [Fact]
    public void GetNextStep_ReturnsNullWhenAllStepsDone()
    {
        var state = WorkflowMachine.CreateInitialState();
        for (var i = 1; i <= 10; i++)
        {
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Start));
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Complete));
        }

        WorkflowMachine.GetNextStep(state).Should().BeNull();
    }

    [Fact]
    public void FullWorkflow_AllStepsComplete_ThenApproveAndPublish()
    {
        var state = WorkflowMachine.CreateInitialState();

        // Complete all 10 steps
        for (var i = 1; i <= 10; i++)
        {
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Start));
            state = WorkflowMachine.ApplyTransition(state, new StepTransition(i, TransitionAction.Complete));
        }

        state.DecisionStatus.Should().Be(DecisionStatus.UnderReview);

        state = WorkflowMachine.Approve(state);
        state.DecisionStatus.Should().Be(DecisionStatus.Approved);

        state = WorkflowMachine.Publish(state);
        state.DecisionStatus.Should().Be(DecisionStatus.Published);

        WorkflowMachine.GetProgress(state).Should().Be(100);
    }

    [Fact]
    public void GetProgress_CountsSkippedSteps()
    {
        var state = WorkflowMachine.CreateInitialState();
        state = WorkflowMachine.ApplyTransition(state, new StepTransition(1, TransitionAction.Skip, "Not needed"));

        WorkflowMachine.GetProgress(state).Should().Be(10);
    }

    [Fact]
    public void CanTransition_BlocksStartingAlreadyInProgressStep()
    {
        var state = WorkflowMachine.CreateInitialState();
        state = WorkflowMachine.ApplyTransition(state, new StepTransition(1, TransitionAction.Start));

        var (allowed, reason) = WorkflowMachine.CanTransition(state, new StepTransition(1, TransitionAction.Start));

        allowed.Should().BeFalse();
        reason.Should().Contain("already");
    }
}
