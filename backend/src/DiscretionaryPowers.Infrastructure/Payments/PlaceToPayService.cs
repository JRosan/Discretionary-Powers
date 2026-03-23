using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
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

    public PlaceToPayService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<PlaceToPayService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("PlaceToPay");
        _login = configuration["PlaceToPay:Login"] ?? "";
        _secretKey = configuration["PlaceToPay:SecretKey"] ?? "";
        _endpoint = configuration["PlaceToPay:Endpoint"] ?? "https://checkout-test.placetopay.com";
        _logger = logger;
    }

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
    /// Create a checkout session for subscription payment.
    /// Returns (processUrl, requestId, error).
    /// </summary>
    public async Task<(string? ProcessUrl, string? RequestId, string? Error)> CreateSession(
        string reference, string description, decimal amount, string currency,
        string returnUrl, string ipAddress, string? userAgent,
        string? buyerName = null, string? buyerEmail = null)
    {
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
