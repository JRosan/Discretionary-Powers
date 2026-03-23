using Amazon.S3;
using DiscretionaryPowers.Domain.Auth;
using DiscretionaryPowers.Domain.Interfaces;
using DiscretionaryPowers.Infrastructure.Data;
using DiscretionaryPowers.Infrastructure.Email;
using DiscretionaryPowers.Infrastructure.Services;
using DiscretionaryPowers.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DiscretionaryPowers.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        // S3 / MinIO storage
        services.AddSingleton<IAmazonS3>(_ =>
        {
            var config = new AmazonS3Config
            {
                ServiceURL = configuration["Storage:Endpoint"] ?? "http://localhost:9000",
                ForcePathStyle = true,
            };
            var accessKey = configuration["Storage:AccessKey"] ?? "minioadmin";
            var secretKey = configuration["Storage:SecretKey"] ?? "minioadmin";
            return new AmazonS3Client(accessKey, secretKey, config);
        });
        services.AddSingleton<IStorageAdapter, S3StorageAdapter>();

        // Email - prefer Microsoft Graph, fall back to SMTP
        if (!string.IsNullOrEmpty(configuration["MsGraph:ClientId"]))
            services.AddTransient<IEmailService, GraphEmailService>();
        else
            services.AddTransient<IEmailService, SmtpEmailService>();

        // HTTP context
        services.AddHttpContextAccessor();

        // Application services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<DecisionService>();
        services.AddScoped<ExportService>();
        services.AddScoped<AuditService>();
        services.AddScoped<CommentService>();
        services.AddScoped<NotificationService>();
        services.AddSingleton<MfaService>();

        return services;
    }
}
