namespace DiscretionaryPowers.Domain.Interfaces;

public interface ITenantService
{
    Guid? CurrentTenantId { get; }
    void SetTenant(Guid tenantId);
}
