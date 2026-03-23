using DiscretionaryPowers.Domain.Interfaces;

namespace DiscretionaryPowers.Infrastructure.Services;

public class TenantService : ITenantService
{
    public Guid? CurrentTenantId { get; private set; }
    public void SetTenant(Guid tenantId) => CurrentTenantId = tenantId;
}
