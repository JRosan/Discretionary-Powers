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
                Content = WrapInTemplate(htmlBody),
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
            $"<h2>Decision Assigned to You</h2><p>You have been assigned to decision <strong>{referenceNumber}</strong>: {decisionTitle}.</p><p>Please log in to review and take action.</p>");

    public Task SendStepCompleted(string to, string decisionTitle, int stepNumber, string stepName) =>
        SendEmail(to, $"Step {stepNumber} Completed: {decisionTitle}",
            $"<h2>Workflow Step Completed</h2><p>Step {stepNumber} ({stepName}) has been completed for decision: <strong>{decisionTitle}</strong>.</p>");

    public Task SendApprovalNeeded(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Approval Required: {referenceNumber}",
            $"<h2>Decision Ready for Approval</h2><p>Decision <strong>{referenceNumber}</strong>: {decisionTitle} is ready for your review and approval.</p>");

    public Task SendDecisionPublished(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Decision Published: {referenceNumber}",
            $"<h2>Decision Published</h2><p>Decision <strong>{referenceNumber}</strong>: {decisionTitle} has been published to the public portal.</p>");

    public Task SendJudicialReviewFiled(string to, string decisionTitle, string referenceNumber) =>
        SendEmail(to, $"Judicial Review Filed: {referenceNumber}",
            $"<h2>Judicial Review Filed</h2><p>A judicial review has been filed against decision <strong>{referenceNumber}</strong>: {decisionTitle}.</p><p>Immediate attention is required.</p>");

    private static string WrapInTemplate(string body) =>
        $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px;">BVI Government</h1>
                <p style="margin: 5px 0 0;">Discretionary Powers Management System</p>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                {body}
            </div>
            <div style="padding: 10px 20px; background-color: #f5f5f5; font-size: 12px; color: #666; text-align: center;">
                <p>Government of the British Virgin Islands</p>
            </div>
        </body>
        </html>
        """;
}
