using DiscretionaryPowers.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class DemoRequestConfiguration : IEntityTypeConfiguration<DemoRequest>
{
    public void Configure(EntityTypeBuilder<DemoRequest> builder)
    {
        builder.ToTable("demo_requests");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(d => d.Name).HasColumnName("name").IsRequired();
        builder.Property(d => d.Email).HasColumnName("email").IsRequired();
        builder.Property(d => d.Organization).HasColumnName("organization").IsRequired();
        builder.Property(d => d.JobTitle).HasColumnName("job_title").IsRequired();
        builder.Property(d => d.Country).HasColumnName("country").IsRequired();
        builder.Property(d => d.UserRange).HasColumnName("user_range");
        builder.Property(d => d.Message).HasColumnName("message");
        builder.Property(d => d.PreferredDate).HasColumnName("preferred_date");
        builder.Property(d => d.Status).HasColumnName("status").IsRequired().HasDefaultValue("pending");
        builder.Property(d => d.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
    }
}
