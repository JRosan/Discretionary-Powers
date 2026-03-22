using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class DecisionStepConfiguration : IEntityTypeConfiguration<DecisionStep>
{
    public void Configure(EntityTypeBuilder<DecisionStep> builder)
    {
        builder.ToTable("decision_steps");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(s => s.DecisionId).HasColumnName("decision_id").IsRequired();
        builder.Property(s => s.StepNumber).HasColumnName("step_number").IsRequired();
        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<StepStatus>(EnumConverter.ToPascalCase(v)))
            .IsRequired()
            .HasDefaultValueSql("'not_started'");
        builder.Property(s => s.StartedAt).HasColumnName("started_at");
        builder.Property(s => s.CompletedAt).HasColumnName("completed_at");
        builder.Property(s => s.CompletedBy).HasColumnName("completed_by");
        builder.Property(s => s.Data).HasColumnName("data").HasColumnType("jsonb");
        builder.Property(s => s.Notes).HasColumnName("notes");
        builder.Property(s => s.Evidence).HasColumnName("evidence").HasColumnType("jsonb");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasIndex(s => new { s.DecisionId, s.StepNumber })
            .IsUnique()
            .HasDatabaseName("decision_steps_decision_step_unique");

        builder.HasOne(s => s.Decision)
            .WithMany(d => d.Steps)
            .HasForeignKey(s => s.DecisionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
