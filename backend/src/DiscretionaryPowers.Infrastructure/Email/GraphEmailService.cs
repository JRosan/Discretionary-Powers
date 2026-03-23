using Azure.Identity;
using DiscretionaryPowers.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;

namespace DiscretionaryPowers.Infrastructure.Email;

public class GraphEmailService : IEmailService
{
    private readonly GraphServiceClient _graphClient;
    private readonly string _senderId;
    private readonly ILogger<GraphEmailService> _logger;

    public GraphEmailService(IConfiguration configuration, ILogger<GraphEmailService> logger)
    {
        _logger = logger;

        var tenantId = configuration["MsGraph:TenantId"];
        var clientId = configuration["MsGraph:ClientId"];
        var clientSecret = configuration["MsGraph:ClientSecret"];
        _senderId = configuration["MsGraph:SenderId"] ?? "noreply@gov.vg";

        if (string.IsNullOrEmpty(tenantId) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            _logger.LogWarning("Microsoft Graph email configuration is incomplete. Emails will not be sent.");
            _graphClient = null!;
            return;
        }

        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        _graphClient = new GraphServiceClient(credential, ["https://graph.microsoft.com/.default"]);
    }

    public async Task SendEmail(string to, string subject, string htmlBody)
    {
        if (_graphClient is null)
        {
            _logger.LogWarning("Graph client not configured. Skipping email to {To}: {Subject}", to, subject);
            return;
        }

        var message = new Message
        {
            Subject = subject,
            Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = htmlBody,
            },
            ToRecipients =
            [
                new Recipient
                {
                    EmailAddress = new EmailAddress { Address = to },
                },
            ],
        };

        await _graphClient.Users[_senderId].SendMail.PostAsync(new SendMailPostRequestBody
        {
            Message = message,
            SaveToSentItems = false,
        });

        _logger.LogInformation("Graph email sent to {To}: {Subject}", to, subject);
    }

    public Task SendDecisionAssigned(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Decision Assigned: {referenceNumber}",
            EmailTemplates.DecisionAssigned(decisionTitle, referenceNumber, to));

    public Task SendStepCompleted(string to, string decisionTitle, int stepNumber, string stepName) =>
        SendEmail(to, $"Step {stepNumber} Completed: {decisionTitle}",
            EmailTemplates.StepCompleted(decisionTitle, stepNumber, stepName, "System"));

    public Task SendApprovalNeeded(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Approval Required: {referenceNumber}",
            EmailTemplates.ApprovalNeeded(decisionTitle, referenceNumber));

    public Task SendDecisionPublished(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Decision Published: {referenceNumber}",
            EmailTemplates.DecisionPublished(decisionTitle, referenceNumber));

    public Task SendJudicialReviewFiled(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Judicial Review Filed: {referenceNumber}",
            EmailTemplates.JudicialReviewFiled(decisionTitle, referenceNumber));
}
