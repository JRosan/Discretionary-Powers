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

        var bodyBuilder = new BodyBuilder { HtmlBody = WrapInTemplate(htmlBody) };
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
