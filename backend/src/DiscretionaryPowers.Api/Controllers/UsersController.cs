using DiscretionaryPowers.Api.Auth;
using DiscretionaryPowers.Application.DTOs.Users;
using DiscretionaryPowers.Domain.Enums;
using static DiscretionaryPowers.Infrastructure.Data.EnumConverter;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace DiscretionaryPowers.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> List([FromQuery] Guid? ministryId, [FromQuery] string? role)
    {
        var q = db.Users.AsNoTracking()
            .Include(u => u.Ministry)
            .AsQueryable();

        if (ministryId.HasValue)
            q = q.Where(u => u.MinistryId == ministryId.Value);

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, true, out var r))
            q = q.Where(u => u.Role == r);

        var users = await q.OrderBy(u => u.Name).ToListAsync();

        return Ok(users.Select(u => new UserResponse
        {
            Id = u.Id,
            Email = u.Email,
            Name = u.Name,
            Role = ToSnakeCase(u.Role.ToString()),
            MinistryId = u.MinistryId,
            Active = u.Active,
            MinistryName = u.Ministry?.Name,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
        }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await db.Users.AsNoTracking()
            .Include(u => u.Ministry)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null) return NotFound();

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = ToSnakeCase(user.Role.ToString()),
            MinistryId = user.MinistryId,
            Active = user.Active,
            MinistryName = user.Ministry?.Name,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        });
    }

    [HttpPost]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            return BadRequest(new { message = "Invalid role." });

        var existing = await db.Users.AnyAsync(u => u.Email == request.Email);
        if (existing)
            return Conflict(new { message = "A user with this email already exists." });

        string? passwordHash = null;
        if (!string.IsNullOrEmpty(request.Password))
            passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);

        var user = new Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Name = request.Name,
            Role = role,
            MinistryId = request.MinistryId,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = ToSnakeCase(user.Role.ToString()),
            MinistryId = user.MinistryId,
            Active = user.Active,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        if (request.Name is not null) user.Name = request.Name;
        if (request.Email is not null) user.Email = request.Email;
        if (request.Role is not null && Enum.TryParse<UserRole>(request.Role, true, out var role))
            user.Role = role;
        if (request.MinistryId.HasValue) user.MinistryId = request.MinistryId.Value;
        if (request.Active.HasValue) user.Active = request.Active.Value;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Role = ToSnakeCase(user.Role.ToString()),
            MinistryId = user.MinistryId,
            Active = user.Active,
            UpdatedAt = user.UpdatedAt,
            CreatedAt = user.CreatedAt,
        });
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = PermissionPolicies.CanManageUsers)]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.Active = false;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { id = user.Id, active = user.Active });
    }
}
