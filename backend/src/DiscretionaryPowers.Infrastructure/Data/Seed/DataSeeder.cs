using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Data.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Ministries.AnyAsync())
            return;

        var ministries = new List<Ministry>
        {
            new() { Name = "Ministry of Finance", Code = "FIN" },
            new() { Name = "Ministry of Natural Resources, Labour and Immigration", Code = "NAT" },
            new() { Name = "Ministry of Education, Culture, Youth Affairs and Sports", Code = "EDU" },
            new() { Name = "Ministry of Health and Social Development", Code = "HEA" },
            new() { Name = "Ministry of Communications and Works", Code = "COM" },
            new() { Name = "Premier's Office", Code = "PMO" },
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
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "secretary@gov.vg",
                Name = "Permanent Secretary",
                Role = UserRole.PermanentSecretary,
                MinistryId = ministryByCode["FIN"],
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "legal@gov.vg",
                Name = "Legal Advisor",
                Role = UserRole.LegalAdvisor,
                MinistryId = ministryByCode["PMO"],
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "auditor@gov.vg",
                Name = "Auditor",
                Role = UserRole.Auditor,
                MinistryId = ministryByCode["PMO"],
                PasswordHash = passwordHash,
            },
            new()
            {
                Email = "admin@gov.vg",
                Name = "Admin",
                Role = UserRole.PermanentSecretary,
                MinistryId = ministryByCode["PMO"],
                PasswordHash = passwordHash,
            },
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();
    }
}
