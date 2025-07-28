using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class UserSoftware : BaseEntity
{
    // Foreign Keys
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid SoftwareId { get; set; }
    
    // Properties
    public bool IsEnabled { get; set; } = true;
    
    public DateTime? AccessGrantedAt { get; set; }
    
    public DateTime? AccessRevokedAt { get; set; }
    
    public string? CustomConfig { get; set; } // JSON configuration
    
    public string? IntegrationToken { get; set; }
    
    public string? ExternalId { get; set; }
    
    public DateTime? LastAccessAt { get; set; }
    
    public string? LastAccessIp { get; set; }
    
    public string? LastAccessUserAgent { get; set; }
    
    public int AccessCount { get; set; } = 0;
    
    public string? Permissions { get; set; } // JSON permissions
    
    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
    
    [ForeignKey(nameof(SoftwareId))]
    public virtual Software Software { get; set; } = null!;
} 