using DiscretionaryPowers.Domain.Entities;
using DiscretionaryPowers.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DiscretionaryPowers.Infrastructure.Data.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("documents");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
        builder.Property(d => d.DecisionId).HasColumnName("decision_id").IsRequired();
        builder.Property(d => d.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(d => d.Filename).HasColumnName("filename").IsRequired();
        builder.Property(d => d.OriginalFilename).HasColumnName("original_filename").IsRequired();
        builder.Property(d => d.MimeType).HasColumnName("mime_type").IsRequired();
        builder.Property(d => d.SizeBytes).HasColumnName("size_bytes").IsRequired();
        builder.Property(d => d.StorageKey).HasColumnName("storage_key").IsRequired();
        builder.Property(d => d.Classification)
            .HasColumnName("classification")
            .HasConversion(
                v => EnumConverter.ToSnakeCase(v.ToString()),
                v => Enum.Parse<DocumentClassification>(EnumConverter.ToPascalCase(v)))
            .IsRequired();
        builder.Property(d => d.UploadedBy).HasColumnName("uploaded_by").IsRequired();
        builder.Property(d => d.Version).HasColumnName("version").IsRequired().HasDefaultValue(1);
        builder.Property(d => d.IsRedacted).HasColumnName("is_redacted").HasDefaultValue(false);
        builder.Property(d => d.RedactionNotes).HasColumnName("redaction_notes");
        builder.Property(d => d.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

        builder.HasOne(d => d.Decision)
            .WithMany(dec => dec.Documents)
            .HasForeignKey(d => d.DecisionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Uploader)
            .WithMany()
            .HasForeignKey(d => d.UploadedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
