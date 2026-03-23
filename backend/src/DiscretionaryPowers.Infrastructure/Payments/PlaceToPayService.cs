using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DiscretionaryPowers.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DiscretionaryPowers.Infrastructure.Payments;

public class PlaceToPayService
{
    private readonly HttpClient _httpClient;
    private readonly string _login;
    private readonly string _secretKey;
    private readonly string _endpoint;
    private readonly ILogger<PlaceToPayService> _logger;

    private readonly bool _isMockMode;

    public PlaceToPayService(
        AppDbContext db,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<PlaceToPayService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("PlaceToPay");
        _logger = logger;

        // Try DB config first, fall back to appsettings
        var dbLogin = db.PlatformConfigs.AsNoTracking()
            .FirstOrDefault(c => c.Key == "placetopay:login")?.Value;
        var dbSecret = db.PlatformConfigs.AsNoTracking()
            .FirstOrDefault(c => c.Key == "placetopay:secret_key")?.Value;
        var dbEndpoint = db.PlatformConfigs.AsNoTracking()
            .FirstOrDefault(c => c.Key == "placetopay:endpoint")?.Value;

        _login = !string.IsNullOrEmpty(dbLogin) ? dbLogin : (configuration["PlaceToPay:Login"] ?? "");
        _secretKey = !string.IsNullOrEmpty(dbSecret) ? dbSecret : (configuration["PlaceToPay:SecretKey"] ?? "");
        _endpoint = !string.IsNullOrEmpty(dbEndpoint) ? dbEndpoint : (configuration["PlaceToPay:Endpoint"] ?? "https://checkout-test.placetopay.com");
        _isMockMode = string.IsNullOrEmpty(_login) || string.IsNullOrEmpty(_secretKey);

        if (_isMockMode)
            _logger.LogWarning("PlaceToPay credentials not configured — running in MOCK payment mode");
    }

    public bool IsMockMode => _isMockMode;

    private object BuildAuth()
    {
        var nonce = Guid.NewGuid().ToString("N");
        var seed = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:sszzz");
        var rawNonce = Encoding.UTF8.GetBytes(nonce);
        var tranKey = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(nonce + seed + _secretKey)));
        return new
        {
            login = _login,
            tranKey,
            nonce = Convert.ToBase64String(rawNonce),
            seed
        };
    }

    /// <summary>
    /// Test the PlaceToPay connection by attempting to build auth and call the API.
    /// </summary>
    public async Task<(bool Success, string Message)> TestConnection()
    {
        if (_isMockMode)
            return (false, "Payment gateway credentials are not configured. Please set the PlaceToPay Login and Secret Key.");

        try
        {
            var body = new { auth = BuildAuth() };
            // Use a simple session query to test connectivity
            var response = await _httpClient.PostAsJsonAsync($"{_endpoint}/api/session/0", body);
            // Even a 'not found' response means the API is reachable and auth format is accepted
            if (response.IsSuccessStatusCode || (int)response.StatusCode < 500)
            {
                return (true, $"Successfully connected to PlaceToPay at {_endpoint}");
            }
            return (false, $"PlaceToPay returned HTTP {(int)response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PlaceToPay connection test failed");
            return (false, $"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Create a checkout session for subscription payment.
    /// Returns (processUrl, requestId, error).
    /// </summary>
    public async Task<(string? ProcessUrl, string? RequestId, string? Error)> CreateSession(
        string reference, string description, decimal amount, string currency,
        string returnUrl, string ipAddress, string? userAgent,
        string? buyerName = null, string? buyerEmail = null)
    {
        if (_isMockMode)
        {
            var mockRequestId = $"mock_{Guid.NewGuid():N}";
            // In mock mode, redirect back to the callback URL with the mock request ID
            var separator = returnUrl.Contains('?') ? "&" : "?";
            var mockUrl = $"{returnUrl}{separator}requestId={mockRequestId}";
            _logger.LogInformation("MOCK payment session created: {RequestId} for {Amount} {Currency}", mockRequestId, amount, currency);
            return (mockUrl, mockRequestId, null);
        }

        var body = new Dictionary<string, object?>
        {
            ["auth"] = BuildAuth(),
            ["payment"] = new
            {
                reference,
                description,
                amount = new { currency, total = amount }
            },
            ["expiration"] = DateTime.UtcNow.AddHours(1).ToString("yyyy-MM-ddTHH:mm:sszzz"),
            ["returnUrl"] = returnUrl,
            ["ipAddress"] = ipAddress,
            ["userAgent"] = userAgent ?? "GovDecision/1.0"
        };

        if (buyerName != null)
        {
            body["buyer"] = new { name = buyerName, email = buyerEmail };
        }

        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{_endpoint}/api/session", body);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            var status = json.GetProperty("status").GetProperty("status").GetString();

            if (status == "OK")
            {
                return (
                    json.GetProperty("processUrl").GetString(),
                    json.GetProperty("requestId").ToString(),
                    null
                );
            }

            var message = json.GetProperty("status").GetProperty("message").GetString();
            _logger.LogWarning("PlaceToPay session creation failed: {Status} - {Message}", status, message);
            return (null, null, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PlaceToPay API error during session creation");
            return (null, null, "Payment service is temporarily unavailable");
        }
    }

    /// <summary>
    /// Check payment session status from PlaceToPay.
    /// </summary>
    public async Task<PlaceToPaySessionStatus> GetSessionStatus(string requestId)
    {
        if (_isMockMode || requestId.StartsWith("mock_"))
        {
            _logger.LogInformation("MOCK payment status check: {RequestId} → APPROVED", requestId);
            return new PlaceToPaySessionStatus
            {
                Status = "APPROVED",
                Reason = "00",
                Message = "Mock payment approved",
                Date = DateTime.UtcNow.ToString("o"),
            };
        }

        try
        {
            var body = new { auth = BuildAuth() };
            var response = await _httpClient.PostAsJsonAsync($"{_endpoint}/api/session/{requestId}", body);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            var status = json.GetProperty("status");
            return new PlaceToPaySessionStatus
            {
                Status = status.GetProperty("status").GetString() ?? "UNKNOWN",
                Reason = status.TryGetProperty("reason", out var r) ? r.GetString() : null,
                Message = status.TryGetProperty("message", out var m) ? m.GetString() : null,
                Date = status.TryGetProperty("date", out var d) ? d.GetString() : null,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PlaceToPay API error during status check for requestId={RequestId}", requestId);
            return new PlaceToPaySessionStatus
            {
                Status = "ERROR",
                Message = "Unable to check payment status"
            };
        }
    }
}

public class PlaceToPaySessionStatus
{
    public string Status { get; set; } = null!;  // APPROVED, REJECTED, PENDING, EXPIRED
    public string? Reason { get; set; }
    public string? Message { get; set; }
    public string? Date { get; set; }
}
