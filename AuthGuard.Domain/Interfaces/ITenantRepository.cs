using AuthGuard.Domain.Entities;

namespace AuthGuard.Domain.Interfaces;

public interface ITenantRepository : IRepository<Tenant>
{
    Task<Tenant?> GetBySlugAsync(string slug);
    Task<Tenant?> GetByEmailAsync(string email);
    Task<IEnumerable<Tenant>> GetByStatusAsync(TenantStatus status);
    Task<IEnumerable<Tenant>> GetActiveTenantsAsync();
    Task<int> GetActiveTenantsCountAsync();
    Task<decimal> GetTotalMonthlyRevenueAsync();
    Task<IEnumerable<Tenant>> GetTenantsWithExpiringSubscriptionAsync(int daysAhead);
    Task<bool> SlugExistsAsync(string slug);
} 