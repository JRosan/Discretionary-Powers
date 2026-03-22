namespace DiscretionaryPowers.Api.Middleware;

public class SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers["X-XSS-Protection"] = "1; mode=block";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers["Content-Security-Policy"] =
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;";

        if (!env.IsDevelopment())
        {
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        }

        await next(context);
    }
}
