using AuthGuard.Domain.Entities;
using AuthGuard.Domain.Interfaces;
using AuthGuard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthGuard.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AuthGuardDbContext _context;

    public AuditService(AuthGuardDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string action, string entityType, Guid? entityId, string? entityName,
        Guid userId, string? userEmail, string? userName, Guid? tenantId, string? tenantName,
        Guid? branchId, string? branchName, string? ipAddress, string? userAgent,
        string? sessionId, string? oldValues, string? newValues, string? changes,
        string? description, AuditLogLevel level = AuditLogLevel.Info,
        bool isSuccess = true, string? errorMessage = null, string? metadata = null)
    {
        var auditLog = new AuditLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            EntityName = entityName,
            UserId = userId,
            UserEmail = userEmail,
            UserName = userName,
            TenantId = tenantId,
            TenantName = tenantName,
            BranchId = branchId,
            BranchName = branchName,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            SessionId = sessionId,
            OldValues = oldValues,
            NewValues = newValues,
            Changes = changes,
            Description = description,
            Level = level,
            IsSuccess = isSuccess,
            ErrorMessage = errorMessage,
            Metadata = metadata
        };

        await _context.AuditLogs.AddAsync(auditLog);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(Guid? tenantId = null, Guid? userId = null,
        DateTime? fromDate = null, DateTime? toDate = null, AuditLogLevel? level = null)
    {
        var query = _context.AuditLogs.AsQueryable();

        if (tenantId.HasValue)
            query = query.Where(a => a.TenantId == tenantId);

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId);

        if (fromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= fromDate);

        if (toDate.HasValue)
            query = query.Where(a => a.CreatedAt <= toDate);

        if (level.HasValue)
            query = query.Where(a => a.Level == level);

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsByEntityAsync(string entityType, Guid entityId)
    {
        return await _context.AuditLogs
            .Where(a => a.EntityType == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(Guid userId, int limit = 100)
    {
        return await _context.AuditLogs
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }
} 