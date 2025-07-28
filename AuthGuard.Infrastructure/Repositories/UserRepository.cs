using AuthGuard.Domain.Entities;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AuthGuardDbContext _context;

    public UserRepository(AuthGuardDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Include(u => u.Manager)
            .Include(u => u.Subordinates)
            .Include(u => u.SoftwareAccess)
                .ThenInclude(us => us.Software)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetActiveAsync()
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Where(u => u.Status == UserStatus.Active)
            .ToListAsync();
    }

    public async Task<User> AddAsync(User entity)
    {
        await _context.Users.AddAsync(entity);
        await _context.SaveChangesAsync();
        
        return entity;
    }

    public async Task<User> UpdateAsync(User entity)
    {
        _context.Users.Update(entity);
        await _context.SaveChangesAsync();
        
        return entity;
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            entity.Status = UserStatus.Inactive;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id && u.Status != UserStatus.Inactive);
    }

    public async Task<int> CountAsync()
    {
        return await _context.Users.CountAsync(u => u.Status != UserStatus.Inactive);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Include(u => u.Manager)
            .Include(u => u.Subordinates)
            .Include(u => u.SoftwareAccess)
                .ThenInclude(us => us.Software)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByUserNameAsync(string userName)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Include(u => u.Manager)
            .Include(u => u.Subordinates)
            .Include(u => u.SoftwareAccess)
                .ThenInclude(us => us.Software)
            .FirstOrDefaultAsync(u => u.UserName == userName);
    }

    public async Task<IEnumerable<User>> GetByTenantAsync(Guid tenantId)
    {
        return await _context.Users
            .Include(u => u.Branch)
            .Include(u => u.Manager)
            .Include(u => u.SoftwareAccess)
                .ThenInclude(us => us.Software)
            .Where(u => u.TenantId == tenantId)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetByBranchAsync(Guid branchId)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Manager)
            .Include(u => u.SoftwareAccess)
                .ThenInclude(us => us.Software)
            .Where(u => u.BranchId == branchId)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Where(u => u.Role == role)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetByStatusAsync(UserStatus status)
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Where(u => u.Status == status)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetActiveUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Where(u => u.Status == UserStatus.Active)
            .ToListAsync();
    }

    public async Task<int> GetActiveUsersCountAsync()
    {
        return await _context.Users
            .CountAsync(u => u.Status == UserStatus.Active);
    }

    public async Task<int> GetUsersCountByTenantAsync(Guid tenantId)
    {
        return await _context.Users
            .CountAsync(u => u.TenantId == tenantId && u.Status == UserStatus.Active);
    }

    public async Task<int> GetUsersCountByBranchAsync(Guid branchId)
    {
        return await _context.Users
            .CountAsync(u => u.BranchId == branchId && u.Status == UserStatus.Active);
    }

    public async Task<IEnumerable<User>> GetUsersWithExpiringAccessAsync(int daysAhead)
    {
        var targetDate = DateTime.UtcNow.AddDays(daysAhead);
        return await _context.Users
            .Include(u => u.Tenant)
            .Include(u => u.Branch)
            .Where(u => u.Status == UserStatus.Active && 
                       u.LastActiveAt.HasValue &&
                       u.LastActiveAt <= targetDate)
            .ToListAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email);
    }

    public async Task<bool> UserNameExistsAsync(string userName)
    {
        return await _context.Users
            .AnyAsync(u => u.UserName == userName);
    }
} 