using System.ComponentModel.DataAnnotations;

namespace AuthGuard.Domain.Entities;

public class SoftwareLicense : BaseEntity
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public Guid SoftwareId { get; set; }
    
    public LicenseType Type { get; set; } = LicenseType.PerUser;
    
    public int MaxUsers { get; set; } = 1;
    
    public decimal Price { get; set; } = 0;
    
    public string? Currency { get; set; } = "BRL";
    
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    
    public new bool IsActive { get; set; } = true;
    
    public DateTime? ValidFrom { get; set; }
    
    public DateTime? ValidTo { get; set; }
    
    public string? Features { get; set; } // JSON features
    
    public string? Limitations { get; set; } // JSON limitations
    
    // Navigation properties
    public virtual Software Software { get; set; } = null!;
    
    public virtual ICollection<TenantLicense> TenantLicenses { get; set; } = new List<TenantLicense>();
}

public enum LicenseType
{
    PerUser,
    PerTenant,
    PerBranch,
    Unlimited,
    Custom
}

public enum BillingCycle
{
    Monthly,
    Quarterly,
    Yearly,
    OneTime
} 