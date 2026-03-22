namespace DiscretionaryPowers.Domain.Interfaces;

public interface IStorageAdapter
{
    Task<string> GetUploadUrl(string key, string contentType, int expirationMinutes = 15);
    Task<string> GetDownloadUrl(string key, int expirationMinutes = 15);
    Task DeleteObject(string key);
}
