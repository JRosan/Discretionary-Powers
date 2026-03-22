using System.Text;
using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Api.Middleware;
using DiscretionaryPowers.Domain.Enums;
using DiscretionaryPowers.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Infrastructure (DbContext, S3, Email, Services)
builder.Services.AddInfrastructure(builder.Configuration);

// JWT Auth
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super-secret-development-key-that-is-long-enough-32";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "DiscretionaryPowers",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "DiscretionaryPowers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

// Authorization policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(PermissionPolicies.CanCreateDecision, policy =>
        policy.RequireRole(UserRole.Minister.ToString(), UserRole.PermanentSecretary.ToString()))
    .AddPolicy(PermissionPolicies.CanApproveDecision, policy =>
        policy.RequireRole(UserRole.Minister.ToString()))
    .AddPolicy(PermissionPolicies.CanFlagForReview, policy =>
        policy.RequireRole(UserRole.LegalAdvisor.ToString(), UserRole.Auditor.ToString()))
    .AddPolicy(PermissionPolicies.CanManageUsers, policy =>
        policy.RequireRole(UserRole.PermanentSecretary.ToString()))
    .AddPolicy(PermissionPolicies.CanViewAuditTrail, policy =>
        policy.RequireRole(UserRole.PermanentSecretary.ToString(), UserRole.LegalAdvisor.ToString(), UserRole.Auditor.ToString()))
    .AddPolicy(PermissionPolicies.CanViewAllAudit, policy =>
        policy.RequireRole(UserRole.Auditor.ToString()))
    .AddPolicy(PermissionPolicies.CanRedactDocument, policy =>
        policy.RequireRole(UserRole.PermanentSecretary.ToString(), UserRole.LegalAdvisor.ToString()));

// CORS
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(frontendUrl)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Controllers & Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Token Service
builder.Services.AddScoped<JwtTokenService>();

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
