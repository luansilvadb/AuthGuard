using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class AuditLog : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string EntityType { get; set; } = string.Empty;
    
    public Guid? EntityId { get; set; }
    
    [MaxLength(100)]
    public string? EntityName { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [MaxLength(100)]
    public string? UserEmail { get; set; }
    
    [MaxLength(100)]
    public string? UserName { get; set; }
    
    public Guid? TenantId { get; set; }
    
    [MaxLength(100)]
    public string? TenantName { get; set; }
    
    public Guid? BranchId { get; set; }
    
    [MaxLength(100)]
    public string? BranchName { get; set; }
    
    [MaxLength(45)]
    public string? IpAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    [MaxLength(100)]
    public string? SessionId { get; set; }
    
    public string? OldValues { get; set; } // JSON
    
    public string? NewValues { get; set; } // JSON
    
    public string? Changes { get; set; } // JSON
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public AuditLogLevel Level { get; set; } = AuditLogLevel.Info;
    
    public bool IsSuccess { get; set; } = true;
    
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }
    
    public string? Metadata { get; set; } // JSON additional data
    
    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}

public enum AuditLogLevel
{
    Debug,
    Info,
    Warning,
    Error,
    Critical
} 