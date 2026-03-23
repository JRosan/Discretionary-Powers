using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class DecisionTypeConfigConfiguration : IEntityTypeConfiguration<DecisionTypeConfig>
{
    public void Configure(EntityTypeBuilder<DecisionTypeConfig> builder)
    {
        builder.ToTable("decision_type_configs");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(d => d.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(d => d.Code).HasColumnName("code").IsRequired();
        builder.Property(d => d.Name).HasColumnName("name").IsRequired();
        builder.Property(d => d.Description).HasColumnName("description");
        builder.Property(d => d.PublicationDeadlineDays).HasColumnName("publication_deadline_days").HasDefaultValue(30);
        builder.Property(d => d.DefaultWorkflowId).HasColumnName("default_workflow_id");
        builder.Property(d => d.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(d => d.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

        builder.HasIndex(d => new { d.OrganizationId, d.Code }).IsUnique();
    }
}
