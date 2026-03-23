using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DiscretionaryPowers.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly Guid? _tenantId;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantId = tenantService.CurrentTenantId;
    }

    public DbSet<Organization> Organizations => Set<Organization>();
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
    public DbSet<WorkflowTemplate> WorkflowTemplates => Set<WorkflowTemplate>();
    public DbSet<WorkflowStepTemplate> WorkflowStepTemplates => Set<WorkflowStepTemplate>();
    public DbSet<DecisionTypeConfig> DecisionTypeConfigs => Set<DecisionTypeConfig>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<PaymentRecord> PaymentRecords => Set<PaymentRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global tenant filters — automatically scope all queries
        modelBuilder.Entity<Ministry>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<User>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<Decision>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<AuditEntry>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<Notification>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<Comment>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<JudicialReview>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<SystemSetting>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<Document>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<WorkflowTemplate>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<DecisionTypeConfig>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<ApiKey>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<Subscription>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
        modelBuilder.Entity<PaymentRecord>().HasQueryFilter(e => _tenantId == null || e.OrganizationId == _tenantId);
    }
}
