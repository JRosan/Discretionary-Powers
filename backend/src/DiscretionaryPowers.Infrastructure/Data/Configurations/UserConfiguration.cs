using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(u => u.Email).HasColumnName("email").IsRequired();
        builder.Property(u => u.Name).HasColumnName("name").IsRequired();
        builder.Property(u => u.PasswordHash).HasColumnName("password_hash");
        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<UserRole>(EnumConverter.ToPascalCase(v)))
            .IsRequired();
        builder.Property(u => u.MinistryId).HasColumnName("ministry_id");
        builder.Property(u => u.MfaEnabled).HasColumnName("mfa_enabled").HasDefaultValue(false);
        builder.Property(u => u.MfaSecret).HasColumnName("mfa_secret");
        builder.Property(u => u.Active).HasColumnName("active").HasDefaultValue(true);
        builder.Property(u => u.PasswordResetToken).HasColumnName("password_reset_token");
        builder.Property(u => u.PasswordResetExpiry).HasColumnName("password_reset_expiry");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.Property(u => u.OrganizationId).HasColumnName("organization_id").IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasIndex(u => u.OrganizationId).HasDatabaseName("users_organization_id_idx");

        builder.HasOne(u => u.Organization)
            .WithMany(o => o.Users)
            .HasForeignKey(u => u.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.Ministry)
            .WithMany(m => m.Users)
            .HasForeignKey(u => u.MinistryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
