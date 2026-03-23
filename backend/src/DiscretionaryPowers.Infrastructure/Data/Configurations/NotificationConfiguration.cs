using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(n => n.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(n => n.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(n => n.DecisionId).HasColumnName("decision_id");
        builder.Property(n => n.Type)
            .HasColumnName("type")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<NotificationType>(EnumConverter.ToPascalCase(v)))
            .IsRequired();
        builder.Property(n => n.Title).HasColumnName("title").IsRequired();
        builder.Property(n => n.Message).HasColumnName("message").IsRequired();
        builder.Property(n => n.Read).HasColumnName("read").HasDefaultValue(false);
        builder.Property(n => n.SentAt).HasColumnName("sent_at").HasDefaultValueSql("now()");
        builder.Property(n => n.ReadAt).HasColumnName("read_at");

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.Decision)
            .WithMany()
            .HasForeignKey(n => n.DecisionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
