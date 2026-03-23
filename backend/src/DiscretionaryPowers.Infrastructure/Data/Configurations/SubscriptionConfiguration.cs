using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscriptions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(s => s.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(s => s.Plan).HasColumnName("plan").IsRequired().HasDefaultValue("starter");
        builder.Property(s => s.Status).HasColumnName("status").IsRequired().HasDefaultValue("active");
        builder.Property(s => s.MonthlyPrice).HasColumnName("monthly_price").HasColumnType("numeric(10,2)").HasDefaultValue(0m);
        builder.Property(s => s.Currency).HasColumnName("currency").IsRequired().HasDefaultValue("USD");
        builder.Property(s => s.PaymentToken).HasColumnName("payment_token");
        builder.Property(s => s.CurrentPeriodStart).HasColumnName("current_period_start").HasDefaultValueSql("now()");
        builder.Property(s => s.CurrentPeriodEnd).HasColumnName("current_period_end").HasDefaultValueSql("now() + interval '30 days'");
        builder.Property(s => s.CancelledAt).HasColumnName("cancelled_at");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasOne(s => s.Organization)
            .WithMany()
            .HasForeignKey(s => s.OrganizationId);

        builder.HasIndex(s => s.OrganizationId).HasDatabaseName("idx_subscriptions_org");
    }
}
