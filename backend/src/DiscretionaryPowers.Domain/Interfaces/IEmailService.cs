namespace DiscretionaryPowers.Domain.Interfaces;

public interface IEmailService
{
    Task SendEmail(string to, string subject, string htmlBody);
    Task SendDecisionAssigned(string to, string decisionTitle, string referenceNumber);
    Task SendStepCompleted(string to, string decisionTitle, int stepNumber, string stepName);
    Task SendApprovalNeeded(string to, string decisionTitle, string referenceNumber);
    Task SendDecisionPublished(string to, string decisionTitle, string referenceNumber);
    Task SendJudicialReviewFiled(string to, string decisionTitle, string referenceNumber);
}
