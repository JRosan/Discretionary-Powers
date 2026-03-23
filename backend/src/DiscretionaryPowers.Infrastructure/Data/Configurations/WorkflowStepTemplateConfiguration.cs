using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class WorkflowStepTemplateConfiguration : IEntityTypeConfiguration<WorkflowStepTemplate>
{
    public void Configure(EntityTypeBuilder<WorkflowStepTemplate> builder)
    {
        builder.ToTable("workflow_step_templates");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(s => s.WorkflowTemplateId).HasColumnName("workflow_template_id").IsRequired();
        builder.Property(s => s.StepNumber).HasColumnName("step_number").IsRequired();
        builder.Property(s => s.Name).HasColumnName("name").IsRequired();
        builder.Property(s => s.Description).HasColumnName("description").IsRequired();
        builder.Property(s => s.GuidanceTips).HasColumnName("guidance_tips");
        builder.Property(s => s.LegalReference).HasColumnName("legal_reference");
        builder.Property(s => s.ChecklistItems).HasColumnName("checklist_items");
        builder.Property(s => s.IsRequired).HasColumnName("is_required").HasDefaultValue(true);

        builder.HasIndex(s => new { s.WorkflowTemplateId, s.StepNumber }).IsUnique();
    }
}
