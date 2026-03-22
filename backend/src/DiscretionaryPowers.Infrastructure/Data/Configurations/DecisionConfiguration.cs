using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class DecisionConfiguration : IEntityTypeConfiguration<Decision>
{
    public void Configure(EntityTypeBuilder<Decision> builder)
    {
        builder.ToTable("decisions");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(d => d.ReferenceNumber).HasColumnName("reference_number").IsRequired();
        builder.Property(d => d.Title).HasColumnName("title").IsRequired();
        builder.Property(d => d.Description).HasColumnName("description");
        builder.Property(d => d.MinistryId).HasColumnName("ministry_id").IsRequired();
        builder.Property(d => d.DecisionType)
            .HasColumnName("decision_type")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<DecisionType>(EnumConverter.ToPascalCase(v)))
            .IsRequired();
        builder.Property(d => d.Status)
            .HasColumnName("status")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<DecisionStatus>(EnumConverter.ToPascalCase(v)))
            .IsRequired()
            .HasDefaultValueSql("'draft'");
        builder.Property(d => d.CurrentStep).HasColumnName("current_step").IsRequired().HasDefaultValue(1);
        builder.Property(d => d.CreatedBy).HasColumnName("created_by").IsRequired();
        builder.Property(d => d.AssignedTo).HasColumnName("assigned_to");
        builder.Property(d => d.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
        builder.Property(d => d.JudicialReviewFlag).HasColumnName("judicial_review_flag").HasDefaultValue(false);
        builder.Property(d => d.Deadline).HasColumnName("deadline");
        builder.Property(d => d.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
        builder.Property(d => d.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(d => d.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasIndex(d => d.ReferenceNumber).IsUnique();
        builder.HasIndex(d => d.MinistryId).HasDatabaseName("decisions_ministry_id_idx");
        builder.HasIndex(d => d.Status).HasDatabaseName("decisions_status_idx");
        builder.HasIndex(d => d.CreatedBy).HasDatabaseName("decisions_created_by_idx");
        builder.HasIndex(d => d.AssignedTo).HasDatabaseName("decisions_assigned_to_idx");
        builder.HasIndex(d => d.ReferenceNumber).HasDatabaseName("decisions_reference_number_idx");

        builder.HasOne(d => d.Ministry)
            .WithMany(m => m.Decisions)
            .HasForeignKey(d => d.MinistryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Creator)
            .WithMany()
            .HasForeignKey(d => d.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Assignee)
            .WithMany()
            .HasForeignKey(d => d.AssignedTo)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
