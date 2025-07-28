using System.ComponentModel.DataAnnotations;

namespace AuthGuard.Domain.Entities;

public class Software : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(200)]
    public string? Website { get; set; }
    
    [MaxLength(200)]
    public string? ApiEndpoint { get; set; }
    
    [MaxLength(100)]
    public string? Version { get; set; }
    
    public SoftwareCategory Category { get; set; }
    
    public SoftwareStatus Status { get; set; } = SoftwareStatus.Active;
    
    public bool IsEnabled { get; set; } = true;
    
    public bool RequiresIntegration { get; set; } = false;
    
    public string? IntegrationConfig { get; set; } // JSON configuration
    
    public string? WebhookUrl { get; set; }
    
    public string? ApiKey { get; set; }
    
    public string? ApiSecret { get; set; }
    
    public decimal BasePrice { get; set; } = 0;
    
    public decimal PricePerUser { get; set; } = 0;
    
    public int MaxUsersPerTenant { get; set; } = 100;
    
    public string? IconUrl { get; set; }
    
    public string? LogoUrl { get; set; }
    
    public string? DocumentationUrl { get; set; }
    
    public string? SupportEmail { get; set; }
    
    public string? SupportPhone { get; set; }
    
    public DateTime? LastSyncAt { get; set; }
    
    public string? SyncStatus { get; set; }
    
    // Navigation properties
    public virtual ICollection<TenantSoftware> TenantAccess { get; set; } = new List<TenantSoftware>();
    
    public virtual ICollection<BranchSoftware> BranchAccess { get; set; } = new List<BranchSoftware>();
    
    public virtual ICollection<UserSoftware> UserAccess { get; set; } = new List<UserSoftware>();
    
    public virtual ICollection<SoftwareLicense> Licenses { get; set; } = new List<SoftwareLicense>();
}

public enum SoftwareCategory
{
    CRM,
    ERP,
    PDV,
    Inventory,
    Finance,
    HR,
    Marketing,
    Analytics,
    Communication,
    ProjectManagement,
    Accounting,
    ECommerce,
    Other
}

public enum SoftwareStatus
{
    Active,
    Inactive,
    Maintenance,
    Deprecated
} 