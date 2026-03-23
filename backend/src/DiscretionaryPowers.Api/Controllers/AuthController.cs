using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Auth;
using DiscretionaryPowers.Application.DTOs.Users;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Services;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db,
    JwtTokenService jwtService,
    ICurrentUserService currentUser,
    UsageAlertService usageAlertService,
    IEmailService emailService,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var user = await db.Users
            .Include(u => u.Ministry)
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || user.PasswordHash is null)
        {
            db.LoginEvents.Add(new LoginEvent
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Status = "failed",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                FailureReason = "Invalid email or password",
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            db.LoginEvents.Add(new LoginEvent
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Email = user.Email,
                OrganizationId = user.OrganizationId,
                Status = "failed",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                FailureReason = "Invalid password",
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (!user.Active)
        {
            db.LoginEvents.Add(new LoginEvent
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Email = user.Email,
                OrganizationId = user.OrganizationId,
                Status = "failed",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                FailureReason = "Account deactivated",
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
            return Unauthorized(new { message = "Account is deactivated." });
        }

        if (user.MfaEnabled && user.MfaSecret is not null)
        {
            db.LoginEvents.Add(new LoginEvent
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Email = user.Email,
                OrganizationId = user.OrganizationId,
                Status = "mfa_required",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();

            var mfaToken = jwtService.GenerateMfaToken(user);
            return Ok(new LoginResponse
            {
                MfaRequired = true,
                MfaToken = mfaToken,
            });
        }

        db.LoginEvents.Add(new LoginEvent
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Email = user.Email,
            OrganizationId = user.OrganizationId,
            Status = "success",
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);

        // Fire-and-forget: check usage alerts and trial/renewal reminders on login
        if (user.OrganizationId != Guid.Empty)
        {
            var orgId = user.OrganizationId;
            _ = Task.Run(async () =>
            {
                try
                {
                    await usageAlertService.CheckAndAlert(orgId);
                    await usageAlertService.CheckTrialExpiry(orgId);
                    await usageAlertService.CheckRenewalReminder(orgId);
                }
                catch { /* best-effort, ignore errors */ }
            });
        }

        return Ok(new LoginResponse
        {
            Token = token,
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = ToSnakeCase(user.Role.ToString()),
                MinistryId = user.MinistryId,
                Active = user.Active,
                MinistryName = user.Ministry?.Name,
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                OrganizationOnboardingCompleted = user.Organization?.OnboardingCompleted ?? true,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
            },
        });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        return Ok(new CurrentUserResponse
        {
            Id = currentUser.UserId,
            Email = currentUser.Email,
            Name = currentUser.Name,
            Role = ToSnakeCase(currentUser.Role.ToString()),
            MinistryId = currentUser.MinistryId,
            OrganizationId = currentUser.OrganizationId,
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is not null)
        {
            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
            await db.SaveChangesAsync();

            // In production, send email with the reset link containing the token.
            // For now, log it for development purposes.
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<AuthController>>();
            logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, user.PasswordResetToken);
        }

        // Always return 200 to avoid revealing whether the email exists
        return Ok(new { message = "If an account exists with that email, you will receive a password reset link." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == request.Token &&
            u.PasswordResetExpiry > DateTime.UtcNow);

        if (user is null)
            return BadRequest(new { message = "Invalid or expired reset link." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var user = await db.Users.FindAsync(currentUser.UserId);

        if (user is null || user.PasswordHash is null)
            return BadRequest(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpPost("signup")]
    [AllowAnonymous]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OrganizationName))
            return BadRequest(new { message = "Organization name is required." });
        if (string.IsNullOrWhiteSpace(request.Slug))
            return BadRequest(new { message = "Organization slug is required." });
        if (string.IsNullOrWhiteSpace(request.AdminName))
            return BadRequest(new { message = "Admin name is required." });
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters." });

        // Check slug uniqueness (bypass tenant filter)
        var slugExists = await db.Organizations
            .IgnoreQueryFilters()
            .AnyAsync(o => o.Slug == request.Slug);
        if (slugExists)
            return BadRequest(new { message = "This organization slug is already taken." });

        // Check email uniqueness (bypass tenant filter)
        var emailExists = await db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.Email);
        if (emailExists)
            return BadRequest(new { message = "An account with this email already exists." });

        var now = DateTime.UtcNow;
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var verificationToken = Guid.NewGuid().ToString();
        var plan = request.Plan ?? "starter";

        // Create organization (inactive until email verified)
        var org = new Organization
        {
            Id = orgId,
            Name = request.OrganizationName,
            Slug = request.Slug,
            IsActive = false,
            OnboardingCompleted = false,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Organizations.Add(org);

        // Create admin user (inactive until email verified)
        var user = new User
        {
            Id = userId,
            Email = request.Email,
            Name = request.AdminName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.PermanentSecretary,
            OrganizationId = orgId,
            Active = false,
            EmailVerificationToken = verificationToken,
            EmailVerified = false,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Users.Add(user);

        // Create 3 default ministries
        var defaultMinistries = new[]
        {
            ("General Administration", "GEN-ADMIN"),
            ("Policy & Planning", "POL-PLAN"),
            ("Public Services", "PUB-SERV"),
        };
        foreach (var (name, code) in defaultMinistries)
        {
            db.Ministries.Add(new Ministry
            {
                Id = Guid.NewGuid(),
                Name = name,
                Code = code,
                OrganizationId = orgId,
                Active = true,
                CreatedAt = now,
                UpdatedAt = now,
            });
        }

        // Create default workflow template with 10 steps
        var workflowId = Guid.NewGuid();
        db.WorkflowTemplates.Add(new WorkflowTemplate
        {
            Id = workflowId,
            OrganizationId = orgId,
            Name = "Standard 10-Step Framework",
            IsDefault = true,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        });

        var stepDefinitions = new[]
        {
            (1, "Confirm Authority", "Verify the legal authority to make this decision"),
            (2, "Follow Procedures", "Ensure correct procedures are being followed"),
            (3, "Gather Information", "Collect all relevant information and evidence"),
            (4, "Evaluate Evidence", "Assess the quality and relevance of evidence"),
            (5, "Standard of Proof", "Apply the appropriate standard of proof"),
            (6, "Fairness", "Consider fairness to all affected parties"),
            (7, "Procedural Fairness", "Ensure procedural fairness requirements are met"),
            (8, "Consider Merits", "Evaluate the merits of the decision"),
            (9, "Communicate", "Communicate the decision to affected parties"),
            (10, "Record", "Record the decision and its rationale"),
        };
        foreach (var (stepNum, name, desc) in stepDefinitions)
        {
            db.WorkflowStepTemplates.Add(new WorkflowStepTemplate
            {
                Id = Guid.NewGuid(),
                WorkflowTemplateId = workflowId,
                StepNumber = stepNum,
                Name = name,
                Description = desc,
                IsRequired = true,
            });
        }

        // Create 4 default decision types
        var decisionTypes = new[]
        {
            ("regulatory", "Regulatory Decision", "Decisions related to regulations and compliance"),
            ("policy", "Policy Decision", "Decisions related to policy changes or new policies"),
            ("licensing", "Licensing Decision", "Decisions related to permits and licenses"),
            ("administrative", "Administrative Decision", "General administrative decisions"),
        };
        foreach (var (code, name, desc) in decisionTypes)
        {
            db.DecisionTypeConfigs.Add(new DecisionTypeConfig
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgId,
                Code = code,
                Name = name,
                Description = desc,
                DefaultWorkflowId = workflowId,
                IsActive = true,
                CreatedAt = now,
            });
        }

        // Create trial subscription (14 days, $0)
        db.Subscriptions.Add(new Subscription
        {
            Id = Guid.NewGuid(),
            OrganizationId = orgId,
            Plan = plan,
            Status = "trialing",
            MonthlyPrice = 0m,
            Currency = "USD",
            CurrentPeriodStart = now,
            CurrentPeriodEnd = now.AddDays(14),
            CreatedAt = now,
            UpdatedAt = now,
        });

        await db.SaveChangesAsync();

        // Send verification email
        var frontendUrl = configuration["Frontend:Url"] ?? "http://localhost:3000";
        var verifyLink = $"{frontendUrl}/verify-email?token={verificationToken}";
        try
        {
            await emailService.SendEmail(
                request.Email,
                "Verify your GovDecision account",
                $"<h2>Welcome to GovDecision</h2><p>Hi {request.AdminName},</p><p>Thank you for signing up <strong>{request.OrganizationName}</strong> on GovDecision.</p><p>Please verify your email address by clicking the link below:</p><p><a href=\"{verifyLink}\" style=\"display:inline-block;padding:12px 24px;background:#2A9D8F;color:white;text-decoration:none;border-radius:8px;font-weight:600;\">Verify Email Address</a></p><p>Or copy and paste this URL into your browser:</p><p>{verifyLink}</p><p>This link will expire in 24 hours.</p>");
        }
        catch
        {
            // Log but don't fail — user can request a new verification email
            var logger = HttpContext.RequestServices.GetRequiredService<ILogger<AuthController>>();
            logger.LogWarning("Failed to send verification email to {Email}. Token: {Token}", request.Email, verificationToken);
        }

        return Ok(new { message = "Account created successfully. Please check your email to verify your account." });
    }

    [HttpGet("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Verification token is required." });

        var user = await db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

        if (user is null)
            return BadRequest(new { message = "Invalid or expired verification link." });

        user.EmailVerified = true;
        user.Active = true;
        user.EmailVerificationToken = null;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Organization is not null)
        {
            user.Organization.IsActive = true;
            user.Organization.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        return Ok(new { message = "Email verified successfully. You can now sign in." });
    }
}
