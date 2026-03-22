using System.Diagnostics;
using System.Security.Claims;

namespace DiscretionaryPowers.Api.Middleware;

public class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();

            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            logger.LogInformation(
                "HTTP {Method} {Path}{QueryString} responded {StatusCode} in {Duration}ms — User: {UserId}, IP: {ClientIp}",
                context.Request.Method,
                context.Request.Path,
                context.Request.QueryString,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds,
                userId,
                clientIp);
        }
    }
}
