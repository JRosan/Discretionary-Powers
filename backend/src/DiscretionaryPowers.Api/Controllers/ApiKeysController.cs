using System.Security.Cryptography;
using System.Text;
using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/api-keys")]
[Authorize(Policy = PermissionPolicies.CanManageSettings)]
public class ApiKeysController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var keys = await db.ApiKeys
            .AsNoTracking()
            .OrderByDescending(k => k.CreatedAt)
            .Select(k => new ApiKeyResponse
            {
                Id = k.Id,
                Name = k.Name,
                KeyPrefix = k.KeyPrefix,
                Scopes = k.Scopes,
                IsActive = k.IsActive,
                ExpiresAt = k.ExpiresAt,
                LastUsedAt = k.LastUsedAt,
                CreatedAt = k.CreatedAt,
            })
            .ToListAsync();

        return Ok(keys);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApiKeyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Name is required." });

        // Generate key: gd_live_ + 32 random hex chars
        var randomBytes = RandomNumberGenerator.GetBytes(16);
        var hexPart = Convert.ToHexStringLower(randomBytes);
        var fullKey = $"gd_live_{hexPart}";
        var keyPrefix = fullKey[..16] + "...";

        var keyHash = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(fullKey)));

        var apiKey = new ApiKey
        {
            Id = Guid.NewGuid(),
            OrganizationId = currentUser.OrganizationId ?? Guid.Empty,
            Name = request.Name,
            KeyHash = keyHash,
            KeyPrefix = keyPrefix,
            Scopes = request.Scopes ?? [],
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.ApiKeys.Add(apiKey);
        await db.SaveChangesAsync();

        return Ok(new CreateApiKeyResponse
        {
            Id = apiKey.Id,
            Key = fullKey,
            Prefix = keyPrefix,
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Revoke(Guid id)
    {
        var apiKey = await db.ApiKeys.FindAsync(id);
        if (apiKey is null)
            return NotFound();

        apiKey.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateApiKeyRequest
{
    public string Name { get; set; } = null!;
    public string[]? Scopes { get; set; }
}

public class ApiKeyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string KeyPrefix { get; set; } = null!;
    public string[] Scopes { get; set; } = [];
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateApiKeyResponse
{
    public Guid Id { get; set; }
    public string Key { get; set; } = null!;
    public string Prefix { get; set; } = null!;
}
