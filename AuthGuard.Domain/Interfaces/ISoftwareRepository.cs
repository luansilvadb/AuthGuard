using AuthGuard.Domain.Entities;

namespace AuthGuard.Domain.Interfaces;

public interface ISoftwareRepository : IRepository<Software>
{
    Task<Software?> GetBySlugAsync(string slug);
    Task<IEnumerable<Software>> GetByCategoryAsync(SoftwareCategory category);
    Task<IEnumerable<Software>> GetByStatusAsync(SoftwareStatus status);
    Task<IEnumerable<Software>> GetActiveSoftwareAsync();
    Task<IEnumerable<Software>> GetEnabledSoftwareAsync();
    Task<bool> SlugExistsAsync(string slug);
    Task<int> GetActiveSoftwareCountAsync();
} 