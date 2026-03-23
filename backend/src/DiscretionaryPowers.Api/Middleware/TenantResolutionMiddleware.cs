using DiscretionaryPowers.Domain.Interfaces;

namespace DiscretionaryPowers.Api.Middleware;

public class TenantResolutionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // Resolve tenant from JWT claim
        var orgClaim = context.User?.FindFirst("organization_id")?.Value;
        if (orgClaim != null && Guid.TryParse(orgClaim, out var orgId))
        {
            tenantService.SetTenant(orgId);
        }

        await next(context);
    }
}
