using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class LoginEventConfiguration : IEntityTypeConfiguration<LoginEvent>
{
    public void Configure(EntityTypeBuilder<LoginEvent> builder)
    {
        builder.ToTable("login_events");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(e => e.UserId).HasColumnName("user_id");
        builder.Property(e => e.Email).HasColumnName("email").IsRequired();
        builder.Property(e => e.OrganizationId).HasColumnName("organization_id");
        builder.Property(e => e.Status).HasColumnName("status").IsRequired();
        builder.Property(e => e.IpAddress).HasColumnName("ip_address");
        builder.Property(e => e.UserAgent).HasColumnName("user_agent");
        builder.Property(e => e.FailureReason).HasColumnName("failure_reason");
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

        builder.HasIndex(e => e.Email).HasDatabaseName("idx_login_events_email");
        builder.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_login_events_created");
    }
}
