using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql.NameTranslation;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var snakeCaseTranslator = new NpgsqlSnakeCaseNameTranslator();

        modelBuilder.HasPostgresEnum<UserRole>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<DecisionStatus>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<StepStatus>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<DecisionType>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<JudicialReviewGround>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<DocumentClassification>(nameTranslator: snakeCaseTranslator);
        modelBuilder.HasPostgresEnum<NotificationType>(nameTranslator: snakeCaseTranslator);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
