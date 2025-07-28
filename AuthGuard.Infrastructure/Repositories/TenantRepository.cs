using AuthGuard.Domain.Entities;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.Infrastructure.Repositories;

public class TenantRepository : BaseRepository<Tenant>, ITenantRepository
{
    public TenantRepository(AuthGuardDbContext context) : base(context)
    {
    }

    public async Task<Tenant?> GetBySlugAsync(string slug)
    {
        return await _context.Tenants
            .Include(t => t.Branches)
            .Include(t => t.Users)
            .Include(t => t.SoftwareAccess)
                .ThenInclude(ts => ts.Software)
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive);
    }

    public async Task<Tenant?> GetByEmailAsync(string email)
    {
        return await _context.Tenants
            .FirstOrDefaultAsync(t => t.Email == email && t.IsActive);
    }

    public async Task<IEnumerable<Tenant>> GetByStatusAsync(TenantStatus status)
    {
        return await _context.Tenants
            .Where(t => t.Status == status && t.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Tenant>> GetActiveTenantsAsync()
    {
        return await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active && t.IsActive)
            .Include(t => t.Branches.Where(b => b.IsActive))
            .Include(t => t.Users.Where(u => u.Status == UserStatus.Active))
            .ToListAsync();
    }

    public async Task<int> GetActiveTenantsCountAsync()
    {
        return await _context.Tenants
            .CountAsync(t => t.Status == TenantStatus.Active && t.IsActive);
    }

    public async Task<decimal> GetTotalMonthlyRevenueAsync()
    {
        return await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active && t.IsActive)
            .SumAsync(t => t.MonthlyRate);
    }

    public async Task<IEnumerable<Tenant>> GetTenantsWithExpiringSubscriptionAsync(int daysAhead)
    {
        var targetDate = DateTime.UtcNow.AddDays(daysAhead);
        return await _context.Tenants
            .Where(t => t.Status == TenantStatus.Active && 
                       t.IsActive && 
                       t.SubscriptionEndDate.HasValue &&
                       t.SubscriptionEndDate <= targetDate)
            .ToListAsync();
    }

    public async Task<bool> SlugExistsAsync(string slug)
    {
        return await _context.Tenants
            .AnyAsync(t => t.Slug == slug && t.IsActive);
    }
} 