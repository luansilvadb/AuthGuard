using AuthGuard.Domain.Entities;

namespace AuthGuard.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<IEnumerable<User>> GetActiveAsync();
    Task<User> AddAsync(User entity);
    Task<User> UpdateAsync(User entity);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> CountAsync();
    
    // Métodos específicos para User
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUserNameAsync(string userName);
    Task<IEnumerable<User>> GetByTenantAsync(Guid tenantId);
    Task<IEnumerable<User>> GetByBranchAsync(Guid branchId);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task<IEnumerable<User>> GetByStatusAsync(UserStatus status);
    Task<IEnumerable<User>> GetActiveUsersAsync();
    Task<int> GetActiveUsersCountAsync();
    Task<int> GetUsersCountByTenantAsync(Guid tenantId);
    Task<int> GetUsersCountByBranchAsync(Guid branchId);
    Task<IEnumerable<User>> GetUsersWithExpiringAccessAsync(int daysAhead);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> UserNameExistsAsync(string userName);
} 