using DiscretionaryPowers.Domain.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace DiscretionaryPowers.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmail(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            _configuration["Email:FromName"] ?? "BVI Discretionary Powers",
            _configuration["Email:FromAddress"] ?? "noreply@gov.vg"));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        var host = _configuration["Email:SmtpHost"] ?? "localhost";
        var port = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);

        var username = _configuration["Email:SmtpUsername"];
        if (!string.IsNullOrEmpty(username))
            await client.AuthenticateAsync(username, _configuration["Email:SmtpPassword"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
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
