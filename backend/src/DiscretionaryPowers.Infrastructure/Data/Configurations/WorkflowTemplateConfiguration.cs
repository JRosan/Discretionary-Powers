using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class WorkflowTemplateConfiguration : IEntityTypeConfiguration<WorkflowTemplate>
{
    public void Configure(EntityTypeBuilder<WorkflowTemplate> builder)
    {
        builder.ToTable("workflow_templates");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(w => w.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(w => w.Name).HasColumnName("name").IsRequired();
        builder.Property(w => w.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
        builder.Property(w => w.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(w => w.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasMany(w => w.Steps)
            .WithOne(s => s.Template)
            .HasForeignKey(s => s.WorkflowTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
