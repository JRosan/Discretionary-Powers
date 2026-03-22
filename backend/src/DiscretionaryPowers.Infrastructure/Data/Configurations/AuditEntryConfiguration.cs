using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        builder.ToTable("audit_entries");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id").UseIdentityAlwaysColumn().ValueGeneratedOnAdd();
        builder.Property(a => a.DecisionId).HasColumnName("decision_id");
        builder.Property(a => a.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(a => a.Action).HasColumnName("action").IsRequired();
        builder.Property(a => a.StepNumber).HasColumnName("step_number");
        builder.Property(a => a.Detail).HasColumnName("detail").HasColumnType("jsonb");
        builder.Property(a => a.IpAddress).HasColumnName("ip_address");
        builder.Property(a => a.PreviousHash).HasColumnName("previous_hash");
        builder.Property(a => a.EntryHash).HasColumnName("entry_hash").IsRequired();
        builder.Property(a => a.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(a => a.DecisionId).HasDatabaseName("audit_entries_decision_id_idx");
        builder.HasIndex(a => a.UserId).HasDatabaseName("audit_entries_user_id_idx");
        builder.HasIndex(a => a.CreatedAt).HasDatabaseName("audit_entries_created_at_idx");

        builder.HasOne(a => a.Decision)
            .WithMany()
            .HasForeignKey(a => a.DecisionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
