using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class JudicialReviewConfiguration : IEntityTypeConfiguration<JudicialReview>
{
    public void Configure(EntityTypeBuilder<JudicialReview> builder)
    {
        builder.ToTable("judicial_reviews");

        builder.HasKey(j => j.Id);
        builder.Property(j => j.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(j => j.DecisionId).HasColumnName("decision_id").IsRequired();
        builder.Property(j => j.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(j => j.Ground)
            .HasColumnName("ground")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<JudicialReviewGround>(EnumConverter.ToPascalCase(v)))
            .IsRequired();
        builder.Property(j => j.Status).HasColumnName("status").IsRequired().HasDefaultValue("filed");
        builder.Property(j => j.FiledDate).HasColumnName("filed_date").IsRequired();
        builder.Property(j => j.CourtReference).HasColumnName("court_reference");
        builder.Property(j => j.Outcome).HasColumnName("outcome");
        builder.Property(j => j.Notes).HasColumnName("notes");
        builder.Property(j => j.CreatedBy).HasColumnName("created_by").IsRequired();
        builder.Property(j => j.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(j => j.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasOne(j => j.Decision)
            .WithMany()
            .HasForeignKey(j => j.DecisionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
