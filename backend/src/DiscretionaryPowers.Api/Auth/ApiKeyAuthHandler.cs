using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DiscretionaryPowers.Api.Auth;

public static class ApiKeyAuthDefaults
{
    public const string AuthenticationScheme = "ApiKey";
}

public class ApiKeyAuthOptions : AuthenticationSchemeOptions { }

public class ApiKeyAuthHandler(
    IOptionsMonitor<ApiKeyAuthOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IServiceScopeFactory scopeFactory)
    : AuthenticationHandler<ApiKeyAuthOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-API-Key", out var apiKeyHeader))
            return AuthenticateResult.NoResult();

        var apiKeyValue = apiKeyHeader.ToString();
        if (string.IsNullOrWhiteSpace(apiKeyValue))
            return AuthenticateResult.NoResult();

        var hash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(apiKeyValue)));

        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var apiKey = await db.ApiKeys
            .IgnoreQueryFilters()
            .Include(k => k.Organization)
            .FirstOrDefaultAsync(k => k.KeyHash == hash);

        if (apiKey is null)
            return AuthenticateResult.Fail("Invalid API key.");

        if (!apiKey.IsActive)
            return AuthenticateResult.Fail("API key is revoked.");

        if (apiKey.ExpiresAt.HasValue && apiKey.ExpiresAt.Value < DateTime.UtcNow)
            return AuthenticateResult.Fail("API key has expired.");

        // Update last used timestamp
        apiKey.LastUsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, apiKey.OrganizationId.ToString()),
            new("organization_id", apiKey.OrganizationId.ToString()),
            new(ClaimTypes.Role, "api_key"),
            new("api_key_id", apiKey.Id.ToString()),
            new("api_key_name", apiKey.Name),
        };

        foreach (var s in apiKey.Scopes)
            claims.Add(new Claim("scope", s));

        var identity = new ClaimsIdentity(claims, ApiKeyAuthDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, ApiKeyAuthDefaults.AuthenticationScheme);

        return AuthenticateResult.Success(ticket);
    }
}
