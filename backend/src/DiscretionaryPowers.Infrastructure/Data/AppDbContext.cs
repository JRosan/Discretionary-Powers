using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Ministry> Ministries => Set<Ministry>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Decision> Decisions => Set<Decision>();
    public DbSet<DecisionStep> DecisionSteps => Set<DecisionStep>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
    public DbSet<JudicialReview> JudicialReviews => Set<JudicialReview>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
