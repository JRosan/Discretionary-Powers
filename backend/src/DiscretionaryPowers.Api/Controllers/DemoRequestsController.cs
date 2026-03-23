using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/demo-requests")]
public class DemoRequestsController(
    AppDbContext db,
    IEmailService emailService,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateDemoRequest([FromBody] CreateDemoRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Name is required." });
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });
        if (string.IsNullOrWhiteSpace(request.Organization))
            return BadRequest(new { message = "Organization is required." });
        if (string.IsNullOrWhiteSpace(request.JobTitle))
            return BadRequest(new { message = "Job title is required." });
        if (string.IsNullOrWhiteSpace(request.Country))
            return BadRequest(new { message = "Country is required." });

        var demoRequest = new DemoRequest
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Organization = request.Organization,
            JobTitle = request.JobTitle,
            Country = request.Country,
            UserRange = request.UserRange,
            Message = request.Message,
            PreferredDate = request.PreferredDate,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
        };

        db.DemoRequests.Add(demoRequest);
        await db.SaveChangesAsync();

        // Send notification email to platform admin
        try
        {
            var adminEmail = configuration["Support:Email"] ?? "admin@govdecision.com";
            await emailService.SendEmail(
                adminEmail,
                $"New Demo Request from {request.Name} ({request.Organization})",
                $"<h2>New Demo Booking Request</h2>" +
                $"<p><strong>Name:</strong> {request.Name}</p>" +
                $"<p><strong>Email:</strong> {request.Email}</p>" +
                $"<p><strong>Organization:</strong> {request.Organization}</p>" +
                $"<p><strong>Job Title:</strong> {request.JobTitle}</p>" +
                $"<p><strong>Country:</strong> {request.Country}</p>" +
                $"<p><strong>Users:</strong> {request.UserRange ?? "Not specified"}</p>" +
                $"<p><strong>Preferred Date:</strong> {request.PreferredDate ?? "Not specified"}</p>" +
                $"<p><strong>Message:</strong> {request.Message ?? "None"}</p>");
        }
        catch
        {
            // Best-effort notification
        }

        return Ok(new
        {
            message = "Demo request submitted successfully. We'll be in touch shortly.",
            id = demoRequest.Id,
        });
    }
}

public class CreateDemoRequestDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Organization { get; set; } = null!;
    public string JobTitle { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string? UserRange { get; set; }
    public string? Message { get; set; }
    public string? PreferredDate { get; set; }
}
