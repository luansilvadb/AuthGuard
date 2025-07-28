using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthGuard.Domain.Entities;

public class BranchSoftware : BaseEntity
{
    // Foreign Keys
    [Required]
    public Guid BranchId { get; set; }
    
    [Required]
    public Guid SoftwareId { get; set; }
    
    // Properties
    public bool IsEnabled { get; set; } = true;
    
    public DateTime? AccessGrantedAt { get; set; }
    
    public DateTime? AccessRevokedAt { get; set; }
    
    public int MaxUsers { get; set; } = 5;
    
    public string? CustomConfig { get; set; } // JSON configuration
    
    public string? IntegrationToken { get; set; }
    
    public string? ExternalId { get; set; }
    
    public DateTime? LastSyncAt { get; set; }
    
    public string? SyncStatus { get; set; }
    
    // Navigation properties
    [ForeignKey(nameof(BranchId))]
    public virtual Branch Branch { get; set; } = null!;
    
    [ForeignKey(nameof(SoftwareId))]
    public virtual Software Software { get; set; } = null!;
} 