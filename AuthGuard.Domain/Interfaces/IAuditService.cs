using AuthGuard.Domain.Entities;

namespace AuthGuard.Domain.Interfaces;

public interface IAuditService
{
    Task LogAsync(string action, string entityType, Guid? entityId, string? entityName, 
        Guid userId, string? userEmail, string? userName, Guid? tenantId, string? tenantName,
        Guid? branchId, string? branchName, string? ipAddress, string? userAgent, 
        string? sessionId, string? oldValues, string? newValues, string? changes,
        string? description, AuditLogLevel level = AuditLogLevel.Info, 
        bool isSuccess = true, string? errorMessage = null, string? metadata = null);
    
    Task<IEnumerable<AuditLog>> GetAuditLogsAsync(Guid? tenantId = null, Guid? userId = null, 
        DateTime? fromDate = null, DateTime? toDate = null, AuditLogLevel? level = null);
    
    Task<IEnumerable<AuditLog>> GetAuditLogsByEntityAsync(string entityType, Guid entityId);
    
    Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(Guid userId, int limit = 100);
} 