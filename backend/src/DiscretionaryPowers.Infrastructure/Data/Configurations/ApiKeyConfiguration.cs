using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.ToTable("api_keys");

        builder.HasKey(k => k.Id);
        builder.Property(k => k.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(k => k.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(k => k.Name).HasColumnName("name").IsRequired();
        builder.Property(k => k.KeyHash).HasColumnName("key_hash").IsRequired();
        builder.Property(k => k.KeyPrefix).HasColumnName("key_prefix").IsRequired();
        builder.Property(k => k.Scopes).HasColumnName("scopes").HasDefaultValueSql("'{}'");
        builder.Property(k => k.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(k => k.ExpiresAt).HasColumnName("expires_at");
        builder.Property(k => k.LastUsedAt).HasColumnName("last_used_at");
        builder.Property(k => k.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

        builder.HasOne(k => k.Organization)
            .WithMany()
            .HasForeignKey(k => k.OrganizationId);

        builder.HasIndex(k => k.OrganizationId).HasDatabaseName("idx_api_keys_org");
        builder.HasIndex(k => k.KeyHash).HasDatabaseName("idx_api_keys_hash");
    }
}
