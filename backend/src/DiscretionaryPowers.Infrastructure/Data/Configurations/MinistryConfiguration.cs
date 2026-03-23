using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class MinistryConfiguration : IEntityTypeConfiguration<Ministry>
{
    public void Configure(EntityTypeBuilder<Ministry> builder)
    {
        builder.ToTable("ministries");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(m => m.Name).HasColumnName("name").IsRequired();
        builder.Property(m => m.Code).HasColumnName("code").IsRequired();
        builder.Property(m => m.Active).HasColumnName("active").HasDefaultValue(true);
        builder.Property(m => m.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.Property(m => m.OrganizationId).HasColumnName("organization_id").IsRequired();

        builder.HasIndex(m => m.Code).IsUnique();
        builder.HasIndex(m => m.OrganizationId).HasDatabaseName("ministries_organization_id_idx");

        builder.HasOne(m => m.Organization)
            .WithMany(o => o.Ministries)
            .HasForeignKey(m => m.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
