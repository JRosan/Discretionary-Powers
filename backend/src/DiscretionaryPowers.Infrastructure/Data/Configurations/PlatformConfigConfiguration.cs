using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class PlatformConfigConfiguration : IEntityTypeConfiguration<PlatformConfig>
{
    public void Configure(EntityTypeBuilder<PlatformConfig> builder)
    {
        builder.ToTable("platform_configs");

        builder.HasKey(c => c.Key);
        builder.Property(c => c.Key).HasColumnName("key");
        builder.Property(c => c.Value).HasColumnName("value").IsRequired();
        builder.Property(c => c.IsSecret).HasColumnName("is_secret").HasDefaultValue(false);
        builder.Property(c => c.Description).HasColumnName("description");
        builder.Property(c => c.Category).HasColumnName("category").IsRequired().HasDefaultValue("general");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");
    }
}
