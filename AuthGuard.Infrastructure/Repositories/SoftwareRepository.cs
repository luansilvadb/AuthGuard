using AuthGuard.Domain.Entities;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.Infrastructure.Repositories;

public class SoftwareRepository : BaseRepository<Software>, ISoftwareRepository
{
    public SoftwareRepository(AuthGuardDbContext context) : base(context)
    {
    }

    public async Task<Software?> GetBySlugAsync(string slug)
    {
        return await _context.Software
            .Include(s => s.TenantAccess)
            .Include(s => s.BranchAccess)
            .Include(s => s.UserAccess)
            .Include(s => s.Licenses)
            .FirstOrDefaultAsync(s => s.Slug == slug && s.IsActive);
    }

    public async Task<IEnumerable<Software>> GetByCategoryAsync(SoftwareCategory category)
    {
        return await _context.Software
            .Where(s => s.Category == category && s.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Software>> GetByStatusAsync(SoftwareStatus status)
    {
        return await _context.Software
            .Where(s => s.Status == status && s.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Software>> GetActiveSoftwareAsync()
    {
        return await _context.Software
            .Where(s => s.Status == SoftwareStatus.Active && s.IsActive)
            .ToListAsync();
    }

    public async Task<IEnumerable<Software>> GetEnabledSoftwareAsync()
    {
        return await _context.Software
            .Where(s => s.IsEnabled && s.IsActive)
            .ToListAsync();
    }

    public async Task<bool> SlugExistsAsync(string slug)
    {
        return await _context.Software
            .AnyAsync(s => s.Slug == slug && s.IsActive);
    }

    public async Task<int> GetActiveSoftwareCountAsync()
    {
        return await _context.Software
            .CountAsync(s => s.Status == SoftwareStatus.Active && s.IsActive);
    }
} 