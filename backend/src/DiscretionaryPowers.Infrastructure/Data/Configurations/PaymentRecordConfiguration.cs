using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class PaymentRecordConfiguration : IEntityTypeConfiguration<PaymentRecord>
{
    public void Configure(EntityTypeBuilder<PaymentRecord> builder)
    {
        builder.ToTable("payment_records");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(p => p.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(p => p.SubscriptionId).HasColumnName("subscription_id");
        builder.Property(p => p.RequestId).HasColumnName("request_id").IsRequired();
        builder.Property(p => p.Status).HasColumnName("status").IsRequired().HasDefaultValue("pending");
        builder.Property(p => p.Amount).HasColumnName("amount").HasColumnType("numeric(10,2)").IsRequired();
        builder.Property(p => p.Currency).HasColumnName("currency").IsRequired().HasDefaultValue("USD");
        builder.Property(p => p.Reference).HasColumnName("reference");
        builder.Property(p => p.PlaceToPayStatus).HasColumnName("placetopay_status");
        builder.Property(p => p.ReceiptNumber).HasColumnName("receipt_number");
        builder.Property(p => p.PaymentMethod).HasColumnName("payment_method");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(p => p.PaidAt).HasColumnName("paid_at");

        builder.HasOne(p => p.Subscription)
            .WithMany(s => s.PaymentRecords)
            .HasForeignKey(p => p.SubscriptionId);

        builder.HasIndex(p => p.OrganizationId).HasDatabaseName("idx_payment_records_org");
        builder.HasIndex(p => p.RequestId).HasDatabaseName("idx_payment_records_request");
    }
}
