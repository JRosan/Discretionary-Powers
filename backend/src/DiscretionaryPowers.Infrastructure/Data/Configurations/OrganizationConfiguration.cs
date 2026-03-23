using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("organizations");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(o => o.Name).HasColumnName("name").IsRequired();
        builder.Property(o => o.Slug).HasColumnName("slug").IsRequired();
        builder.Property(o => o.LogoUrl).HasColumnName("logo_url");
        builder.Property(o => o.PrimaryColor).HasColumnName("primary_color");
        builder.Property(o => o.AccentColor).HasColumnName("accent_color");
        builder.Property(o => o.Domain).HasColumnName("domain");
        builder.Property(o => o.HeroImageUrl).HasColumnName("hero_image_url");
        builder.Property(o => o.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(o => o.OnboardingCompleted).HasColumnName("onboarding_completed").HasDefaultValue(false);
        builder.Property(o => o.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(o => o.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasIndex(o => o.Slug).IsUnique().HasDatabaseName("organizations_slug_unique");
    }
}
