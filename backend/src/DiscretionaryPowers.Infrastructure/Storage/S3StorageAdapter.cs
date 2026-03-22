using Amazon.S3;
using Amazon.S3.Model;
using DiscretionaryPowers.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DiscretionaryPowers.Infrastructure.Storage;

public class S3StorageAdapter : IStorageAdapter
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3StorageAdapter(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["Storage:BucketName"] ?? "discretionary-powers-documents";
    }

    public async Task<string> GetUploadUrl(string key, string contentType, int expirationMinutes = 15)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            ContentType = contentType,
        };
        var url = await _s3Client.GetPreSignedURLAsync(request);
        return url;
    }

    public async Task<string> GetDownloadUrl(string key, int expirationMinutes = 15)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
        };
        var url = await _s3Client.GetPreSignedURLAsync(request);
        return url;
    }

    public async Task DeleteObject(string key)
    {
        await _s3Client.DeleteObjectAsync(_bucketName, key);
    }
}
