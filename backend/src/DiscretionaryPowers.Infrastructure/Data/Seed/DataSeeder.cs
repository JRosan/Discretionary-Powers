using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Data.Seed;

public static class DataSeeder
{
    // Default BVI organization ID — must match the migration SQL
    public static readonly Guid DefaultOrgId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure default organization exists
        if (!await context.Organizations.AnyAsync(o => o.Id == DefaultOrgId))
        {
            context.Organizations.Add(new Organization
            {
                Id = DefaultOrgId,
                Name = "Government of the Virgin Islands",
                Slug = "bvi",
                PrimaryColor = "#1D3557",
                AccentColor = "#2A9D8F",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
            await context.SaveChangesAsync();
        }

        if (await context.Ministries.AnyAsync())
            return;

        var ministries = new List<Ministry>
        {
            new() { Name = "Ministry of Finance", Code = "FIN", OrganizationId = DefaultOrgId },
            new() { Name = "Ministry of Natural Resources, Labour and Immigration", Code = "NAT", OrganizationId = DefaultOrgId },
            new() { Name = "Ministry of Education, Culture, Youth Affairs and Sports", Code = "EDU", OrganizationId = DefaultOrgId },
            new() { Name = "Ministry of Health and Social Development", Code = "HEA", OrganizationId = DefaultOrgId },
            new() { Name = "Ministry of Communications and Works", Code = "COM", OrganizationId = DefaultOrgId },
            new() { Name = "Premier's Office", Code = "PMO", OrganizationId = DefaultOrgId },
        };

        context.Ministries.AddRange(ministries);
        await context.SaveChangesAsync();

        var ministryByCode = ministries.ToDictionary(m => m.Code, m => m.Id);
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password", workFactor: 12);

        var users = new List<User>
        {
            new()
            {
                Email = "minister@gov.vg",
                Name = "Minister",
                Role = UserRole.Minister,
                MinistryId = ministryByCode["FIN"],
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "secretary@gov.vg",
                Name = "Permanent Secretary",
                Role = UserRole.PermanentSecretary,
                MinistryId = ministryByCode["FIN"],
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "legal@gov.vg",
                Name = "Legal Advisor",
                Role = UserRole.LegalAdvisor,
                MinistryId = ministryByCode["PMO"],
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "auditor@gov.vg",
                Name = "Auditor",
                Role = UserRole.Auditor,
                MinistryId = ministryByCode["PMO"],
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "admin@gov.vg",
                Name = "Admin",
                Role = UserRole.PermanentSecretary,
                MinistryId = ministryByCode["PMO"],
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
            },
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Ensure super admin exists
        if (!await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == "superadmin@govdecision.com"))
        {
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = "superadmin@govdecision.com",
                Name = "Super Admin",
                Role = UserRole.SuperAdmin,
                OrganizationId = DefaultOrgId,
                PasswordHash = passwordHash,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
            await context.SaveChangesAsync();
        }
    }
}
